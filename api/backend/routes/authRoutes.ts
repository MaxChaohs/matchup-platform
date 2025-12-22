// api/backend/routes/authRoutes.ts
import express from 'express';
import { supabase } from '../supabase.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';

const router = express.Router();

// 初始化 Resend（如果有 API Key）
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// 前端 URL（用於重設密碼連結）
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://matchup-platform.vercel.app';

// Helper: 格式化用戶資料 (隱藏密碼和 reset token)
const formatUser = (user: any) => {
  if (!user) return null;
  const { password, reset_token, reset_token_expires, ...userWithoutSensitive } = user;
  return { ...userWithoutSensitive, _id: user.id }; // 保持前端相容性
};

// Helper: 生成隨機 token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Helper: 發送密碼重設郵件
const sendPasswordResetEmail = async (email: string, username: string, resetToken: string) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  if (!resend) {
    console.log('Resend 未設定，無法發送郵件');
    console.log('重設連結:', resetUrl);
    return { success: false, dev_mode: true, resetUrl };
  }

  try {
    await resend.emails.send({
      from: 'Match Point <onboarding@resend.dev>', // 使用 Resend 的預設發送地址（或您驗證的網域）
      to: email,
      subject: '重設您的 Match Point 密碼',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px; font-weight: bold;">M</span>
              </div>
              <h1 style="color: #18181b; margin-top: 20px; font-size: 24px;">Match Point</h1>
            </div>
            
            <h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">密碼重設請求</h2>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">您好 <strong>${username}</strong>，</p>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">我們收到了您的密碼重設請求。請點擊下方按鈕重設您的密碼：</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                重設密碼
              </a>
            </div>
            
            <p style="color: #71717a; font-size: 14px; line-height: 1.6;">此連結將在 <strong>1 小時後</strong>失效。</p>
            
            <p style="color: #71717a; font-size: 14px; line-height: 1.6;">如果您沒有請求重設密碼，請忽略此郵件，您的密碼不會被更改。</p>
            
            <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
            
            <p style="color: #a1a1aa; font-size: 12px; text-align: center;">
              如果按鈕無法點擊，請複製以下連結到瀏覽器：<br>
              <a href="${resetUrl}" style="color: #22c55e; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin-top: 20px;">
              © 2024 Match Point. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });
    
    console.log('密碼重設郵件已發送至:', email);
    return { success: true };
  } catch (error: any) {
    console.error('發送郵件失敗:', error);
    return { success: false, error: error.message };
  }
};

// 註冊 (Register)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 1. 檢查是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: '用戶名或電子郵件已存在' });
    }

    // 2. 加密密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. 建立用戶
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ 
        username, 
        email, 
        password: hashedPassword, 
        phone 
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(formatUser(newUser));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 登入 (Login)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. 尋找用戶
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: '帳號或密碼錯誤' });
    }

    // 2. 驗證密碼
    if (!user.password) {
        return res.status(400).json({ error: '此帳號尚未設定密碼，請聯繫管理員' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '帳號或密碼錯誤' });
    }

    res.json(formatUser(user));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 忘記密碼 - 發送重設連結
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '請提供電子郵件' });
    }

    // 1. 尋找用戶
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .maybeSingle();

    // 為了安全性，不管用戶是否存在都返回相同訊息
    if (!user) {
      return res.json({ 
        message: '如果此電子郵件已註冊，您將收到密碼重設連結'
      });
    }

    // 2. 生成重設 token
    const resetToken = generateResetToken();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 小時後過期

    // 3. 儲存 token 到資料庫
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 4. 發送密碼重設郵件
    const emailResult = await sendPasswordResetEmail(user.email, user.username, resetToken);

    // 如果是開發模式（沒有設定 Resend），返回重設連結供測試
    if (emailResult.dev_mode) {
      return res.json({ 
        message: '如果此電子郵件已註冊，您將收到密碼重設連結',
        dev_reset_url: emailResult.resetUrl,
        dev_token: resetToken,
        dev_note: '開發模式：請設定 RESEND_API_KEY 環境變數以啟用郵件發送'
      });
    }

    if (!emailResult.success) {
      console.error('郵件發送失敗:', emailResult.error);
      // 即使郵件發送失敗，也不要洩露此資訊給用戶
    }

    res.json({ 
      message: '如果此電子郵件已註冊，您將收到密碼重設連結'
    });
  } catch (error: any) {
    console.error('忘記密碼錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

// 重設密碼
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: '請提供 token 和新密碼' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密碼長度至少 6 個字元' });
    }

    // 1. 尋找具有此 token 的用戶
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('id, reset_token, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (!user) {
      return res.status(400).json({ error: '無效的重設連結' });
    }

    // 2. 檢查 token 是否過期
    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: '重設連結已過期，請重新申請' });
    }

    // 3. 加密新密碼
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. 更新密碼並清除 token
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ 
      message: '密碼已成功重設，請使用新密碼登入',
      success: true
    });
  } catch (error: any) {
    console.error('重設密碼錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

// 驗證重設 token 是否有效
router.get('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: '缺少 token' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .maybeSingle();

    if (!user) {
      return res.json({ valid: false, error: '無效的重設連結' });
    }

    if (user.reset_token_expires && new Date(user.reset_token_expires) < new Date()) {
      return res.json({ valid: false, error: '重設連結已過期' });
    }

    res.json({ valid: true });
  } catch (error: any) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

export default router;
