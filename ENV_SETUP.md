# 環境變數設定說明

## .env 檔案位置

專案需要兩個 `.env` 檔案：

### 1. 前端 .env（專案根目錄）

**位置**: `/.env`（與 `package.json` 同層）

**內容**:
```env
# API 基礎 URL
# 本地開發時使用: http://localhost:3000/api
# 部署到 Vercel 後使用: https://你的專案名稱.vercel.app/api
VITE_API_URL=http://localhost:3000/api
```

### 2. 後端 .env（backend 目錄）

**位置**: `/backend/.env`（與 `backend/package.json` 同層）

**內容**:
```env
# 伺服器端口
PORT=3000

# MongoDB 連接字串
# 從 MongoDB Atlas 獲取連接字串
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/match-point?retryWrites=true&w=majority
```

## 建立步驟

### 本地開發

1. **建立前端 .env**（專案根目錄）:
   ```bash
   # 在專案根目錄執行
   echo VITE_API_URL=http://localhost:3000/api > .env
   ```

2. **建立後端 .env**（backend 目錄）:
   ```bash
   # 在 backend 目錄執行
   cd backend
   echo PORT=3000 > .env
   echo MONGODB_URI=你的MongoDB連接字串 >> .env
   ```

### Vercel 部署

在 Vercel 專案設定中添加環境變數：

1. 前往 Vercel 專案設定 → Environment Variables
2. 添加以下變數：
   - `MONGODB_URI` = `你的MongoDB連接字串`（**必須**）
   - `VITE_API_URL` = `/api`（**可選**，如果不設定會自動使用相對路徑）
   - `PORT` = `3000`（可選，Vercel 會自動設定）

**注意**：
- 如果前後端都在同一個 Vercel 專案中，`VITE_API_URL` 可以不設定（會自動使用 `/api`）
- 如果後端部署在不同的域名，則需要設定完整的 URL，例如：`https://api.你的域名.com`

## 注意事項

- `.env` 檔案已加入 `.gitignore`，不會被提交到 Git
- 請勿將 `.env` 檔案提交到版本控制系統
- 使用 `.env.example` 作為範本（如果有的話）

