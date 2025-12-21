import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// 移除 mongoose
// import mongoose from 'mongoose'; 

import userRoutes from './routes/userRoutes.js';
import teamMatchRoutes from './routes/teamMatchRoutes.js';
import playerRecruitmentRoutes from './routes/playerRecruitmentRoutes.js';
import authRoutes from './routes/authRoutes.js'; // 記得引入 Auth 路由

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 移除所有 MongoDB 連接與 ensureConnection 函數 ---

// Routes
app.use('/api/auth', authRoutes); // 掛載登入註冊路由
app.use('/api/users', userRoutes);
app.use('/api/team-matches', teamMatchRoutes);
app.use('/api/player-recruitments', playerRecruitmentRoutes);

// Health check (更新為不檢查 DB 狀態)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Match Point API is running (Supabase)',
    timestamp: new Date().toISOString()
  });
});

// 本地開發時啟動伺服器 (Vercel 環境不會執行這段)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

// 導出給 Vercel serverless function
export default app;