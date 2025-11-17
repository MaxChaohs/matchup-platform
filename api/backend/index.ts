import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import teamMatchRoutes from './routes/teamMatchRoutes.js';
import playerRecruitmentRoutes from './routes/playerRecruitmentRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB 連接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/match-point';

// 檢查 MongoDB 連接狀態
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 連接成功');
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    // 在 Vercel serverless 環境中，不要阻止應用啟動
    // 讓路由處理器處理數據庫錯誤
  }
};

connectDB();

// 監聽連接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 連接錯誤:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 連接已斷開');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/team-matches', teamMatchRoutes);
app.use('/api/player-recruitments', playerRecruitmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Match Point API is running' });
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

