# MongoDB 連接問題排查

## 當前狀態
錯誤訊息：`資料庫連接不可用，請稍後再試`

這表示 API 服務正常運行，但無法連接到 MongoDB。

## 立即檢查步驟

### 1. 檢查健康檢查端點

訪問以下 URL 查看詳細狀態：
```
https://matchup-platform.vercel.app/api/health
```

應該會返回類似：
```json
{
  "status": "ok",
  "message": "Match Point API is running",
  "database": {
    "status": "disconnected",
    "connected": false,
    "uri": "configured" 或 "not configured"
  }
}
```

### 2. 檢查 Vercel 環境變數

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇專案 `matchup-platform`
3. 進入 **Settings** → **Environment Variables**
4. 檢查 `MONGODB_URI` 是否存在

**如果不存在：**
- 點擊 **Add New**
- Key: `MONGODB_URI`
- Value: 你的 MongoDB 連接字串
- Environment: 選擇所有環境（Production, Preview, Development）
- 點擊 **Save**

**如果已存在：**
- 檢查連接字串格式是否正確
- 確認密碼已正確編碼（如果有特殊字符）

### 3. 驗證連接字串格式

正確格式：
```
mongodb+srv://maxchao1217_db_user:密碼@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority
```

**重要檢查點：**
- ✅ 用戶名：`maxchao1217_db_user`
- ✅ 密碼：已正確設置（如果包含特殊字符，需要 URL 編碼）
- ✅ Cluster 地址：`cluster0.a9mdozn.mongodb.net`
- ✅ 資料庫名稱：`match-point`
- ✅ 參數：`?retryWrites=true&w=majority`

### 4. 密碼 URL 編碼

如果密碼包含特殊字符，必須編碼：

| 字符 | 編碼 |
|------|------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |
| `+` | `%2B` |
| `=` | `%3D` |
| 空格 | `%20` |

**範例：**
- 原始密碼：`P@ss#123`
- 編碼後：`P%40ss%23123`
- 連接字串：`mongodb+srv://maxchao1217_db_user:P%40ss%23123@cluster0.a9mdozn.mongodb.net/match-point?retryWrites=true&w=majority`

### 5. 檢查 MongoDB Atlas Network Access

1. 登入 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 選擇專案 `match-point`
3. 點擊 **Network Access**（左側選單）
4. 確認有 `0.0.0.0/0` 在白名單中（允許所有 IP）

**如果沒有：**
1. 點擊 **Add IP Address**
2. 選擇 **Allow Access from Anywhere**
3. 或手動輸入 `0.0.0.0/0`
4. 點擊 **Confirm**
5. 等待幾分鐘讓設定生效

### 6. 重新部署

修改環境變數後，**必須重新部署**：

1. 在 Vercel Dashboard 中
2. 進入 **Deployments**
3. 點擊最新部署旁邊的 **"..."** 菜單
4. 選擇 **Redeploy**
5. 或推送新的 commit 觸發自動部署

### 7. 檢查 Vercel 部署日誌

1. 在 Vercel Dashboard 中
2. 進入 **Deployments** → 選擇最新部署
3. 點擊 **Functions** 標籤
4. 查看 `api/index.ts` 的日誌
5. 查找以下訊息：
   - `✅ MongoDB 連接成功` - 連接成功
   - `❌ MongoDB 連接失敗:` - 連接失敗，查看錯誤詳情

## 常見錯誤訊息

### 錯誤 1: `bad auth: authentication failed`
**原因**：用戶名或密碼錯誤
**解決**：
- 確認 MongoDB Atlas 中的用戶名和密碼
- 確認密碼中的特殊字符已正確編碼
- 重置用戶密碼（使用簡單密碼）

### 錯誤 2: `connection timeout`
**原因**：Network Access 未允許 Vercel 的 IP
**解決**：
- 在 MongoDB Atlas 中添加 `0.0.0.0/0` 到白名單
- 等待幾分鐘讓設定生效

### 錯誤 3: `MONGODB_URI` 顯示 `not configured`
**原因**：環境變數未設置
**解決**：
- 在 Vercel 中設置 `MONGODB_URI` 環境變數
- 重新部署

## 快速測試

### 測試 1: 健康檢查
```bash
curl https://matchup-platform.vercel.app/api/health
```

### 測試 2: 使用 MongoDB Compass
1. 下載 [MongoDB Compass](https://www.mongodb.com/products/compass)
2. 使用相同的連接字串測試連接
3. 如果 Compass 可以連接，但 Vercel 不行，可能是環境變數問題

## 建議的解決方案

如果問題持續，建議：

1. **重置 MongoDB 用戶密碼**
   - 在 MongoDB Atlas 中，點擊用戶 `maxchao1217_db_user` 的 **EDIT**
   - 點擊 **Edit Password**
   - 設置一個簡單的密碼（只包含字母和數字）
   - 更新 Vercel 環境變數
   - 重新部署

2. **創建新用戶**
   - 在 MongoDB Atlas 中創建新用戶
   - 使用簡單的密碼
   - 更新連接字串
   - 更新 Vercel 環境變數
   - 重新部署

## 檢查清單

- [ ] 訪問 `/api/health` 查看數據庫狀態
- [ ] 確認 Vercel 環境變數 `MONGODB_URI` 已設置
- [ ] 確認連接字串格式正確
- [ ] 確認密碼中的特殊字符已編碼
- [ ] 確認 MongoDB Atlas Network Access 已允許 `0.0.0.0/0`
- [ ] 確認 MongoDB 用戶存在且密碼正確
- [ ] 已重新部署 Vercel 專案
- [ ] 檢查 Vercel 部署日誌中的 MongoDB 連接訊息

