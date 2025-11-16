# Vercel 404 錯誤修復指南

## 問題原因
Vercel 無法正確處理 React Router 的客戶端路由，導致所有路由都返回 404。

## 解決方案

### 步驟 1：確認文件已更新
確保以下文件已正確設置：
- ✅ `vercel.json` - 已簡化配置
- ✅ `vite.config.ts` - 已創建
- ✅ `@vitejs/plugin-react` - 已安裝

### 步驟 2：在 Vercel 專案設置中檢查

1. **登入 Vercel Dashboard**
2. **選擇您的專案** (`match-point`)
3. **進入 Settings → General**

4. **檢查以下設置**：
   - **Framework Preset**: 應該是 `Vite`（或自動檢測）
   - **Root Directory**: 應該是 `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 步驟 3：重新部署

有兩種方式：

#### 方式 A：通過 Git 推送（推薦）
```bash
git add .
git commit -m "Fix Vercel 404 error - update config"
git push
```
Vercel 會自動重新部署。

#### 方式 B：在 Vercel Dashboard 重新部署
1. 進入 Vercel Dashboard
2. 選擇您的專案
3. 點擊 "Deployments"
4. 找到最新的部署
5. 點擊 "..." → "Redeploy"

### 步驟 4：驗證 vercel.json

確保 `frontend/vercel.json` 內容為：
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

這個配置會將所有路由重定向到 `index.html`，讓 React Router 處理路由。

### 步驟 5：檢查構建日誌

1. 在 Vercel Dashboard 中查看部署日誌
2. 確認構建成功
3. 檢查是否有錯誤訊息

## 如果問題仍然存在

### 檢查清單：
- [ ] `vercel.json` 文件在 `frontend` 目錄中
- [ ] Vercel 專案的 Root Directory 設置為 `frontend`
- [ ] Build Command 是 `npm run build`
- [ ] Output Directory 是 `dist`
- [ ] 已重新部署

### 替代方案：使用 _redirects 文件

如果 `vercel.json` 不工作，可以在 `frontend/public` 目錄創建 `_redirects` 文件：

```
/*    /index.html   200
```

然後重新部署。

## 測試

部署完成後，訪問：
- `https://match-point-rho.vercel.app/` - 應該顯示登入頁面
- `https://match-point-rho.vercel.app/login` - 應該顯示登入頁面（不應該 404）

