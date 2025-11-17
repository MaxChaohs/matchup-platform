import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTeamMatchStore } from '../store/teamMatchStore';
import { usePlayerRecruitmentStore } from '../store/playerRecruitmentStore';
import { MatchCategory, Region, DayOfWeek, ViewMode, TeamMatch, PlayerRecruitment } from '../types';
import EditUserModal from '../components/EditUserModal';
import CreateTeamMatchModal from '../components/CreateTeamMatchModal';
import CreatePlayerRecruitmentModal from '../components/CreatePlayerRecruitmentModal';
import EditTeamMatchModal from '../components/EditTeamMatchModal';
import EditPlayerRecruitmentModal from '../components/EditPlayerRecruitmentModal';
import { api } from '../services/api';

export default function Home() {
  const { user, logout } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('team-match');
  const [showEditUser, setShowEditUser] = useState(false);
  const [showCreateTeamMatch, setShowCreateTeamMatch] = useState(false);
  const [showCreateRecruitment, setShowCreateRecruitment] = useState(false);
  const [editingMatch, setEditingMatch] = useState<TeamMatch | null>(null);
  const [editingRecruitment, setEditingRecruitment] = useState<PlayerRecruitment | null>(null);
  
  // 隊伍對戰相關
  const teamMatchStore = useTeamMatchStore();
  const teamMatches = teamMatchStore.getFilteredTeamMatches();
  
  // 檢查是否為建立者的輔助函數
  const isCreator = (item: TeamMatch | PlayerRecruitment) => {
    if (!user) return false;
    const userId = user._id || user.id;
    const creatorId = typeof item.creatorId === 'string' 
      ? item.creatorId 
      : item.creatorId?._id || item.creatorId;
    return creatorId === userId;
  };
  
  const userTeamMatches = teamMatches.filter(match => isCreator(match));
  
  // 尋找隊員相關
  const playerRecruitmentStore = usePlayerRecruitmentStore();
  const recruitments = playerRecruitmentStore.getFilteredRecruitments();
  const userRecruitments = recruitments.filter(rec => isCreator(rec));

  const categories: MatchCategory[] = ['籃球', '足球', '羽球', '桌球', '網球', '排球', '其他'];
  const regions: Region[] = ['北部', '中部', '南部'];
  const days: DayOfWeek[] = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  // 根據模式選擇對應的store
  const currentFilters = viewMode === 'team-match' 
    ? teamMatchStore.filters 
    : playerRecruitmentStore.filters;
  const currentSearchQuery = viewMode === 'team-match'
    ? teamMatchStore.searchQuery
    : playerRecruitmentStore.searchQuery;

  const handleFilterChange = (key: keyof typeof currentFilters, value: string | undefined) => {
    const newFilters = {
      ...currentFilters,
      [key]: value || undefined,
    };
    if (viewMode === 'team-match') {
      teamMatchStore.setFilters(newFilters);
    } else {
      playerRecruitmentStore.setFilters(newFilters);
    }
  };

  const handleSearchChange = (query: string) => {
    if (viewMode === 'team-match') {
      teamMatchStore.setSearchQuery(query);
    } else {
      playerRecruitmentStore.setSearchQuery(query);
    }
  };

  const clearFilters = () => {
    if (viewMode === 'team-match') {
      teamMatchStore.setFilters({});
      teamMatchStore.setSearchQuery('');
    } else {
      playerRecruitmentStore.setFilters({});
      playerRecruitmentStore.setSearchQuery('');
    }
  };

  // 獲取數據
  useEffect(() => {
    teamMatchStore.fetchTeamMatches();
    playerRecruitmentStore.fetchRecruitments();
  }, []);

  // 當篩選或搜尋改變時重新獲取數據
  useEffect(() => {
    teamMatchStore.fetchTeamMatches();
  }, [teamMatchStore.filters.category, teamMatchStore.filters.region, teamMatchStore.filters.dayOfWeek, teamMatchStore.searchQuery]);

  useEffect(() => {
    playerRecruitmentStore.fetchRecruitments();
  }, [playerRecruitmentStore.filters.category, playerRecruitmentStore.filters.region, playerRecruitmentStore.filters.dayOfWeek, playerRecruitmentStore.searchQuery]);

  // 處理刪除用戶
  const handleDeleteUser = async () => {
    if (!user) return;
    if (!confirm('確定要刪除帳號嗎？此操作無法復原！')) return;
    
    try {
      const userId = user._id || user.id;
      await api.deleteUser(userId!);
      logout();
    } catch (error: any) {
      alert(error.message || '刪除失敗');
    }
  };

  // 處理刪除對戰
  const handleDeleteTeamMatch = async (match: TeamMatch) => {
    if (!confirm('確定要刪除此對戰嗎？')) return;
    
    try {
      const matchId = match._id || match.id;
      await api.deleteTeamMatch(matchId);
      teamMatchStore.fetchTeamMatches();
    } catch (error: any) {
      alert(error.message || '刪除失敗');
    }
  };

  // 處理刪除招募
  const handleDeleteRecruitment = async (recruitment: PlayerRecruitment) => {
    if (!confirm('確定要刪除此招募嗎？')) return;
    
    try {
      const recruitmentId = recruitment._id || recruitment.id;
      await api.deletePlayerRecruitment(recruitmentId);
      playerRecruitmentStore.fetchRecruitments();
    } catch (error: any) {
      alert(error.message || '刪除失敗');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                MATCH POINT
              </h1>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>登出</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Personal Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-orange-500 mb-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">個人資訊</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-orange-400 mx-auto rounded-full"></div>
              </div>
              <div className="space-y-5">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">使用者名稱</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{user?.username}</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">電子郵件</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 break-all">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border-l-4 border-orange-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">電話</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
              {/* 編輯和刪除按鈕 */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setShowEditUser(true)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors text-sm"
                >
                  編輯資訊
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  刪除帳號
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mode Toggle */}
            <div className="bg-white rounded-xl shadow-xl p-4 mb-6 border-t-4 border-blue-500">
              <div className="flex space-x-4">
                <button
                  onClick={() => setViewMode('team-match')}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                    viewMode === 'team-match'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>找隊伍</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('find-player')}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                    viewMode === 'find-player'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>找隊員</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-purple-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">搜尋{viewMode === 'team-match' ? '隊伍對戰' : '隊員招募'}</h2>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={currentSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={viewMode === 'team-match' 
                    ? '搜尋隊伍對戰標題、類別、地區、地點或建立者...'
                    : '搜尋隊員招募標題、類別、地區、地點或建立者...'}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:border-gray-300 text-lg"
                />
                {currentSearchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {currentSearchQuery && (
                <p className="mt-3 text-sm text-gray-600">
                  找到 <span className="font-bold text-purple-600">
                    {viewMode === 'team-match' ? teamMatches.length : recruitments.length}
                  </span> 個符合條件的{viewMode === 'team-match' ? '對戰' : '招募'}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-blue-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">篩選條件</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>對戰類別</span>
                  </label>
                  <select
                    value={currentFilters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm hover:border-gray-300"
                  >
                    <option value="">全部類別</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>地區</span>
                  </label>
                  <select
                    value={currentFilters.region || ''}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:border-gray-300"
                  >
                    <option value="">全部地區</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>時間</span>
                  </label>
                  <select
                    value={currentFilters.dayOfWeek || ''}
                    onChange={(e) => handleFilterChange('dayOfWeek', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:border-gray-300"
                  >
                    <option value="">全部時間</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(currentFilters.category || currentFilters.region || currentFilters.dayOfWeek || currentSearchQuery) && (
                <button
                  onClick={clearFilters}
                  className="mt-5 px-5 py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>清除篩選</span>
                </button>
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'team-match' ? (
              <>
                {/* All Team Matches */}
                {currentSearchQuery && (
                  <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">搜尋結果</h2>
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full font-bold shadow-md">
                        {teamMatches.length}
                      </div>
                    </div>
                    {teamMatches.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-700">沒有找到符合條件的隊伍對戰</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {teamMatches.map((match) => (
                          <div key={match._id || match.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{match.title}</h3>
                                <p className="text-sm text-gray-500">建立者：<span className="font-semibold text-gray-700">{match.creatorName}</span></p>
                              </div>
                              <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-sm">
                                {match.category}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">地區：</span>
                                  <span className="text-gray-900 font-bold ml-1">{match.region}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">時間：</span>
                                  <span className="text-gray-900 font-bold ml-1">{match.dayOfWeek} {match.time}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">地點：</span>
                                  <span className="text-gray-900 font-bold ml-1">{match.location}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">隊伍：</span>
                                  <span className="text-gray-900 font-bold ml-1">
                                    {match.currentTeams} / {match.maxTeams} 隊
                                  </span>
                                  <span className="text-gray-500 ml-2">（每隊 {match.teamSize} 人）</span>
                                </div>
                              </div>
                            </div>
                            {match.description && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                <p className="text-sm text-gray-700">{match.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User's Team Matches */}
                <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-green-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">我建立的隊伍對戰</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowCreateTeamMatch(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors text-sm font-semibold"
                      >
                        + 建立對戰
                      </button>
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-md">
                        {userTeamMatches.length}
                      </div>
                    </div>
                  </div>
                  {userTeamMatches.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">目前沒有建立的隊伍對戰</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTeamMatches.map((match) => (
                        <div key={match._id || match.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-orange-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex-1">{match.title}</h3>
                            <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-sm">
                              {match.category}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">地區：</span>
                                <span className="text-gray-900 font-bold ml-1">{match.region}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">時間：</span>
                                <span className="text-gray-900 font-bold ml-1">{match.dayOfWeek} {match.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">地點：</span>
                                <span className="text-gray-900 font-bold ml-1">{match.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">隊伍：</span>
                                <span className="text-gray-900 font-bold ml-1">
                                  {match.currentTeams} / {match.maxTeams} 隊
                                </span>
                                <span className="text-gray-500 ml-2">（每隊 {match.teamSize} 人）</span>
                              </div>
                            </div>
                          </div>
                          {match.description && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                              <p className="text-sm text-gray-700">{match.description}</p>
                            </div>
                          )}
                          {/* 編輯和刪除按鈕 */}
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => setEditingMatch(match)}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeleteTeamMatch(match)}
                              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* All Player Recruitments */}
                {currentSearchQuery && (
                  <div className="bg-white rounded-xl shadow-xl p-6 mb-6 border-t-4 border-indigo-500">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">搜尋結果</h2>
                      </div>
                      <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full font-bold shadow-md">
                        {recruitments.length}
                      </div>
                    </div>
                    {recruitments.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-gray-700">沒有找到符合條件的隊員招募</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recruitments.map((recruitment) => (
                          <div key={recruitment._id || recruitment.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{recruitment.title}</h3>
                                <p className="text-sm text-gray-500">建立者：<span className="font-semibold text-gray-700">{recruitment.creatorName}</span></p>
                              </div>
                              <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-sm">
                                {recruitment.category}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">地區：</span>
                                  <span className="text-gray-900 font-bold ml-1">{recruitment.region}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">時間：</span>
                                  <span className="text-gray-900 font-bold ml-1">{recruitment.dayOfWeek} {recruitment.time}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">地點：</span>
                                  <span className="text-gray-900 font-bold ml-1">{recruitment.location}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">隊員：</span>
                                  <span className="text-gray-900 font-bold ml-1">
                                    {recruitment.currentPlayers} / {recruitment.currentPlayers + recruitment.neededPlayers} 人
                                  </span>
                                  <span className="text-green-600 font-semibold ml-2">（還缺 {recruitment.neededPlayers} 人）</span>
                                </div>
                              </div>
                            </div>
                            {recruitment.description && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                                <p className="text-sm text-gray-700">{recruitment.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* User's Player Recruitments */}
                <div className="bg-white rounded-xl shadow-xl p-6 border-t-4 border-green-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">我建立的隊員招募</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowCreateRecruitment(true)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-sm font-semibold"
                      >
                        + 建立招募
                      </button>
                      <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold shadow-md">
                        {userRecruitments.length}
                      </div>
                    </div>
                  </div>
                  {userRecruitments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-lg font-semibold text-gray-700">目前沒有建立的隊員招募</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRecruitments.map((recruitment) => (
                        <div key={recruitment._id || recruitment.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex-1">{recruitment.title}</h3>
                            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full shadow-sm">
                              {recruitment.category}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">地區：</span>
                                <span className="text-gray-900 font-bold ml-1">{recruitment.region}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">時間：</span>
                                <span className="text-gray-900 font-bold ml-1">{recruitment.dayOfWeek} {recruitment.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">地點：</span>
                                <span className="text-gray-900 font-bold ml-1">{recruitment.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-gray-500 font-medium">隊員：</span>
                                <span className="text-gray-900 font-bold ml-1">
                                  {recruitment.currentPlayers} / {recruitment.currentPlayers + recruitment.neededPlayers} 人
                                </span>
                                <span className="text-green-600 font-semibold ml-2">（還缺 {recruitment.neededPlayers} 人）</span>
                              </div>
                            </div>
                          </div>
                          {recruitment.description && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                              <p className="text-sm text-gray-700">{recruitment.description}</p>
                            </div>
                          )}
                          {/* 編輯和刪除按鈕 */}
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => setEditingRecruitment(recruitment)}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDeleteRecruitment(recruitment)}
                              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditUser && user && (
        <EditUserModal
          user={user}
          onClose={() => setShowEditUser(false)}
          onSuccess={async () => {
            // 重新獲取用戶資訊（可以從API獲取更新後的用戶）
            setShowEditUser(false);
            // 可以選擇重新登入或更新store中的用戶資訊
          }}
        />
      )}

      {showCreateTeamMatch && user && (
        <CreateTeamMatchModal
          user={user}
          onClose={() => setShowCreateTeamMatch(false)}
          onSuccess={() => {
            teamMatchStore.fetchTeamMatches();
            setShowCreateTeamMatch(false);
          }}
        />
      )}

      {showCreateRecruitment && user && (
        <CreatePlayerRecruitmentModal
          user={user}
          onClose={() => setShowCreateRecruitment(false)}
          onSuccess={() => {
            playerRecruitmentStore.fetchRecruitments();
            setShowCreateRecruitment(false);
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

      {editingRecruitment && (
        <EditPlayerRecruitmentModal
          recruitment={editingRecruitment}
          onClose={() => setEditingRecruitment(null)}
          onSuccess={() => {
            playerRecruitmentStore.fetchRecruitments();
            setEditingRecruitment(null);
          }}
        />
      )}
    </div>
  );
}
