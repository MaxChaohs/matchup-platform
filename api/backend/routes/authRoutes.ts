import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// 配置 Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // 構建回調 URL
  // 優先使用環境變數，否則根據環境推斷
  let callbackURL = process.env.GOOGLE_CALLBACK_URL;
  
  if (!callbackURL) {
    if (process.env.VERCEL_URL) {
      // Vercel 環境
      callbackURL = `https://${process.env.VERCEL_URL}/api/auth/google/callback`;
    } else if (process.env.NODE_ENV === 'production') {
      // 生產環境但沒有 VERCEL_URL，發出警告
      console.warn('⚠️ 警告: GOOGLE_CALLBACK_URL 環境變數未設置，請在 Vercel 環境變數中設置完整的回調 URL');
      callbackURL = 'http://localhost:3000/api/auth/google/callback'; // 默認值，但可能不正確
    } else {
      // 本地開發
      callbackURL = 'http://localhost:3000/api/auth/google/callback';
    }
  }
  
  console.log('Google OAuth Callback URL:', callbackURL);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 查找是否已有 Google 帳號
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // 查找是否已有相同 email 的帳號
          user = await User.findOne({ email: profile.emails?.[0]?.value });

          if (user) {
            // 將 Google ID 關聯到現有帳號
            user.googleId = profile.id;
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }

          // 創建新用戶
          user = new User({
            username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
            email: profile.emails?.[0]?.value || '',
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });

          await user.save();
          return done(null, user);
        } catch (error: any) {
          return done(error, null);
        }
      }
    )
  );
}

// Passport 序列化
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({ error: '請填寫所有必填欄位' });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '請輸入有效的電子郵件地址' });
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少需要 6 個字元' });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: '用戶名或電子郵件已存在' });
    }

    // 創建新用戶
    const user = new User({
      username,
      email: email.toLowerCase(),
      phone,
      password,
    });

    await user.save();

    // 生成 token
    const token = generateToken(user._id.toString());

    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      const field = Object.keys(error.keyPattern || {})[0];
      res.status(400).json({ error: `${field === 'email' ? '電子郵件' : '用戶名'}已存在` });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ error: Object.values(error.errors).map((e: any) => e.message).join(', ') });
    } else {
      res.status(500).json({ error: error.message || '註冊失敗，請稍後再試' });
    }
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '請提供使用者名稱和密碼' });
    }

    // 查找用戶（包含密碼欄位）
    const user = await User.findOne({
      $or: [
        { username },
        { email: username },
        { phone: username },
      ],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    // 檢查是否有密碼（Google 登入的用戶可能沒有密碼）
    if (!user.password) {
      return res.status(401).json({ error: '此帳號使用 Google 登入，請使用 Google 登入' });
    }

    // 驗證密碼
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    // 生成 token
    const token = generateToken(user._id.toString());

    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      token,
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Google OAuth 登入
router.get('/google', (req, res, next) => {
  // 在 Vercel 環境中，動態構建回調 URL
  if (!process.env.GOOGLE_CALLBACK_URL && process.env.VERCEL) {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || process.env.VERCEL_URL || 'localhost:3000';
    const callbackURL = `${protocol}://${host}/api/auth/google/callback`;
    
    // 更新策略的回調 URL（如果需要的話）
    // 注意：Passport 策略的回調 URL 通常在初始化時設置，但我們可以在這裡驗證
    console.log('Google OAuth callback URL:', callbackURL);
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })(req, res, next);
});

// Google OAuth 回調
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req: AuthRequest, res) => {
    if (!req.user) {
      // 獲取前端 URL，優先使用環境變數，否則嘗試從請求中推斷
      const frontendUrl = process.env.FRONTEND_URL || 
        (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    // 生成 token
    const token = generateToken(req.user._id.toString());

    // 重定向到前端並帶上 token
    // 在生產環境中，如果前後端在同一域名，使用相對路徑
    const frontendUrl = process.env.FRONTEND_URL || 
      (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:5173');
    
    // 如果前後端在同一域名（Vercel 部署），使用相對路徑
    if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
      res.redirect(`/auth/callback?token=${token}`);
    } else {
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  }
);

// 忘記密碼
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '請提供電子郵件' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // 為了安全，即使用戶不存在也返回成功訊息
      return res.json({ message: '如果該電子郵件存在，我們已發送重設密碼連結' });
    }

    // 生成重設 token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 這裡應該發送郵件，目前先返回 token（實際部署時應該通過郵件發送）
    // 在開發環境可以直接返回 token，生產環境應該通過郵件發送
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // TODO: 實作郵件發送功能
    // await sendPasswordResetEmail(user.email, resetUrl);

    // 開發環境返回 URL，生產環境只返回成功訊息
    if (process.env.NODE_ENV === 'development') {
      res.json({
        message: '重設密碼連結已生成',
        resetUrl, // 僅在開發環境返回
      });
    } else {
      res.json({ message: '如果該電子郵件存在，我們已發送重設密碼連結' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 重設密碼
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: '請提供 token 和新密碼' });
    }

    // 加密 token 以便比較
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 查找用戶
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: '無效或已過期的重設密碼 token' });
    }

    // 更新密碼
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 生成新 token
    const authToken = generateToken(user._id.toString());

    res.json({
      message: '密碼重設成功',
      token: authToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取當前用戶資訊
router.get('/me', authenticate, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;

