# MongoDB 連接測試指南

## 當前狀態
- ✅ API 運行正常
- ✅ 環境變數已配置 (`uri: "configured"`)
- ❌ 數據庫連接失敗 (`status: "disconnected"`)

## 連接字串
```
mongodb+srv://maxchao1217_db_user:tdVet1d27bdWUSz2@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority
```

## 檢查步驟

### 1. 驗證連接字串格式
連接字串格式看起來正確，密碼 `tdVet1d27bdWUSz2` 不包含特殊字符，不需要 URL 編碼。

### 2. 檢查 Vercel 環境變數
1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `matchup-platform`
3. 進入 **Settings** → **Environment Variables**
4. 確認 `MONGODB_URI` 的值是否完全匹配上面的連接字串
5. **重要**：確保沒有多餘的空格或換行符

### 3. 檢查 MongoDB Atlas Network Access
1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 選擇專案 `match-point`
3. 點擊 **Network Access**（左側選單）
4. 確認有 `0.0.0.0/0` 在白名單中
5. 如果沒有，點擊 **Add IP Address** → 選擇 **Allow Access from Anywhere**
6. **等待 2-3 分鐘**讓設定生效

### 4. 檢查 MongoDB 用戶
1. 在 MongoDB Atlas 中，點擊 **Database Access**
2. 確認用戶 `maxchao1217_db_user` 存在
3. 確認密碼是 `tdVet1d27bdWUSz2`
4. 如果密碼不確定，點擊 **EDIT** → **Edit Password** 重置密碼

### 5. 檢查 Vercel 部署日誌
1. 在 Vercel Dashboard 中
2. 進入 **Deployments** → 選擇最新部署
3. 點擊 **Functions** 標籤
4. 查看 `api/index.ts` 的日誌
5. 查找以下訊息：
   - `✅ MongoDB 連接成功` - 連接成功
   - `❌ MongoDB 連接失敗:` - 查看具體錯誤訊息

### 6. 測試連接字串
使用 MongoDB Compass 測試：
1. 下載 [MongoDB Compass](https://www.mongodb.com/products/compass)
2. 使用相同的連接字串測試連接
3. 如果 Compass 可以連接，但 Vercel 不行，可能是環境變數問題

## 常見問題

### 問題 1: 環境變數未正確設置
**症狀**：`uri: "configured"` 但連接失敗
**解決**：
1. 在 Vercel 中刪除 `MONGODB_URI`
2. 重新添加，確保：
   - Key: `MONGODB_URI`
   - Value: 完整的連接字串（複製貼上，不要手動輸入）
   - Environment: 選擇所有環境
3. **重新部署**

### 問題 2: Network Access 未允許
**症狀**：連接超時
**解決**：
1. 確認 `0.0.0.0/0` 在白名單中
2. 等待幾分鐘讓設定生效
3. 重新部署 Vercel

### 問題 3: 密碼錯誤
**症狀**：`bad auth: authentication failed`
**解決**：
1. 在 MongoDB Atlas 中重置用戶密碼
2. 更新 Vercel 環境變數
3. 重新部署

### 問題 4: 連接字串中有隱藏字符
**症狀**：連接失敗但格式看起來正確
**解決**：
1. 在 Vercel 中刪除環境變數
2. 重新創建，手動輸入（不要複製貼上）
3. 確保沒有多餘的空格

## 調試步驟

### 步驟 1: 檢查 Vercel 日誌
查看具體的錯誤訊息，這會告訴我們確切的問題。

### 步驟 2: 驗證環境變數
在 Vercel 中，環境變數的值應該完全匹配：
```
mongodb+srv://maxchao1217_db_user:tdVet1d27bdWUSz2@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority
```

### 步驟 3: 測試本地連接
在本地使用相同的連接字串測試，確認連接字串本身是有效的。

### 步驟 4: 重新部署
修改環境變數後，**必須重新部署**才能生效。

## 快速修復

如果以上都檢查過了，嘗試：

1. **重置 MongoDB 用戶密碼**
   - 在 MongoDB Atlas 中重置 `maxchao1217_db_user` 的密碼
   - 使用簡單的密碼（只包含字母和數字）
   - 更新 Vercel 環境變數
   - 重新部署

2. **創建新用戶**
   - 在 MongoDB Atlas 中創建新用戶
   - 使用簡單的密碼
   - 更新連接字串
   - 更新 Vercel 環境變數
   - 重新部署

3. **檢查 Vercel 日誌**
   - 查看具體的錯誤訊息
   - 根據錯誤訊息進行修復

## 需要的信息

請提供：
1. Vercel 部署日誌中的 MongoDB 連接錯誤訊息（如果有）
2. MongoDB Compass 是否可以連接（如果測試過）
3. Network Access 是否已設置 `0.0.0.0/0`

