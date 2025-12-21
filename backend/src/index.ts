// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Remove mongoose import
import userRoutes from './routes/userRoutes.js';
// ... other imports

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Remove mongoose.connect(...) block

// Routes
app.use('/api/users', userRoutes);
// ... other routes

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