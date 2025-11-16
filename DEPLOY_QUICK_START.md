# 快速部署指南 - Vercel

## 🚀 推薦方案：前端 Vercel + 後端 Railway

這是最簡單且穩定的部署方案。

---

## 第一步：準備 GitHub Repository

1. 在 GitHub 創建新的 Repository
2. 將專案推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/match-point.git
   git push -u origin main
   ```

---

## 第二步：部署後端到 Railway

### 為什麼選擇 Railway？
- ✅ 免費額度充足
- ✅ 自動部署
- ✅ 簡單易用
- ✅ 支援 Node.js 完美

### 步驟：

1. **前往 [Railway](https://railway.app)** 並用 GitHub 登入

2. **創建新專案**：
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 選擇您的 Repository
   - 選擇 `backend` 目錄作為根目錄

3. **設置環境變數**：
   在 Railway 專案設置 → Variables 中添加：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/match-point?retryWrites=true&w=majority
   JWT_SECRET=your-strong-secret-key-here
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

4. **設置構建和啟動**：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **獲取後端 URL**：
   - Railway 會自動生成一個 URL，例如：`https://your-app.railway.app`
   - 記下這個 URL，稍後需要用到

---

## 第三步：部署前端到 Vercel

1. **前往 [Vercel](https://vercel.com)** 並用 GitHub 登入

2. **創建新專案**：
   - 點擊 "Add New..." → "Project"
   - 選擇您的 GitHub Repository
   - 在 "Root Directory" 選擇 `frontend`

3. **設置構建配置**：
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **設置環境變數**：
   在 Environment Variables 中添加：
   ```
   VITE_API_BASE_URL=https://your-app.railway.app/api
   ```
   ⚠️ 將 `your-app.railway.app` 替換為您在 Railway 獲取的實際 URL

5. **部署**：
   - 點擊 "Deploy"
   - 等待部署完成
   - 記下 Vercel 提供的 URL，例如：`https://match-point.vercel.app`

---

## 第四步：更新後端 CORS 設置

回到 Railway，更新環境變數：
```
FRONTEND_URL=https://match-point.vercel.app
```
（使用您實際的 Vercel URL）

---

## 第五步：更新 MongoDB Atlas 網路訪問

1. 登入 MongoDB Atlas
2. 進入 Network Access
3. 點擊 "Add IP Address"
4. 選擇 "Allow Access from Anywhere"（或添加 Railway 的 IP）
5. 確認

---

## ✅ 完成！

現在您的應用應該已經部署完成：
- 前端：`https://your-app.vercel.app`
- 後端：`https://your-app.railway.app`

---

## 🔧 故障排除

### 問題：前端無法連接後端
- 檢查 `VITE_API_BASE_URL` 是否正確
- 檢查後端 CORS 設置是否包含前端 URL
- 檢查 Railway 後端是否正常運行

### 問題：MongoDB 連接失敗
- 檢查 MongoDB Atlas 網路訪問設置
- 確認 `MONGODB_URI` 格式正確
- 檢查使用者名稱和密碼是否正確

### 問題：401 認證錯誤
- 檢查 JWT_SECRET 是否設置
- 確認前後端環境變數都已正確設置

---

## 📝 檢查清單

- [ ] GitHub Repository 已創建並推送
- [ ] Railway 後端已部署
- [ ] Railway 環境變數已設置
- [ ] 後端 URL 已獲取
- [ ] Vercel 前端已部署
- [ ] Vercel 環境變數 `VITE_API_BASE_URL` 已設置
- [ ] 後端 `FRONTEND_URL` 已更新為 Vercel URL
- [ ] MongoDB Atlas 網路訪問已設置
- [ ] 測試註冊/登入功能
- [ ] 測試創建比賽功能

---

## 🎉 完成後

您的應用現在已經在線運行！可以分享給其他人使用了。

