import { useState, useEffect } from 'react';
import { MatchRegistration, RecruitmentApplication } from '../types';
import { api } from '../services/api';

interface RegistrationListProps {
  type: 'match' | 'recruitment';
  itemId: string;
  userId?: string;
  onClose: () => void;
}

export default function RegistrationList({ type, itemId, userId, onClose }: RegistrationListProps) {
  const [registrations, setRegistrations] = useState<(MatchRegistration | RecruitmentApplication)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [itemId, type]);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      if (type === 'match') {
        const result = await api.getMatchRegistrations(itemId, userId);
        setRegistrations(result.registrations);
        setIsCreator(result.isCreator);
      } else {
        const result = await api.getRecruitmentApplications(itemId, userId);
        setRegistrations(result.applications);
        setIsCreator(result.isCreator);
      }
    } catch (err: any) {
      setError(err.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (regId: string, status: string) => {
    try {
      if (type === 'match') {
        await api.updateMatchRegistration(itemId, regId, status);
      } else {
        await api.updateRecruitmentApplication(itemId, regId, status);
      }
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || '更新失敗');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">已接受</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">已拒絕</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">待處理</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'match' ? '報名者清單' : '應徵者清單'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500">目前還沒有人報名</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg) => (
              <div 
                key={reg._id} 
                className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all bg-gradient-to-br from-white to-gray-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {reg.user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.user?.username || '未知用戶'}</h3>
                      {'teamName' in reg && reg.teamName && (
                        <p className="text-sm text-gray-500">隊伍：{reg.teamName}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(reg.status)}
                </div>

                {/* 聯絡資訊 */}
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    聯絡方式
                  </h4>
                  <p className="text-sm text-gray-700">{reg.contactInfo}</p>
                  {reg.user?.email && reg.user.email !== reg.contactInfo && (
                    <p className="text-sm text-gray-500 mt-1">Email: {reg.user.email}</p>
                  )}
                  {reg.user?.phone && (
                    <p className="text-sm text-gray-500 mt-1">電話: {reg.user.phone}</p>
                  )}
                </div>

                {/* 備註訊息 */}
                {reg.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">備註訊息</h4>
                    <p className="text-sm text-gray-700">{reg.message}</p>
                  </div>
                )}

                {/* 報名時間 */}
                <p className="text-xs text-gray-400 mb-3">
                  報名時間：{new Date(reg.createdAt).toLocaleString('zh-TW')}
                </p>

                {/* 操作按鈕（僅建立者可見） */}
                {isCreator && reg.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateStatus(reg._id, 'accepted')}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all text-sm font-medium"
                    >
                      接受
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(reg._id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-medium"
                    >
                      拒絕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}

