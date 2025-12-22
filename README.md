# MATCH POINT - 約戰平台

一個用於各種運動和遊戲的約戰平台。

## 功能特色

- **找隊伍**：以完整隊伍為單位建立、參加一對一對戰
- **找隊員**：提供使用者尋找隊員功能
- **使用者認證**：註冊、登入功能，密碼加密儲存
- 所有貼文公開給所有使用者查看
- 完整的 CRUD 功能（建立、編輯、刪除）
- 篩選與搜尋功能

## 技術棧

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (狀態管理)
- React Router
- Lucide React (圖標)

### 後端
- Node.js + Express
- TypeScript
- Supabase (PostgreSQL 資料庫)
- bcryptjs (密碼加密)
- RESTful API

### 部署
- Vercel (前端 + 後端)
- Supabase (資料庫)

## 安裝與運行

### 本地開發

1. 安裝前端依賴：
```bash
npm install
```

2. 安裝後端依賴：
```bash
cd backend
npm install
```

3. 設定環境變數：

在專案根目錄建立 `.env`：
```
VITE_API_URL=http://localhost:3000/api
```

在 `backend/` 目錄建立 `.env`：
```
PORT=3000
SUPABASE_URL=你的Supabase專案URL
SUPABASE_KEY=你的Supabase匿名金鑰
```

