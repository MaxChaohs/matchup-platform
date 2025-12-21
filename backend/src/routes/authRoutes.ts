import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// JWT secret key (應該從環境變數讀取，這裡使用預設值)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// 註冊新用戶
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({ error: '使用者名稱、電子郵件和密碼為必填欄位' });
    }

    // 驗證密碼長度
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少需要6個字元' });
    }

    // 驗證email格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '電子郵件格式不正確' });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: '使用者名稱或電子郵件已存在' });
    }

    // 加密密碼
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 創建新用戶
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phone: phone || undefined,
    });

    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用戶資料（不含密碼）和token
    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      user: userResponse,
      token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // 驗證必填欄位
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: '使用者名稱/電子郵件和密碼為必填欄位' });
    }

    // 查詢用戶（使用username或email）
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail.toLowerCase() }
      ]
    }).select('+password'); // 需要密碼欄位來驗證

    if (!user) {
      // 為了安全，不透露用戶是否存在
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '帳號或密碼錯誤' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回用戶資料（不含密碼）和token
    const userResponse = {
      _id: user._id.toString(),
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({
      user: userResponse,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

