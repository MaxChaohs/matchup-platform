import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import teamMatchRoutes from './routes/teamMatchRoutes.js';
import playerRecruitmentRoutes from './routes/playerRecruitmentRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB 連接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/match-point';

// 確保 MongoDB 連接的函數（用於 serverless 環境）
const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // 已連接
  }
  
  if (mongoose.connection.readyState === 2) {
    // 正在連接，等待完成
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
      setTimeout(() => reject(new Error('連接超時')), 10000);
    });
  }
  
  // 未連接，開始連接
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 秒超時
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    throw error;
  }
};

// 初始連接嘗試
ensureConnection().catch((error) => {
  console.error('初始 MongoDB 連接失敗:', error);
});

// 監聽連接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 連接錯誤:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 連接已斷開');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB 已連接');
});

// 中間件：確保數據庫連接（用於 serverless 環境）
app.use(async (req, res, next) => {
  // 健康檢查端點不需要數據庫連接
  if (req.path === '/api/health') {
    return next();
  }
  
  try {
    await ensureConnection();
    next();
  } catch (error) {
    console.error('數據庫連接失敗:', error);
    // 不阻止請求，讓路由處理器返回適當的錯誤
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/team-matches', teamMatchRoutes);
app.use('/api/player-recruitments', playerRecruitmentRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbStatus] || 'unknown';
  
  // 嘗試連接以獲取更多信息
  let connectionError = null;
  if (dbStatus !== 1) {
    try {
      await ensureConnection();
    } catch (error: any) {
      connectionError = error.message || String(error);
    }
  }
  
  res.json({ 
    status: 'ok', 
    message: 'Match Point API is running',
    database: {
      status: dbStatusText,
      connected: mongoose.connection.readyState === 1,
      uri: process.env.MONGODB_URI ? 'configured' : 'not configured',
      error: connectionError || null,
      host: process.env.MONGODB_URI ? (process.env.MONGODB_URI.includes('@') ? 'MongoDB Atlas' : 'local') : 'unknown'
    }
  });
});

// 本地開發時啟動伺服器
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// 導出給 Vercel serverless function
export default app;

