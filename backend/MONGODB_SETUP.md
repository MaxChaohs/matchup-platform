# MongoDB 連接字串設置指南

## 兩種方式取得 MONGODB_URI

### 方式一：使用本地 MongoDB（適合開發測試）

如果您在本地電腦安裝了 MongoDB：

1. **確認 MongoDB 已安裝並運行**
   - Windows: 檢查服務是否運行
   - 或使用命令：`mongod` 啟動 MongoDB

2. **使用本地連接字串**：
   ```env
   MONGODB_URI=mongodb://localhost:27017/match-point
   ```
   - `localhost:27017` 是 MongoDB 預設地址和端口
   - `match-point` 是資料庫名稱（可以自訂）

---

### 方式二：使用 MongoDB Atlas（雲端，推薦）

MongoDB Atlas 是 MongoDB 的官方雲端服務，免費層級即可使用。

#### 步驟 1：註冊 MongoDB Atlas 帳號

1. 前往 [MongoDB Atlas 官網](https://www.mongodb.com/cloud/atlas)
2. 點擊 "Try Free" 或 "Sign Up" 註冊帳號
3. 完成註冊和驗證

#### 步驟 2：創建 Cluster（資料庫集群）

1. 登入後，點擊 "Build a Database"
2. 選擇免費方案（M0 Free）
3. 選擇雲端提供商和地區（建議選擇離您最近的）
4. 點擊 "Create" 創建 Cluster
5. 等待幾分鐘讓 Cluster 建立完成

#### 步驟 3：設置資料庫使用者

1. 在 "Database Access" 頁面，點擊 "Add New Database User"
2. 選擇 "Password" 認證方式
3. 輸入使用者名稱和密碼（**請記住這些資訊，稍後會用到**）
4. 設定使用者權限為 "Atlas admin" 或 "Read and write to any database"
5. 點擊 "Add User"

#### 步驟 4：設置網路訪問

1. 在 "Network Access" 頁面，點擊 "Add IP Address"
2. 選擇 "Allow Access from Anywhere"（開發階段）或添加您的 IP 地址
3. 點擊 "Confirm"

#### 步驟 5：獲取連接字串

1. 回到 "Database" 頁面，點擊您創建的 Cluster 上的 "Connect" 按鈕
2. 選擇 "Connect your application"
3. 選擇驅動程式為 "Node.js"，版本選擇最新
4. 您會看到一個連接字串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **複製這個連接字串**

#### 步驟 6：修改連接字串

將連接字串中的：
- `<username>` 替換為您在步驟 3 創建的使用者名稱
- `<password>` 替換為您在步驟 3 創建的密碼
- 在 `mongodb.net/` 後面添加資料庫名稱（例如：`match-point`）

**最終格式範例**：
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/match-point?retryWrites=true&w=majority
```

#### 步驟 7：將連接字串放入 .env 檔案

在 `backend/.env` 檔案中：
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/match-point?retryWrites=true&w=majority
```

---

## 快速檢查清單

- [ ] MongoDB Atlas 帳號已註冊
- [ ] Cluster 已創建
- [ ] 資料庫使用者已創建（記住帳號密碼）
- [ ] 網路訪問已設置（允許您的 IP）
- [ ] 已獲取連接字串
- [ ] 已將連接字串放入 `backend/.env` 檔案
- [ ] 已替換連接字串中的 `<username>` 和 `<password>`
- [ ] 已在連接字串中添加資料庫名稱

---

## 常見問題

### Q: 連接失敗怎麼辦？
- 檢查使用者名稱和密碼是否正確
- 確認網路訪問設置是否允許您的 IP
- 檢查連接字串格式是否正確

### Q: 資料庫名稱是什麼？
- 資料庫名稱可以自訂，例如：`match-point`
- 如果資料庫不存在，MongoDB 會自動創建

### Q: 本地 MongoDB 和 Atlas 的差別？
- **本地 MongoDB**：需要安裝在電腦上，適合開發
- **MongoDB Atlas**：雲端服務，不需要安裝，適合生產環境

---

## 測試連接

設置完成後，運行後端：
```bash
cd backend
npm run dev
```

如果看到 "MongoDB 連接成功"，表示設置正確！

