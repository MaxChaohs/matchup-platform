import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { matchService } from '../services/matchService';
import type { Match } from '../types';

const Home = () => {
  const { user, logout } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await matchService.getMatches();
      setMatches(data.matches);
    } catch (error) {
      console.error('載入比賽失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5E6' }}>
      {/* 導航欄 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">MATCH POINT</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/create-match"
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: '#10B981' }}
              >
                創建比賽
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-gray-900"
              >
                {user?.username}
              </Link>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要內容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-black mb-6">比賽列表</h2>
        
        {loading ? (
          <div className="text-center py-12">載入中...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            目前沒有比賽，<Link to="/create-match" className="text-green-600 hover:underline">創建第一個比賽</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-black">{match.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      match.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : match.status === 'full'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {match.status === 'open' ? '開放' : match.status === 'full' ? '已滿' : '已結束'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{match.description}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>類型: {match.type === 'sport' ? '運動' : '電子競技'}</div>
                  <div>類別: {match.category}</div>
                  <div>地點: {match.location}</div>
                  <div>時間: {new Date(match.startTime).toLocaleString('zh-TW')}</div>
                  <div>
                    參與人數: {match.currentParticipants} / {match.maxParticipants}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

