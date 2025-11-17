# MongoDB 連接問題排查指南

## 錯誤訊息
```
MongoServerError: bad auth: authentication failed
```

這個錯誤表示 MongoDB 認證失敗。請按照以下步驟檢查：

## 1. 檢查 Vercel 環境變數

### 步驟：
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 進入 **Settings** → **Environment Variables**
4. 檢查 `MONGODB_URI` 是否存在且正確

### MongoDB 連接字串格式：
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/match-point?retryWrites=true&w=majority
```

### 重要檢查點：
- ✅ **用戶名和密碼**：確保與 MongoDB Atlas 中創建的用戶一致
- ✅ **特殊字符**：如果密碼包含特殊字符（如 `@`, `#`, `%` 等），需要進行 URL 編碼
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`
  - `?` → `%3F`
- ✅ **資料庫名稱**：確認連接字串中的資料庫名稱（例如：`match-point`）

## 2. 檢查 MongoDB Atlas Network Access

### 步驟：
1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 選擇你的 Cluster
3. 點擊 **Network Access**（左側選單）
4. 檢查 IP 白名單

### 設定建議：
- **開發/測試階段**：添加 `0.0.0.0/0`（允許所有 IP）
- **生產環境**：只添加 Vercel 的 IP 範圍（不推薦，因為 Vercel 使用動態 IP）

### 如何添加：
1. 點擊 **Add IP Address**
2. 輸入 `0.0.0.0/0`（或特定 IP）
3. 點擊 **Confirm**
4. 等待幾分鐘讓設定生效

## 3. 檢查 MongoDB 用戶權限

### 步驟：
1. 在 MongoDB Atlas 中，點擊 **Database Access**（左側選單）
2. 找到你使用的用戶
3. 檢查用戶權限

### 建議權限：
- **Database User** 角色：`Atlas admin` 或 `Read and write to any database`
- 或者為特定資料庫設置：`Read and write` 權限

### 如果用戶不存在或權限不足：
1. 點擊 **Add New Database User**
2. 選擇 **Password** 認證方式
3. 設定用戶名和密碼（記住這些資訊，用於連接字串）
4. 選擇 **Atlas admin** 或自定義權限
5. 點擊 **Add User**

## 4. 驗證連接字串

### 測試連接字串格式：
```bash
# 正確格式範例
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/match-point?retryWrites=true&w=majority
```

### 常見錯誤：
- ❌ 忘記替換 `<username>` 和 `<password>`
- ❌ 密碼中的特殊字符未進行 URL 編碼
- ❌ 連接字串中有多餘的空格
- ❌ 資料庫名稱錯誤

## 5. 重新設定環境變數

### 在 Vercel 中：
1. 前往 **Settings** → **Environment Variables**
2. 刪除舊的 `MONGODB_URI`
3. 重新添加，確保：
   - **Key**: `MONGODB_URI`
   - **Value**: 完整的連接字串（已正確編碼）
   - **Environment**: 選擇 `Production`, `Preview`, `Development`（或全部）
4. 點擊 **Save**
5. **重新部署**專案（重要！）

## 6. 檢查連接字串中的特殊字符

如果你的密碼包含特殊字符，使用以下工具進行 URL 編碼：
- [URL Encoder/Decoder](https://www.urlencoder.org/)

### 範例：
- 原始密碼：`P@ssw0rd#123`
- URL 編碼後：`P%40ssw0rd%23123`
- 連接字串：`mongodb+srv://myuser:P%40ssw0rd%23123@cluster0.xxxxx.mongodb.net/...`

## 7. 測試連接

### 使用 MongoDB Compass 測試：
1. 下載 [MongoDB Compass](https://www.mongodb.com/products/compass)
2. 使用相同的連接字串測試連接
3. 如果 Compass 可以連接，但 Vercel 不行，可能是環境變數設定問題

## 8. 檢查 Vercel 部署日誌

1. 前往 Vercel Dashboard
2. 選擇你的專案
3. 點擊最新的部署
4. 查看 **Functions** 標籤中的日誌
5. 查找 MongoDB 連接相關的錯誤訊息

## 快速檢查清單

- [ ] Vercel 環境變數 `MONGODB_URI` 已設定
- [ ] 連接字串中的用戶名和密碼正確
- [ ] 密碼中的特殊字符已進行 URL 編碼
- [ ] MongoDB Atlas Network Access 已允許 `0.0.0.0/0` 或特定 IP
- [ ] MongoDB 用戶存在且具有適當權限
- [ ] 連接字串格式正確（包含資料庫名稱）
- [ ] 已重新部署 Vercel 專案

## 常見解決方案

### 方案 1：重新創建 MongoDB 用戶
1. 在 MongoDB Atlas 中刪除舊用戶
2. 創建新用戶（使用簡單的密碼，避免特殊字符）
3. 更新 Vercel 環境變數
4. 重新部署

### 方案 2：使用簡單密碼
如果可能，使用只包含字母和數字的密碼，避免特殊字符。

### 方案 3：檢查 Network Access
確保 `0.0.0.0/0` 在白名單中，並等待幾分鐘讓設定生效。

## 需要幫助？

如果以上步驟都無法解決問題，請檢查：
1. MongoDB Atlas 的服務狀態
2. Vercel 的部署日誌中的詳細錯誤訊息
3. 連接字串是否在本地環境可以正常工作

