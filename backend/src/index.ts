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

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 連接成功');
  })
  .catch((error) => {
    console.error('❌ MongoDB 連接失敗:', error);
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

