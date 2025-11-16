# Vercel 部署指南

## 部署架構

### 方案一：前後端都部署到 Vercel（推薦）

- **前端**：部署到 Vercel（自動配置）
- **後端**：部署到 Vercel 作為 Serverless Functions

### 方案二：前端 Vercel + 後端其他平台

- **前端**：部署到 Vercel
- **後端**：部署到 Railway、Render 或其他平台

---

## 方案一：完整部署到 Vercel

### 步驟 1：準備後端為 Serverless Functions

Vercel 需要將 Express 應用轉換為 Serverless Functions。我們需要調整後端結構。

### 步驟 2：安裝 Vercel CLI

```bash
npm install -g vercel
```

### 步驟 3：部署前端

1. **進入前端目錄**：
   ```bash
   cd frontend
   ```

2. **登入 Vercel**：
   ```bash
   vercel login
   ```

3. **部署**：
   ```bash
   vercel
   ```
   或使用生產環境：
   ```bash
   vercel --prod
   ```

4. **設置環境變數**：
   - 在 Vercel 專案設置中添加：
     - `VITE_API_BASE_URL`: 您的後端 API URL

### 步驟 4：部署後端

1. **進入後端目錄**：
   ```bash
   cd backend
   ```

2. **部署**：
   ```bash
   vercel
   ```

3. **設置環境變數**（在 Vercel 專案設置中）：
   - `MONGODB_URI`: 您的 MongoDB 連接字串
   - `JWT_SECRET`: JWT 密鑰
   - `JWT_EXPIRE`: JWT 過期時間（預設：7d）
   - `PORT`: 不需要設置（Vercel 自動處理）

---

## 方案二：前端 Vercel + 後端 Railway/Render（更簡單）

### 前端部署到 Vercel

1. **在 GitHub 上創建 Repository**

2. **連接 Vercel**：
   - 前往 [vercel.com](https://vercel.com)
   - 點擊 "New Project"
   - 導入您的 GitHub Repository
   - 選擇 `frontend` 目錄作為根目錄

3. **設置環境變數**：
   - `VITE_API_BASE_URL`: 您的後端 API URL（例如：`https://your-backend.railway.app/api`）

4. **部署設置**：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **部署**：點擊 "Deploy"

### 後端部署到 Railway（推薦）

Railway 非常適合部署 Node.js 應用，且提供免費額度。

#### Railway 部署步驟：

1. **前往 [Railway](https://railway.app)** 並註冊

2. **創建新專案**：
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 選擇您的 Repository
   - 選擇 `backend` 目錄

3. **設置環境變數**：
   - 在 Railway 專案設置中添加：
     - `MONGODB_URI`: 您的 MongoDB 連接字串
     - `JWT_SECRET`: JWT 密鑰
     - `JWT_EXPIRE`: `7d`
     - `NODE_ENV`: `production`

4. **設置構建命令**：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **獲取後端 URL**：
   - Railway 會自動提供一個 URL，例如：`https://your-app.railway.app`
   - 記下這個 URL

6. **更新前端環境變數**：
   - 回到 Vercel，更新 `VITE_API_BASE_URL` 為您的 Railway URL + `/api`

---

## 方案三：後端部署到 Render

### Render 部署步驟：

1. **前往 [Render](https://render.com)** 並註冊

2. **創建 Web Service**：
   - 連接您的 GitHub Repository
   - 選擇 `backend` 目錄
   - 設置：
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **設置環境變數**：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `NODE_ENV`: `production`

4. **部署並獲取 URL**

---

## 重要注意事項

### 1. CORS 設置

確保後端的 CORS 設置允許前端域名：

```typescript
// backend/src/app.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

### 2. MongoDB Atlas 網路訪問

確保 MongoDB Atlas 允許來自 Vercel/Railway IP 的連接：
- 在 MongoDB Atlas 的 Network Access 中添加 `0.0.0.0/0`（允許所有 IP）

### 3. 環境變數

**前端環境變數（Vercel）**：
- `VITE_API_BASE_URL`: 後端 API 完整 URL

**後端環境變數（Railway/Render）**：
- `MONGODB_URI`: MongoDB 連接字串
- `JWT_SECRET`: 強密鑰
- `JWT_EXPIRE`: `7d`
- `NODE_ENV`: `production`

### 4. 構建命令

確保 `package.json` 中有正確的構建和啟動命令。

---

## 快速部署檢查清單

### 前端（Vercel）
- [ ] GitHub Repository 已創建
- [ ] Vercel 專案已連接
- [ ] 環境變數 `VITE_API_BASE_URL` 已設置
- [ ] 部署成功

### 後端（Railway/Render）
- [ ] 後端專案已部署
- [ ] 環境變數已設置（MONGODB_URI, JWT_SECRET 等）
- [ ] 後端 URL 已獲取
- [ ] CORS 已配置允許前端域名
- [ ] MongoDB Atlas 網路訪問已設置

### 測試
- [ ] 前端可以訪問後端 API
- [ ] 註冊/登入功能正常
- [ ] 創建比賽功能正常

---

## 推薦方案

**最簡單的方案**：
1. 前端 → Vercel（自動部署）
2. 後端 → Railway（簡單易用，免費額度）

這樣可以快速部署，且兩個平台都有良好的免費方案。

