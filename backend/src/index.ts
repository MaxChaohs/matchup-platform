// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Remove mongoose import
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Remove mongoose.connect(...) block

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // 新增這行
app.use('/api/users', userRoutes);


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Match Point API is running' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

export default app;