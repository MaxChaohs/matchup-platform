# Google OAuth 設定指南

## 前置需求

1. Google Cloud Console 專案
2. Supabase 專案
3. 環境變數設定

## 步驟 1: 在 Google Cloud Console 設定 OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API：
   - 進入 "APIs & Services" → "Library"
   - 搜尋 "Google+ API" 並啟用
4. 建立 OAuth 2.0 憑證：
   - 進入 "APIs & Services" → "Credentials"
   - 點擊 "Create Credentials" → "OAuth client ID"
   - 選擇 "Web application"
   - 設定授權的重定向 URI：
     - 開發環境：`http://localhost:5173/login`（或你的前端端口）
     - 生產環境：`https://你的域名.vercel.app/login`
     - Supabase 回調：`https://你的專案.supabase.co/auth/v1/callback`
   - 複製 **Client ID** 和 **Client Secret**

## 步驟 2: 在 Supabase Dashboard 設定 Google OAuth

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 進入 **Authentication** → **URL Configuration**
   - 設定 **Site URL**：
     - 開發環境：`http://localhost:5173`（或你的前端端口）
     - 生產環境：`https://你的域名.vercel.app`
   - 設定 **Redirect URLs**（添加以下 URL）：
     - `http://localhost:5173/login`（開發環境）
     - `https://你的域名.vercel.app/login`（生產環境）
     - `http://localhost:5173/**`（開發環境萬用字元）
     - `https://你的域名.vercel.app/**`（生產環境萬用字元）
4. 進入 **Authentication** → **Providers**
5. 找到 **Google** 並點擊啟用
6. 填入以下資訊：
   - **Client ID (for OAuth)**: 從 Google Cloud Console 複製的 Client ID
   - **Client Secret (for OAuth)**: 從 Google Cloud Console 複製的 Client Secret
7. 點擊 **Save**

## 步驟 3: 設定環境變數

### 本地開發

在專案根目錄建立或更新 `.env` 檔案：

```env
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_ANON_KEY=你的Supabase匿名金鑰
```

在 `backend/` 目錄的 `.env` 檔案中（如果有的話）：

```env
SUPABASE_URL=https://你的專案.supabase.co
SUPABASE_KEY=你的Supabase匿名金鑰
```

### Vercel 部署

在 Vercel 專案設定中添加環境變數：

1. 進入 Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 添加以下變數：
   - `VITE_SUPABASE_URL` = `https://你的專案.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = 你的 Supabase 匿名金鑰

**取得 Supabase 憑證：**
- 進入 Supabase Dashboard → 你的專案 → Settings → API
- 複製 **Project URL** 作為 `VITE_SUPABASE_URL`
- 複製 **anon public** 金鑰作為 `VITE_SUPABASE_ANON_KEY`

## 步驟 4: 測試

1. 啟動開發伺服器
2. 前往登入頁面
3. 點擊 "Log in with Google" 按鈕
4. 應該會重定向到 Google 登入頁面
5. 登入後應該會自動回到應用程式並完成認證

## 常見問題

### OAuth state parameter missing 錯誤

如果看到 `OAuth state parameter missing` 錯誤，通常是因為：

1. **Supabase Redirect URLs 未正確設定**：
   - 進入 Supabase Dashboard → Authentication → URL Configuration
   - 確認 **Redirect URLs** 中包含：`https://你的域名.vercel.app/login`
   - 必須包含完整的 URL（包括 `https://` 和路徑 `/login`）

2. **Site URL 設定錯誤**：
   - Site URL 應該設定為：`https://你的域名.vercel.app`（不包含 `/login`）

3. **檢查設定**：
   - 確認 Redirect URLs 中沒有多餘的斜線
   - 確認 URL 完全匹配（包括協議、域名、路徑）

### 重定向 URI 不匹配

確保在 Google Cloud Console 中設定的重定向 URI 與 Supabase 和你的應用程式 URL 完全匹配。

**重要**：Google Cloud Console 中的重定向 URI 應該只包含：
- `https://你的專案.supabase.co/auth/v1/callback`

**不需要**在 Google Cloud Console 中添加應用程式的 URL，因為 Supabase 會處理重定向。

### 環境變數未設定

確認 `.env` 檔案中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正確設定。

### 用戶合併問題

如果用戶使用 Google 登入，但該 email 已經有用戶名/密碼註冊的帳號，系統會自動合併帳號（使用現有帳號，更新 Google 提供的資訊）。

