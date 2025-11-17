// Vercel serverless function - 所有 /api/* 請求都會路由到這裡
// 注意：使用相對路徑導入同目錄下的 backend 文件
import app from './backend/index.js';

// 導出給 Vercel
export default app;

