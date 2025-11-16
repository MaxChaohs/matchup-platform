# 環境變數設置說明

## 如何設置 MongoDB 連接

1. **複製範例檔案**：
   ```bash
   cp .env.example .env
   ```
   或在 Windows 上：
   ```bash
   copy .env.example .env
   ```

2. **編輯 `.env` 檔案**，設置您的 MongoDB 連接字串：

### 選項 1：本地 MongoDB
如果您在本地運行 MongoDB：
```env
MONGODB_URI=mongodb://localhost:27017/match-point
```

### 選項 2：MongoDB Atlas（雲端）
如果您使用 MongoDB Atlas：
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/match-point?retryWrites=true&w=majority
```
請將 `username` 和 `password` 替換為您的實際憑證。

### 選項 3：其他 MongoDB 服務
根據您的 MongoDB 提供商提供的連接字串格式設置。

## 其他環境變數

- `PORT`: 後端伺服器端口（預設：5000）
- `JWT_SECRET`: JWT 令牌的密鑰（請使用強密鑰）
- `JWT_EXPIRE`: JWT 令牌過期時間（預設：7d）

## 注意事項

- `.env` 檔案已加入 `.gitignore`，不會被提交到版本控制
- 請勿將 `.env` 檔案分享給他人
- 生產環境請使用強密鑰作為 `JWT_SECRET`

