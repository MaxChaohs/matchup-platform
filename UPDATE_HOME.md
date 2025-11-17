# Home.tsx 更新說明

需要在 `src/pages/Home.tsx` 中添加以下功能：

## 1. 導入必要的模組和組件

在文件開頭添加：
```typescript
import { useEffect } from 'react';
import EditUserModal from '../components/EditUserModal';
import CreateTeamMatchModal from '../components/CreateTeamMatchModal';
import CreatePlayerRecruitmentModal from '../components/CreatePlayerRecruitmentModal';
import EditTeamMatchModal from '../components/EditTeamMatchModal';
import { api } from '../services/api';
```

## 2. 添加狀態管理

在組件中添加：
```typescript
const [showEditUser, setShowEditUser] = useState(false);
const [showCreateTeamMatch, setShowCreateTeamMatch] = useState(false);
const [showCreateRecruitment, setShowCreateRecruitment] = useState(false);
const [editingMatch, setEditingMatch] = useState<TeamMatch | null>(null);
```

## 3. 添加 useEffect 獲取數據

```typescript
useEffect(() => {
  teamMatchStore.fetchTeamMatches();
  playerRecruitmentStore.fetchRecruitments();
}, []);

useEffect(() => {
  teamMatchStore.fetchTeamMatches();
}, [teamMatchStore.filters, teamMatchStore.searchQuery]);

useEffect(() => {
  playerRecruitmentStore.fetchRecruitments();
}, [playerRecruitmentStore.filters, playerRecruitmentStore.searchQuery]);
```

## 4. 在個人資訊卡片中添加編輯/刪除按鈕

在個人資訊卡片底部添加：
```typescript
<div className="flex space-x-2 mt-4">
  <button
    onClick={() => setShowEditUser(true)}
    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors text-sm"
  >
    編輯資訊
  </button>
  <button
    onClick={async () => {
      if (confirm('確定要刪除帳號嗎？')) {
        try {
          const userId = user?._id || user?.id;
          await api.deleteUser(userId!);
          logout();
        } catch (error) {
          alert('刪除失敗');
        }
      }
    }}
    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
  >
    刪除帳號
  </button>
</div>
```

## 5. 在「我建立的隊伍對戰」標題旁添加「建立」按鈕

```typescript
<div className="flex items-center justify-between mb-6">
  <div className="flex items-center space-x-3">
    {/* 現有的標題 */}
  </div>
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setShowCreateTeamMatch(true)}
      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
    >
      建立對戰
    </button>
  </div>
</div>
```

## 6. 在每個對戰卡片中添加編輯/刪除按鈕

在對戰卡片底部添加（僅當是建立者時顯示）：
```typescript
{user && (match.creatorId === user._id || match.creatorId === user.id || 
  (typeof match.creatorId === 'object' && match.creatorId._id === (user._id || user.id))) && (
  <div className="flex space-x-2 mt-4">
    <button
      onClick={() => setEditingMatch(match)}
      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
    >
      編輯
    </button>
    <button
      onClick={async () => {
        if (confirm('確定要刪除此對戰嗎？')) {
          try {
            const matchId = match._id || match.id;
            await api.deleteTeamMatch(matchId);
            teamMatchStore.fetchTeamMatches();
          } catch (error) {
            alert('刪除失敗');
          }
        }
      }}
      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
    >
      刪除
    </button>
  </div>
)}
```

## 7. 添加 Modal 組件

在組件返回的 JSX 末尾添加：
```typescript
{showEditUser && user && (
  <EditUserModal
    user={user}
    onClose={() => setShowEditUser(false)}
    onSuccess={() => {
      // 重新獲取用戶資訊
      teamMatchStore.fetchTeamMatches();
      playerRecruitmentStore.fetchRecruitments();
    }}
  />
)}

{showCreateTeamMatch && user && (
  <CreateTeamMatchModal
    user={user}
    onClose={() => setShowCreateTeamMatch(false)}
    onSuccess={() => {
      teamMatchStore.fetchTeamMatches();
    }}
  />
)}

{editingMatch && (
  <EditTeamMatchModal
    match={editingMatch}
    onClose={() => setEditingMatch(null)}
    onSuccess={() => {
      teamMatchStore.fetchTeamMatches();
      setEditingMatch(null);
    }}
  />
)}
```

## 8. 同樣的方式處理隊員招募

對「我建立的隊員招募」部分應用相同的模式。

