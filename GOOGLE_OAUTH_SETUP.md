# Google OAuth 設定指南

## 前置需求

1. Google Cloud Console 專案
2. Supabase 專案
3. 環境變數設定

## 步驟 1: 在 Google Cloud Console 設定 OAuth

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用必要的 API：
   - 進入 "APIs & Services" → "Library"
   - 搜尋並啟用 "Google+ API"（如果可用）
   - 或者啟用 "Google Identity Services API"
4. 建立 OAuth 2.0 憑證：
   - 進入 "APIs & Services" → "Credentials"
   - 點擊 "Create Credentials" → "OAuth client ID"
   - 選擇 "Web application"
   - **重要**：設定授權的重定向 URI：
     - **只需要添加 Supabase 回調 URL**：`https://你的專案.supabase.co/auth/v1/callback`
     - **不要添加**應用程式的 URL（如 `https://matchup-platform.vercel.app/login`）
     - Supabase 會處理從 Google 到應用程式的重定向
   - 複製 **Client ID** 和 **Client Secret**

## 步驟 2: 在 Supabase Dashboard 設定 Google OAuth

1. 登入 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 進入 **Authentication** → **URL Configuration**
   - 設定 **Site URL**：
     - 開發環境：`http://localhost:5173`（或你的前端端口）
     - 生產環境：`https://你的域名.vercel.app`（例如：`https://matchup-platform.vercel.app`）
   - 設定 **Redirect URLs**（**非常重要**，必須完全匹配）：
     - 點擊 "Add URL" 按鈕
     - 添加：`https://你的域名.vercel.app/login`（例如：`https://matchup-platform.vercel.app/login`）
     - **注意**：URL 必須完全匹配，包括：
       - 協議（`https://`）
       - 域名（完全一致）
       - 路徑（`/login`）
     - 可以添加萬用字元：`https://你的域名.vercel.app/**`（可選）
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

如果看到 `OAuth state parameter missing` 或 `invalid_request` 錯誤，**這是 Supabase 配置問題**，請按照以下步驟修復：

1. **進入 Supabase Dashboard**：
   - 登入 [Supabase Dashboard](https://app.supabase.com/)
   - 選擇你的專案

2. **設定 URL Configuration**：
   - 進入 **Authentication** → **URL Configuration**
   - **Site URL**：設定為 `https://matchup-platform.vercel.app`（你的實際域名）
   - **Redirect URLs**：
     - 點擊 "Add URL"
     - 添加：`https://matchup-platform.vercel.app/login`
     - **重要**：必須完全匹配，包括：
       - 協議：`https://`（不是 `http://`）
       - 域名：完全一致（沒有多餘的斜線或路徑）
       - 路徑：`/login`（必須包含前導斜線）

3. **驗證設定**：
   - 確認 Redirect URLs 列表中包含：`https://matchup-platform.vercel.app/login`
   - 確認沒有多餘的空格或字符
   - 確認 URL 格式正確（沒有雙斜線等）

4. **保存並重新測試**：
   - 點擊 "Save"
   - 等待幾秒鐘讓設定生效
   - 重新嘗試 Google 登入

**常見錯誤**：
- ❌ `http://matchup-platform.vercel.app/login`（錯誤：使用 http 而不是 https）
- ❌ `https://matchup-platform.vercel.app/login/`（錯誤：多餘的尾隨斜線）
- ❌ `matchup-platform.vercel.app/login`（錯誤：缺少協議）
- ✅ `https://matchup-platform.vercel.app/login`（正確）

### 重定向 URI 不匹配

確保在 Google Cloud Console 中設定的重定向 URI 與 Supabase 和你的應用程式 URL 完全匹配。

**重要**：Google Cloud Console 中的重定向 URI 應該只包含：
- `https://你的專案.supabase.co/auth/v1/callback`

**不需要**在 Google Cloud Console 中添加應用程式的 URL，因為 Supabase 會處理重定向。

### 環境變數未設定

確認 `.env` 檔案中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 已正確設定。

### 用戶合併問題

如果用戶使用 Google 登入，但該 email 已經有用戶名/密碼註冊的帳號，系統會自動合併帳號（使用現有帳號，更新 Google 提供的資訊）。

