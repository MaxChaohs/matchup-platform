import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
const jwtExpire = process.env.JWT_EXPIRE || '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, phone, password } = req.body;

    // 檢查使用者是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({ message: '使用者名稱或電子郵件已存在' });
      return;
    }

    // 加密密碼
    const passwordHash = await bcrypt.hash(password, 10);

    // 創建使用者
    const user = new User({
      username,
      email,
      phone,
      passwordHash,
    });

    await user.save();

    // 生成 JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: jwtExpire });

    res.status(201).json({
      message: '註冊成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier 可以是 username, email, 或 phone

    // 查找使用者
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
    });

    if (!user) {
      res.status(401).json({ message: '使用者名稱或密碼錯誤' });
      return;
    }

    // 檢查密碼
    if (!user.passwordHash) {
      res.status(401).json({ message: '此帳號使用社交登入，請使用社交登入方式' });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: '使用者名稱或密碼錯誤' });
      return;
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: jwtExpire });

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: '使用者不存在' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('取得個人資料錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

