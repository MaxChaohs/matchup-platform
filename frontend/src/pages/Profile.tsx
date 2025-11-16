import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { matchService } from '../services/matchService';
import { Match } from '../types';

const Profile = () => {
  const { user } = useAuthStore();
  const [createdMatches, setCreatedMatches] = useState<Match[]>([]);
  const [participatedMatches, setParticipatedMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserMatches();
  }, []);

  const loadUserMatches = async () => {
    try {
      const [created, participated] = await Promise.all([
        matchService.getUserMatches('created'),
        matchService.getUserMatches('participated'),
      ]);
      setCreatedMatches(created.matches);
      setParticipatedMatches(participated.matches);
    } catch (error) {
      console.error('載入比賽失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF5E6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/" className="text-green-600 hover:underline">← 返回首頁</Link>
        </div>

        <h1 className="text-3xl font-bold text-black mb-8">個人中心</h1>

        {/* 使用者資訊 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">基本資訊</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">使用者名稱：</span>
              <span className="text-black font-medium">{user?.username}</span>
            </div>
            <div>
              <span className="text-gray-600">電子郵件：</span>
              <span className="text-black font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* 創建的比賽 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">我創建的比賽</h2>
          {loading ? (
            <div className="text-center py-12">載入中...</div>
          ) : createdMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-white rounded-lg shadow-md">
              還沒有創建任何比賽
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdMatches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-black mb-2">{match.title}</h3>
                  <p className="text-gray-600 mb-4">{match.description}</p>
                  <div className="text-sm text-gray-600">
                    <div>類型: {match.type === 'sport' ? '運動' : '電子競技'}</div>
                    <div>地點: {match.location}</div>
                    <div>時間: {new Date(match.startTime).toLocaleString('zh-TW')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 參與的比賽 */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-4">我參與的比賽</h2>
          {loading ? (
            <div className="text-center py-12">載入中...</div>
          ) : participatedMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-white rounded-lg shadow-md">
              還沒有參與任何比賽
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participatedMatches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-black mb-2">{match.title}</h3>
                  <p className="text-gray-600 mb-4">{match.description}</p>
                  <div className="text-sm text-gray-600">
                    <div>類型: {match.type === 'sport' ? '運動' : '電子競技'}</div>
                    <div>地點: {match.location}</div>
                    <div>時間: {new Date(match.startTime).toLocaleString('zh-TW')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

