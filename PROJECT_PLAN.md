# MATCH POINT 平台開發規劃

## 專案概述
MATCH POINT 是一個運動與電子競技約戰平台，讓使用者可以快速創建比賽、瀏覽比賽、管理個人資料。

## 核心功能模組

### 1. 使用者認證系統
- **登入方式**
  - 使用者名稱/電話/電子郵件登入
  - 密碼登入（帶顯示/隱藏功能）
  - 記住我功能
  - 忘記密碼功能
  - 社交登入：Apple、Google、Facebook

- **使用者註冊**
  - 多種註冊方式
  - 電子郵件/手機驗證
  - 使用者資料設定

### 2. 比賽管理
- **創建比賽**
  - 快速創建（秒級）
  - 比賽類型選擇（運動/電子競技）
  - 比賽詳情設定（時間、地點、規則等）
  - 參與人數設定

- **比賽瀏覽**
  - 比賽列表展示
  - 篩選功能（類型、時間、地點）
  - 搜尋功能
  - 比賽詳情頁面

### 3. 使用者個人中心
- **個人資料**
  - 基本資訊管理
  - 頭像上傳
  - 技能等級展示
  - 歷史比賽記錄

- **我的比賽**
  - 創建的比賽
  - 參與的比賽
  - 比賽歷史

## 技術棧建議

### 前端
- **框架**: React + TypeScript
- **樣式**: Tailwind CSS（現代化 UI，易於實現設計）
- **狀態管理**: React Context / Zustand
- **路由**: React Router
- **表單處理**: React Hook Form
- **HTTP 客戶端**: Axios
- **圖標**: React Icons / Heroicons

### 後端
- **框架**: Node.js + Express
- **資料庫**: MongoDB（NoSQL 文檔資料庫）
- **ODM**: Mongoose（MongoDB 物件建模工具）
- **認證**: JWT + OAuth2（社交登入）
- **檔案儲存**: 本地儲存或雲端儲存（頭像、圖片）

### 開發工具
- **套件管理**: npm / yarn
- **建置工具**: Vite（快速開發）
- **程式碼規範**: ESLint + Prettier
- **版本控制**: Git

## 專案結構

```
match-point/
├── frontend/                 # 前端專案
│   ├── src/
│   │   ├── components/      # 可複用元件
│   │   │   ├── auth/        # 認證相關元件
│   │   │   ├── match/       # 比賽相關元件
│   │   │   └── common/      # 通用元件
│   │   ├── pages/           # 頁面元件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── CreateMatch.tsx
│   │   │   ├── MatchList.tsx
│   │   │   └── Profile.tsx
│   │   ├── hooks/           # 自訂 Hooks
│   │   ├── services/        # API 服務
│   │   ├── utils/           # 工具函數
│   │   ├── context/          # Context API
│   │   ├── types/           # TypeScript 類型定義
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── backend/                  # 後端專案
│   ├── src/
│   │   ├── routes/          # 路由
│   │   ├── controllers/     # 控制器
│   │   ├── models/          # 資料模型（Mongoose Schema）
│   │   ├── middleware/      # 中間件
│   │   ├── services/        # 業務邏輯
│   │   ├── utils/           # 工具函數
│   │   ├── config/          # 設定檔（資料庫連線等）
│   │   └── app.js
│   └── package.json
│
└── README.md
```

## UI/UX 設計要點

### 設計風格
- **顏色方案**:
  - 主背景：淺桃色/米色（#FFF5E6 或類似）
  - 登入面板：深灰色（#2D2D2D 或類似）
  - 主按鈕：綠色（#10B981 或類似）
  - 文字：黑色/白色（根據背景）

- **設計原則**
  - 現代化、簡潔
  - 響應式設計（支援行動裝置）
  - 清晰的視覺層次
  - 良好的使用者體驗

### 關鍵頁面
1. **登入頁面**（已設計）
   - 左側：平台介紹
   - 右側：登入表單

2. **首頁**
   - 比賽列表
   - 快速創建按鈕
   - 搜尋和篩選

3. **創建比賽頁面**
   - 表單輸入
   - 即時預覽

4. **個人中心**
   - 使用者資訊
   - 比賽歷史

## 開發階段規劃

### 第一階段：基礎搭建（1-2 週）
- [ ] 專案初始化
- [ ] 技術棧配置
- [ ] MongoDB 資料庫設定
- [ ] 基礎元件開發
- [ ] 登入/註冊頁面實現
- [ ] 後端基礎架構

### 第二階段：核心功能（2-3 週）
- [ ] 使用者認證系統
- [ ] 比賽創建功能
- [ ] 比賽列表展示
- [ ] MongoDB Schema 設計與實作

### 第三階段：進階功能（1-2 週）
- [ ] 個人中心
- [ ] 社交登入整合（Apple、Google、Facebook）
- [ ] 檔案上傳功能（頭像）

### 第四階段：優化與測試（1-2 週）
- [ ] 效能優化
- [ ] 響應式設計完善
- [ ] 測試
- [ ] 部署準備

## 資料庫設計（MongoDB Schema）

### 使用者集合 (users)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  phone: String,
  passwordHash: String,
  avatar: String,  // 頭像 URL
  socialLogins: {
    apple: String,    // Apple ID
    google: String,   // Google ID
    facebook: String  // Facebook ID
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 比賽集合 (matches)
```javascript
{
  _id: ObjectId,
  creatorId: ObjectId,  // 參考 users._id
  title: String,
  description: String,
  type: String,  // 'sport' 或 'esport'
  category: String,  // 具體運動/遊戲類型
  location: String,
  startTime: Date,
  maxParticipants: Number,
  currentParticipants: Number,
  participants: [ObjectId],  // 參與者 ID 陣列
  status: String,  // 'open', 'full', 'completed', 'cancelled'
  createdAt: Date,
  updatedAt: Date
}
```

### 參與記錄集合 (participations) - 可選
```javascript
{
  _id: ObjectId,
  matchId: ObjectId,  // 參考 matches._id
  userId: ObjectId,   // 參考 users._id
  status: String,     // 'joined', 'left'
  joinedAt: Date
}
```
*註：參與記錄可以選擇嵌入在 matches 集合中，或獨立成集合以便查詢歷史記錄*

## 已確認事項

1. **技術棧選擇**
   - 前端：React + TypeScript + Tailwind CSS ✓
   - 後端：Node.js + Express ✓
   - 資料庫：MongoDB ✓

2. **核心功能**
   - 使用者認證系統（含社交登入）✓
   - 比賽管理（創建、瀏覽）✓
   - 個人中心 ✓

## 待確認事項

1. **社交登入**
   - 是否需要立即實現所有社交登入（Apple、Google、Facebook）？
   - 還是先實現基礎登入，後續再添加社交登入？

2. **部署方式**
   - 本地開發還是需要部署到雲端？
   - 是否需要 Docker 容器化？

3. **行動裝置支援**
   - 是否需要開發行動應用？
   - 還是先做響應式網頁？

4. **比賽參與功能**
   - 使用者是否可以加入他人創建的比賽？
   - 是否需要參與/退出比賽的功能？

---

**規劃已更新完成！請確認是否符合您的需求，或提出需要調整的地方！**

