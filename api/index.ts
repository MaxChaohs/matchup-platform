// Vercel serverless function - 所有 /api/* 請求都會路由到這裡
// 使用 .ts 擴展名，Vercel 會自動處理 TypeScript
import app from '../backend/src/index.ts';

// 導出給 Vercel
export default app;

