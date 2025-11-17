# Vercel 部署指南

## 環境變數設定

在 Vercel 專案設定中添加以下環境變數：

```
MONGODB_URI=你的MongoDB連接字串
```

**VITE_API_URL 說明**：
- 如果前後端都在同一個 Vercel 專案中，**不需要設定** `VITE_API_URL`（會自動使用相對路徑 `/api`）
- 如果後端部署在不同的域名，則需要設定：`VITE_API_URL=https://你的API域名/api`

## MongoDB 設定

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 建立免費帳號
2. 建立新的 Cluster
3. 在 Database Access 中建立使用者
4. 在 Network Access 中添加 IP 位址（或使用 0.0.0.0/0 允許所有 IP）
5. 點擊 Connect，選擇 "Connect your application"
6. 複製連接字串，替換 `<password>` 為你的密碼
7. 將連接字串添加到 Vercel 環境變數 `MONGODB_URI`

## 部署步驟

1. 將專案推送到 GitHub
2. 在 Vercel 中導入專案
3. 設定環境變數
4. 部署

## 本地開發

1. 安裝依賴：
```bash
npm install
cd backend && npm install
```

2. 建立 `.env` 檔案在 `backend/` 目錄：
```
PORT=3000
MONGODB_URI=你的MongoDB連接字串
```

3. 建立前端 `.env` 檔案：
```
VITE_API_URL=http://localhost:3000/api
```

4. 啟動後端：
```bash
cd backend
npm run dev
```

5. 啟動前端（新終端）：
```bash
npm run dev
```

