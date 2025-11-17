// Vercel serverless function - 所有 /api/* 請求都會路由到這裡
// 注意：使用 .ts 擴展名，Vercel 會自動處理 TypeScript
import app from '../backend/src/index.ts';

export default app;