**取得 Supabase 憑證：**
1. 前往 [Supabase](https://supabase.com) 建立專案
2. 進入專案設定 → API
3. 複製 `Project URL` 作為 `SUPABASE_URL`
4. 複製 `anon public` 金鑰作為 `SUPABASE_KEY`

4. 啟動後端：
```bash
cd backend
npm run dev
```

5. 啟動前端（新終端）：
```bash
npm run dev
```

## 資料庫設定

### Supabase 資料表結構

專案使用以下資料表：

- **users**: 使用者資料
  - `id` (UUID, Primary Key)
  - `username` (String, Unique)
  - `email` (String, Unique)
  - `phone` (String, Optional)
  - `avatar` (String, Optional)
  - `password` (String, Hashed)
  - `reset_token` (String, Optional) - 密碼重設 token
  - `reset_token_expires` (Timestamp, Optional) - token 過期時間
  - `created_at`, `updated_at` (Timestamps)

- **team_matches**: 隊伍對戰
  - `id` (UUID, Primary Key)
  - `title`, `category`, `region`, `date`, `time`, `location`
  - `description` (Text, Optional)
  - `creator_id` (UUID, Foreign Key → users.id)
  - `team_size`, `max_teams`, `current_teams` (Integer)
  - `team_name` (String, Optional)
  - `created_at`, `updated_at` (Timestamps)

- **player_recruitments**: 隊員招募
  - `id` (UUID, Primary Key)
  - `title`, `category`, `region`, `date`, `time`, `location`
  - `description` (Text, Optional)
  - `creator_id` (UUID, Foreign Key → users.id)
  - `needed_players`, `current_players` (Integer)
  - `team_name` (String, Optional)
  - `created_at`, `updated_at` (Timestamps)

### 建立資料表

在 Supabase SQL Editor 中執行以下 SQL：

```sql
-- 建立 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  password TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 如果已有 users 表，添加新欄位：
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- 建立 team_matches 表
CREATE TABLE IF NOT EXISTS team_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  team_size INTEGER NOT NULL,
  max_teams INTEGER NOT NULL DEFAULT 2,
  current_teams INTEGER NOT NULL DEFAULT 1,
  team_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立 player_recruitments 表
CREATE TABLE IF NOT EXISTS player_recruitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  needed_players INTEGER NOT NULL,
  current_players INTEGER NOT NULL DEFAULT 1,
  team_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 功能說明

### 登入/註冊頁面
- 使用者註冊（用戶名、電子郵件、密碼、手機號碼）
- 使用者登入（用戶名、密碼）
- 忘記密碼功能（透過電子郵件重設）
- 密碼加密儲存（bcryptjs）
- 表單驗證與錯誤提示

### 主頁面

#### 找隊伍模式
- 瀏覽所有公開的隊伍對戰（一對一）
- 建立、編輯、刪除自己的隊伍對戰
- 查看隊伍資訊（隊伍數、每隊人數）

#### 找隊員模式
- 瀏覽所有公開的隊員招募
- 建立、編輯、刪除自己的隊員招募
- 查看隊員資訊（目前人數、需要人數）

#### 個人資訊
- 顯示使用者資訊
- 編輯個人資訊
- 刪除帳號

#### 篩選與搜尋
- 對戰類別（籃球、足球、羽球、桌球、網球、排球、其他）
- 地區（北部、中部、南部）
- 時間（週一到週日）
- 關鍵字搜尋

## API 端點

### 認證
- `POST /api/auth/register` - 註冊新用戶
  - Body: `{ username, email, password, phone? }`
- `POST /api/auth/login` - 登入
  - Body: `{ username, password }`
- `POST /api/auth/forgot-password` - 忘記密碼（發送重設連結）
  - Body: `{ email }`
- `POST /api/auth/reset-password` - 重設密碼
  - Body: `{ token, newPassword }`
- `GET /api/auth/verify-reset-token?token=xxx` - 驗證重設 token 是否有效

### 用戶
- `GET /api/users` - 獲取所有用戶
- `GET /api/users/:id` - 獲取單個用戶
- `POST /api/users` - 創建用戶
- `PUT /api/users/:id` - 更新用戶
- `DELETE /api/users/:id` - 刪除用戶

### 隊伍對戰
- `GET /api/team-matches` - 獲取所有對戰（支援篩選和搜尋）
- `GET /api/team-matches/:id` - 獲取單個對戰
- `POST /api/team-matches` - 創建對戰
- `PUT /api/team-matches/:id` - 更新對戰
- `DELETE /api/team-matches/:id` - 刪除對戰

### 隊員招募
- `GET /api/player-recruitments` - 獲取所有招募（支援篩選和搜尋）
- `GET /api/player-recruitments/:id` - 獲取單個招募
- `POST /api/player-recruitments` - 創建招募
- `PUT /api/player-recruitments/:id` - 更新招募
- `DELETE /api/player-recruitments/:id` - 刪除招募

## 部署到 Vercel

### 環境變數設定

在 Vercel 專案設定中添加以下環境變數：

```
SUPABASE_URL=你的Supabase專案URL
SUPABASE_KEY=你的Supabase匿名金鑰
```

**VITE_API_URL 說明**：
- 如果前後端都在同一個 Vercel 專案中，**不需要設定** `VITE_API_URL`（會自動使用相對路徑 `/api`）
- 如果後端部署在不同的域名，則需要設定：`VITE_API_URL=https://你的API域名/api`

詳見 [DEPLOY.md](./DEPLOY.md)

## 專案結構

```
match-point/
├── api/                    # Vercel 部署用的後端（部署時使用）
│   └── backend/
│       ├── routes/         # API 路由
│       └── supabase.ts     # Supabase 客戶端
├── backend/                # 本地開發用的後端
│   └── src/
│       ├── routes/         # API 路由
│       └── supabase.ts     # Supabase 客戶端
├── src/                    # 前端原始碼
│   ├── components/         # React 組件
│   ├── pages/              # 頁面組件
│   ├── services/           # API 服務
│   ├── store/              # Zustand 狀態管理
│   └── types/              # TypeScript 類型定義
└── package.json            # 前端依賴
```

## 開發狀態

- ✅ 前端 UI 完成
- ✅ 後端 API 完成
- ✅ Supabase 整合完成
- ✅ 使用者認證（註冊/登入）完成
- ✅ CRUD 功能完成
- ✅ 前端 CRUD UI 整合完成

## 相關文件

- [部署指南](./DEPLOY.md)
- [環境變數設定](./ENV_SETUP.md)
