import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import matchRoutes from './routes/matchRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 中間件
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 資料庫連接
connectDB();

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);

// 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ message: '伺服器運行中' });
});

// 只在非 Vercel 環境下啟動伺服器
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
  });
}

export default app;

