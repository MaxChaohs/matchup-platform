# MATCH POINT 平台

運動與電子競技約戰平台

## 技術棧

### 前端
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (狀態管理)
- Axios (HTTP 客戶端)
- React Hook Form (表單處理)

### 後端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (認證)
- bcryptjs (密碼加密)

## 專案結構

```
match-point/
├── frontend/          # 前端專案
│   ├── src/
│   │   ├── pages/     # 頁面元件
│   │   ├── services/  # API 服務
│   │   ├── store/     # 狀態管理
│   │   ├── types/     # TypeScript 類型
│   │   └── App.tsx
│   └── package.json
│
└── backend/           # 後端專案
    ├── src/
    │   ├── routes/     # 路由
    │   ├── controllers/# 控制器
    │   ├── models/     # 資料模型
    │   ├── middleware/ # 中間件
    │   ├── config/     # 設定檔
    │   └── app.ts
    └── package.json
```

## 安裝與運行

### 前置需求
- Node.js (v18 或以上)
- MongoDB (本地或遠端)

### 後端設置

1. 進入後端目錄：
```bash
cd backend
```

2. 安裝依賴：
```bash
npm install
```

3. 創建 `.env` 檔案：
   
   在 `backend` 目錄下創建 `.env` 檔案，內容如下：
   
   **本地 MongoDB：**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/match-point
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=7d
   ```
   
   **MongoDB Atlas（雲端）：**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/match-point?retryWrites=true&w=majority
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRE=7d
   ```
   
   ⚠️ **重要**：請將 `username` 和 `password` 替換為您的實際 MongoDB 憑證

4. 啟動 MongoDB（如果使用本地 MongoDB）

5. 運行後端：
```bash
npm run dev
```

後端將運行在 `http://localhost:5000`

### 前端設置

1. 進入前端目錄：
```bash
cd frontend
```

2. 安裝依賴：
```bash
npm install
```

3. 創建 `.env` 檔案（可選）：
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. 運行前端：
```bash
npm run dev
```

前端將運行在 `http://localhost:5173`

## API 端點

### 認證
- `POST /api/auth/register` - 註冊
- `POST /api/auth/login` - 登入
- `GET /api/auth/profile` - 取得個人資料（需要認證）

### 比賽
- `POST /api/matches` - 創建比賽（需要認證）
- `GET /api/matches` - 取得比賽列表
- `GET /api/matches/:id` - 取得比賽詳情
- `GET /api/matches/user/matches` - 取得使用者的比賽（需要認證）

## 功能

- ✅ 使用者註冊與登入
- ✅ JWT 認證
- ✅ 創建比賽
- ✅ 瀏覽比賽列表
- ✅ 個人中心
- ✅ 查看創建與參與的比賽
- 🔄 社交登入（Apple、Google、Facebook）- 待實作
- 🔄 忘記密碼功能 - 待實作

## 開發說明

### 後端開發
- 使用 TypeScript
- 使用 Mongoose 進行資料庫操作
- JWT 用於認證
- 使用 Express 中間件處理請求

### 前端開發
- 使用 React Hooks
- Zustand 進行狀態管理
- React Router 處理路由
- Tailwind CSS 進行樣式設計

## 注意事項

1. 確保 MongoDB 正在運行
2. 後端和前端需要同時運行
3. 預設後端運行在 5000 端口，前端在 5173 端口
4. 生產環境請更改 JWT_SECRET

