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
    // 如果是用戶是舊資料沒有密碼，則無法登入 (或視需求處理)
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

// Google OAuth 回調
router.post('/google/callback', async (req, res) => {
  try {
    const { email, name, avatar, supabaseUserId } = req.body;

    if (!email) {
      return res.status(400).json({ error: '缺少必要資訊' });
    }

    // 1. 檢查 email 是否已存在
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = not found
      throw findError;
    }

    let user;

    if (existingUser) {
      // 2. 如果用戶已存在，更新用戶資訊（合併帳號）
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      // 更新頭像（如果 Google 提供且現有用戶沒有）
      if (avatar && !existingUser.avatar) {
        updates.avatar = avatar;
      }

      // 更新用戶名（如果 Google 提供且現有用戶沒有用戶名）
      if (name && !existingUser.username) {
        // 從 name 或 email 生成用戶名
        updates.username = name.toLowerCase().replace(/\s+/g, '_') || email.split('@')[0];
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      user = updatedUser;
    } else {
      // 3. 如果用戶不存在，建立新用戶
      // 從 name 或 email 生成用戶名
      const username = name 
        ? name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        : email.split('@')[0];

      // 確保用戶名唯一
      let finalUsername = username;
      let counter = 1;
      while (true) {
        const { data: checkUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', finalUsername)
          .maybeSingle();

        if (!checkUser) break;
        finalUsername = `${username}_${counter}`;
        counter++;
      }

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          username: finalUsername,
          email,
          avatar,
          password: null, // Google 登入的用戶沒有密碼
        }])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    res.json(formatUser(user));
  } catch (error: any) {
    console.error('Google OAuth 回調錯誤:', error);
    res.status(500).json({ error: error.message || 'Google 登入失敗' });
  }
});

export default router;

