import { useState } from 'react';
import { MatchCategory, Region, DayOfWeek, User } from '../types';
import { api } from '../services/api';

interface CreatePlayerRecruitmentModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePlayerRecruitmentModal({ user, onClose, onSuccess }: CreatePlayerRecruitmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '籃球' as MatchCategory,
    region: '北部' as Region,
    dayOfWeek: '週一' as DayOfWeek,
    time: '',
    location: '',
    description: '',
    neededPlayers: 2,
    teamName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories: MatchCategory[] = ['籃球', '足球', '羽球', '桌球', '網球', '排球', '其他'];
  const regions: Region[] = ['北部', '中部', '南部'];
  const days: DayOfWeek[] = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = user._id || user.id;
      
      // 檢查用戶 ID 是否為有效的 MongoDB ObjectId
      if (!userId || userId === '1' || userId === '2') {
        setError('請重新登入以獲取有效的用戶 ID');
        setLoading(false);
        return;
      }

      await api.createPlayerRecruitment({
        ...formData,
        creatorId: userId,
        creatorName: user.username,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      // 檢查是否為無效用戶 ID 錯誤
      if (err.message && err.message.includes('無效的用戶 ID')) {
        setError('請重新登入以獲取有效的用戶 ID');
      } else {
        setError(err.message || '建立失敗');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">建立隊員招募</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類別 *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as MatchCategory })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">地區 *</label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value as Region })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">時間 *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">具體時間 *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">需要隊員數 *</label>
              <input
                type="number"
                min="1"
                value={formData.neededPlayers}
                onChange={(e) => setFormData({ ...formData, neededPlayers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地點 *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">隊伍名稱</label>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? '建立中...' : '建立招募'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

