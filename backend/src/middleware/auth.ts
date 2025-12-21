import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 從 header 獲取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '未提供認證 token' });
      return;
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴

    // 驗證 token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // 查找用戶
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ error: '用戶不存在' });
      return;
    }

    // 附加用戶資訊到 request
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: '無效的 token' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token 已過期' });
    } else {
      res.status(401).json({ error: '認證失敗' });
    }
  }
};

// 生成 JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

