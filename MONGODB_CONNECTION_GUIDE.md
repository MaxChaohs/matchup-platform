# MongoDB 連接字串設定指南

## 你的 MongoDB 用戶資訊
根據 MongoDB Atlas 顯示：
- **用戶名**: `maxchao1217_db_user`
- **認證方法**: `SCRAM`
- **角色**: `atlasAdmin@admin` ✅
- **資源**: `All Resources` ✅

## 連接字串格式

### 基本格式
```
mongodb+srv://maxchao1217_db_user:<password>@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority
```

### 重要注意事項

#### 1. 密碼 URL 編碼
如果密碼包含特殊字符，必須進行 URL 編碼：

**需要編碼的字符：**
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`
- `+` → `%2B`
- `=` → `%3D`
- ` ` (空格) → `%20`

**範例：**
- 原始密碼：`MyP@ss#123`
- 編碼後：`MyP%40ss%23123`
- 連接字串：`mongodb+srv://maxchao1217_db_user:MyP%40ss%23123@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority`

#### 2. 在 Vercel 中設定

1. **前往 Vercel Dashboard**
   - 登入 [vercel.com](https://vercel.com)
   - 選擇你的專案

2. **設定環境變數**
   - 進入 **Settings** → **Environment Variables**
   - 點擊 **Add New**
   - **Key**: `MONGODB_URI`
   - **Value**: 完整的連接字串（已正確編碼密碼）
   - **Environment**: 選擇 `Production`, `Preview`, `Development`（建議全部選擇）
   - 點擊 **Save**

3. **重新部署**
   - 進入 **Deployments**
   - 點擊最新部署旁邊的 **"..."** 菜單
   - 選擇 **Redeploy**
   - 或推送新的 commit 觸發自動部署

## 測試連接字串

### 方法 1：使用 MongoDB Compass
1. 下載 [MongoDB Compass](https://www.mongodb.com/products/compass)
2. 使用相同的連接字串測試連接
3. 如果 Compass 可以連接，但 Vercel 不行，可能是環境變數設定問題

### 方法 2：檢查 Vercel 日誌
1. 在 Vercel Dashboard 中
2. 進入 **Deployments** → 選擇最新部署
3. 點擊 **Functions** 標籤
4. 查看 `api/index.ts` 的日誌
5. 查找 MongoDB 連接相關的訊息

## 常見錯誤

### ❌ 錯誤 1：忘記替換 `<password>`
```
mongodb+srv://maxchao1217_db_user:<password>@cluster0.a9mdozn.mongodb.net/...
```
**解決**：將 `<password>` 替換為實際密碼（已編碼）

### ❌ 錯誤 2：特殊字符未編碼
```
mongodb+srv://maxchao1217_db_user:P@ss#123@cluster0.a9mdozn.mongodb.net/...
```
**解決**：將 `@` 和 `#` 編碼為 `%40` 和 `%23`

### ❌ 錯誤 3：連接字串中有空格
```
mongodb+srv://maxchao1217_db_user: MyPassword @cluster0...
```
**解決**：移除所有空格

### ❌ 錯誤 4：資料庫名稱錯誤
確保連接字串中的資料庫名稱是 `match-point`（或你實際使用的資料庫名稱）

## URL 編碼工具

如果密碼包含特殊字符，可以使用以下工具進行編碼：
- [URL Encoder/Decoder](https://www.urlencoder.org/)
- [FreeFormatter URL Encoder](https://www.freeformatter.com/url-encoder.html)

## 快速檢查清單

- [ ] 確認 MongoDB Atlas 用戶 `maxchao1217_db_user` 的密碼
- [ ] 如果密碼有特殊字符，進行 URL 編碼
- [ ] 在 Vercel 環境變數中設定 `MONGODB_URI`
- [ ] 確認連接字串格式正確
- [ ] 確認 Network Access 已允許 `0.0.0.0/0`
- [ ] 重新部署 Vercel 專案
- [ ] 檢查 Vercel 部署日誌確認連接成功

## 如果仍然失敗

1. **重置 MongoDB 用戶密碼**
   - 在 MongoDB Atlas 中，點擊用戶旁邊的 **EDIT**
   - 點擊 **Edit Password**
   - 設定一個簡單的密碼（只包含字母和數字，避免特殊字符）
   - 更新 Vercel 環境變數
   - 重新部署

2. **創建新用戶**
   - 在 MongoDB Atlas 中創建新用戶
   - 使用簡單的密碼
   - 更新連接字串
   - 更新 Vercel 環境變數
   - 重新部署

3. **檢查 Network Access**
   - 確認 `0.0.0.0/0` 在白名單中
   - 等待幾分鐘讓設定生效

