# Google OAuth 設置指南

## 問題說明

Google OAuth 需要在 Google Cloud Console 中設置正確的回調 URL，並且必須與後端環境變數中的 `GOOGLE_CALLBACK_URL` 完全匹配。

## 設置步驟

### 1. 在 Google Cloud Console 設置

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇或創建專案
3. 啟用 Google+ API
4. 前往「憑證」→「建立憑證」→「OAuth 用戶端 ID」
5. 應用程式類型選擇「網頁應用程式」
6. 在「已授權的重新導向 URI」中添加：
   - **本地開發**: `http://localhost:3000/api/auth/google/callback`
   - **生產環境**: `https://你的專案名稱.vercel.app/api/auth/google/callback`

### 2. 設置環境變數

#### 本地開發（backend/.env）

```env
GOOGLE_CLIENT_ID=你的Google Client ID
GOOGLE_CLIENT_SECRET=你的Google Client Secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

#### Vercel 部署

在 Vercel 專案設定中添加以下環境變數：

```env
GOOGLE_CLIENT_ID=你的Google Client ID
GOOGLE_CLIENT_SECRET=你的Google Client Secret
GOOGLE_CALLBACK_URL=https://你的專案名稱.vercel.app/api/auth/google/callback
FRONTEND_URL=https://你的專案名稱.vercel.app
```

**重要**：
- `GOOGLE_CALLBACK_URL` 必須與 Google Cloud Console 中設置的 URI **完全一致**
- 必須包含完整的協議（`https://`）和域名
- 不能使用相對路徑

### 3. 驗證設置

1. 確保 Google Cloud Console 中的回調 URI 與環境變數中的 `GOOGLE_CALLBACK_URL` 完全匹配
2. 確保 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 正確設置
3. 重新部署應用程式

## 常見問題

### 問題：404 錯誤，重定向到 localhost:3000

**原因**：`GOOGLE_CALLBACK_URL` 環境變數未設置或設置錯誤

**解決方法**：
1. 檢查 Vercel 環境變數中是否設置了 `GOOGLE_CALLBACK_URL`
2. 確保 URL 是完整的（包含 `https://` 和完整域名）
3. 確保與 Google Cloud Console 中的設置一致

### 問題：redirect_uri_mismatch 錯誤

**原因**：Google Cloud Console 中的回調 URI 與應用程式實際使用的回調 URL 不匹配

**解決步驟**：

1. **確認實際使用的回調 URL**：
   - 查看 Vercel 部署日誌中的 "Google OAuth Callback URL" 訊息
   - 或訪問 `/api/auth/google` 端點，查看後端日誌
   - 實際 URL 應該是：`https://你的專案名稱.vercel.app/api/auth/google/callback`

2. **在 Google Cloud Console 中添加正確的 URI**：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 選擇你的專案
   - 前往「API 和服務」→「憑證」
   - 點擊你的 OAuth 2.0 用戶端 ID
   - 在「已授權的重新導向 URI」中添加：
     ```
     https://你的專案名稱.vercel.app/api/auth/google/callback
     ```
   - **重要**：必須與實際使用的 URL **完全一致**（包括 `https://`、完整域名、路徑）

3. **設置 Vercel 環境變數**：
   - 在 Vercel 專案設定中添加：
     ```
     GOOGLE_CALLBACK_URL=https://你的專案名稱.vercel.app/api/auth/google/callback
     ```
   - 確保與 Google Cloud Console 中的 URI **完全一致**

4. **驗證設置**：
   - 檢查 Google Cloud Console 中的 URI 是否包含 `https://`（不是 `http://`）
   - 檢查域名是否正確（例如：`matchup-platform.vercel.app`）
   - 檢查路徑是否正確（`/api/auth/google/callback`）
   - 確保沒有多餘的空格或斜線

5. **等待生效**：
   - Google Cloud Console 的更改可能需要幾分鐘才能生效
   - 重新部署 Vercel 應用程式

**調試提示**：
- 如果仍然失敗，檢查 Vercel 部署日誌中的實際回調 URL
- 確保 Google Cloud Console 中的 URI 列表包含所有可能的變體（如果有多個部署環境）

## 測試

1. 本地測試：確保本地 `.env` 文件正確設置
2. 生產測試：確保 Vercel 環境變數正確設置
3. 檢查瀏覽器控制台是否有錯誤訊息
4. 檢查後端日誌以獲取更多調試信息

