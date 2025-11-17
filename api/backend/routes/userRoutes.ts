import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// 獲取所有用戶（公開）
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取單個用戶
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) {
      return res.status(404).json({ error: '用戶不存在' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 創建用戶
router.post('/', async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;
    
    // 檢查是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: '用戶名或電子郵件已存在' });
    }

    const user = new User({ username, email, phone, avatar });
    await user.save();
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// 更新用戶資訊
router.put('/:id', async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;
    
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
    res.json(user);
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

