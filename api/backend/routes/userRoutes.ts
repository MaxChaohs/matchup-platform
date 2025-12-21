import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// 獲取所有用戶（公開，不包含密碼）
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password -__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取單個用戶（不包含密碼）
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 註冊新用戶
router.post('/register', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const { username, email, password, phone } = req.body;
    
    // 驗證必填欄位
    if (!username || !email || !password) {
      return res.status(400).json({ error: '請填寫所有必填欄位' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密碼長度至少需要 6 個字元' });
    }
    
    // 檢查是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用戶名或電子郵件已存在' });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ 
      username, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      phone 
    });
    await user.save();
    
    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '請輸入用戶名和密碼' });
    }

    // 查找用戶（支援用戶名或電子郵件）
    const user = await User.findOne({
      $or: [
        { username },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用戶名或密碼錯誤' });
    }

    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 創建用戶（保留原有 API，但不包含密碼）
router.post('/', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const { username, email, phone, avatar } = req.body;
    
    // 檢查是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(200).json(existingUser); // 返回現有用戶
    }

    const user = new User({ username, email, phone, avatar });
    await user.save();
    
    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 更新用戶資訊
router.put('/:id', async (req, res) => {
  try {
    // 檢查 MongoDB 連接狀態
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: '資料庫連接不可用，請稍後再試' });
    }

    const { username, email, phone, avatar } = req.body;
    
    // 驗證 ID 格式（MongoDB ObjectId）
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: '無效的用戶 ID 格式' });
    }
    
    // 檢查用戶是否存在
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }

    // 檢查email和username是否被其他用戶使用
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({ error: '電子郵件已被使用' });
      }
    }
    
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (usernameExists) {
        return res.status(400).json({ error: '用戶名已被使用' });
      }
    }

    // 更新用戶
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    
    // 返回用戶資訊（不包含密碼）
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 刪除用戶
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    res.json({ message: '用戶已刪除' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

