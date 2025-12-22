// backend/src/routes/authRoutes.ts
import express from 'express';
import { supabase } from '../supabase.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

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
        message: '如果此電子郵件已註冊，您將收到密碼重設連結',
        dev_note: '此電子郵件未註冊'
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

    // 4. 在實際應用中，這裡會發送電子郵件
    const resetUrl = `/reset-password?token=${resetToken}`;

    res.json({ 
      message: '如果此電子郵件已註冊，您將收到密碼重設連結',
      dev_reset_url: resetUrl,
      dev_token: resetToken,
      dev_note: '開發模式：正式環境中，重設連結會透過電子郵件發送'
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
