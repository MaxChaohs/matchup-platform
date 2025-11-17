# MATCH POINT - 約戰平台

一個用於各種運動和遊戲的約戰平台。

## 功能特色

- **找隊伍**：以完整隊伍為單位建立、參加一對一對戰
- **找隊員**：提供使用者尋找隊員功能
- 所有貼文公開給所有使用者查看
- 完整的 CRUD 功能（建立、編輯、刪除）

## 技術棧

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (狀態管理)
- React Router

### 後端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- RESTful API

### 部署
- Vercel (前端 + 後端)
- MongoDB Atlas

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

在 `backend/` 目錄建立 `.env`：
```
PORT=3000
MONGODB_URI=你的MongoDB連接字串
```

在專案根目錄建立 `.env`：
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

## 測試帳號

- 帳號: `test` / 密碼: `test123`
- 帳號: `admin` / 密碼: `admin123`

## 功能說明

### 登入頁面
- 支援使用者名稱/電話/電子郵件登入
- 密碼顯示/隱藏切換
- 記住我功能
- Google 登入按鈕（尚未實裝）

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

詳見 [DEPLOY.md](./DEPLOY.md)

## 開發狀態

- ✅ 前端 UI 完成
- ✅ 後端 API 完成
- ✅ MongoDB 整合完成
- ✅ CRUD 功能完成
- ⏳ Google OAuth（尚未實裝）
- ⏳ 前端 CRUD UI 整合（參考 UPDATE_HOME.md）

