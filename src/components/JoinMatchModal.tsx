import { useState } from 'react';
import { TeamMatch, User, CreatorContact } from '../types';
import { api } from '../services/api';

interface JoinMatchModalProps {
  match: TeamMatch;
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JoinMatchModal({ match, user, onClose, onSuccess }: JoinMatchModalProps) {
  const [formData, setFormData] = useState({
    teamName: '',
    contactInfo: user.email || '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [creatorContact, setCreatorContact] = useState<CreatorContact | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = user._id || user.id;
      
      if (!userId) {
        setError('請重新登入');
        setLoading(false);
        return;
      }

      if (!formData.contactInfo.trim()) {
        setError('請填寫聯絡方式');
        setLoading(false);
        return;
      }

      const matchId = match._id || match.id;
      if (!matchId) {
        setError('對戰資訊錯誤');
        setLoading(false);
        return;
      }

      const result = await api.registerForMatch(matchId, {
        userId,
        teamName: formData.teamName || undefined,
        contactInfo: formData.contactInfo,
        message: formData.message || undefined,
      });

      setCreatorContact(result.creatorContact);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.message || '報名失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 my-8">
        {!success ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">加入對戰</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 對戰資訊 */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{match.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="text-orange-500">📍</span>
                  <span>{match.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-orange-500">🕐</span>
                  <span>{match.dayOfWeek} {match.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-orange-500">🏀</span>
                  <span>{match.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-orange-500">👥</span>
                  <span>每隊 {match.teamSize} 人</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  您的隊伍名稱
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  placeholder="例如：火箭隊"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  聯絡方式 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  placeholder="電話、LINE ID 或 Email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">報名成功後，建立者將可以看到您的聯絡方式</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備註訊息
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="想對建立者說的話..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? '報名中...' : '確認報名'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* 報名成功 */}
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">報名成功！</h2>
              <p className="text-gray-600 mb-6">您已成功報名此對戰</p>

              {creatorContact && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 text-left border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    建立者聯絡資訊
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 w-16">用戶名：</span>
                      <span className="font-medium text-gray-900">{creatorContact.username}</span>
                    </div>
                    {creatorContact.email && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 w-16">Email：</span>
                        <a href={`mailto:${creatorContact.email}`} className="font-medium text-blue-600 hover:underline">
                          {creatorContact.email}
                        </a>
                      </div>
                    )}
                    {creatorContact.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 w-16">電話：</span>
                        <a href={`tel:${creatorContact.phone}`} className="font-medium text-blue-600 hover:underline">
                          {creatorContact.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-medium shadow-md"
              >
                關閉
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

