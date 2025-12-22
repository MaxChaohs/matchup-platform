// api/backend/routes/authRoutes.ts
import express from 'express';
import { supabase } from '../supabase.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Helper: 格式化用戶資料 (隱藏密碼)
const formatUser = (user: any) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return { ...userWithoutPassword, _id: user.id }; // 保持前端相容性
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

export default router;
