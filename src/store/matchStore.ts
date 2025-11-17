import { create } from 'zustand';
import { Match, MatchFilters, MatchCategory, Region, DayOfWeek } from '../types';

interface MatchState {
  matches: Match[];
  filters: MatchFilters;
  searchQuery: string;
  setFilters: (filters: MatchFilters) => void;
  setSearchQuery: (query: string) => void;
  addMatch: (match: Omit<Match, 'id' | 'createdAt' | 'creatorId' | 'creatorName'>) => void;
  getFilteredMatches: () => Match[];
  getAllMatches: () => Match[];
}

// 生成測試對戰數據
const generateMockMatches = (): Match[] => {
  const categories: MatchCategory[] = ['籃球', '足球', '羽球', '桌球', '網球', '排球'];
  const regions: Region[] = ['北部', '中部', '南部'];
  const days: DayOfWeek[] = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `match-${i + 1}`,
    title: `${categories[i % categories.length]}約戰 - ${i + 1}`,
    category: categories[i % categories.length],
    region: regions[i % regions.length],
    dayOfWeek: days[i % days.length],
    time: `${10 + (i % 12)}:00`,
    location: `${regions[i % regions.length]}地區 - 場地${i + 1}`,
    description: `這是一場精彩的${categories[i % categories.length]}對戰`,
    creatorId: i % 2 === 0 ? '1' : '2',
    creatorName: i % 2 === 0 ? 'test' : 'admin',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    participants: (i % 5) + 1,
    maxParticipants: 10,
  }));
};

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: generateMockMatches(),
  filters: {},
  searchQuery: '',
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  addMatch: (match) => {
    const newMatch: Match = {
      ...match,
      id: `match-${Date.now()}`,
      createdAt: new Date().toISOString(),
      creatorId: '1', // 從 auth store 獲取
      creatorName: 'test', // 從 auth store 獲取
    };
    set((state) => ({ matches: [newMatch, ...state.matches] }));
  },
  getFilteredMatches: () => {
    const { matches, filters, searchQuery } = get();
    return matches.filter((match) => {
      // 篩選條件
      if (filters.category && match.category !== filters.category) return false;
      if (filters.region && match.region !== filters.region) return false;
      if (filters.dayOfWeek && match.dayOfWeek !== filters.dayOfWeek) return false;
      
      // 搜尋條件
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${match.title} ${match.category} ${match.region} ${match.location} ${match.description || ''} ${match.creatorName}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  },
  getAllMatches: () => {
    const { matches, filters, searchQuery } = get();
    return matches.filter((match) => {
      // 篩選條件
      if (filters.category && match.category !== filters.category) return false;
      if (filters.region && match.region !== filters.region) return false;
      if (filters.dayOfWeek && match.dayOfWeek !== filters.dayOfWeek) return false;
      
      // 搜尋條件
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableText = `${match.title} ${match.category} ${match.region} ${match.location} ${match.description || ''} ${match.creatorName}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  },
}));

