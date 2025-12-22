import { create } from 'zustand';
import { PlayerRecruitment, MatchFilters } from '../types';
import { api } from '../services/api';

interface PlayerRecruitmentState {
  recruitments: PlayerRecruitment[];
  allRecruitments: PlayerRecruitment[]; // 所有招募（不受篩選影響，用於「我建立的招募」）
  filters: MatchFilters;
  searchQuery: string;
  loading: boolean;
  setFilters: (filters: MatchFilters) => void;
  setSearchQuery: (query: string) => void;
  fetchRecruitments: () => Promise<void>;
  fetchAllRecruitments: () => Promise<void>; // 獲取所有招募
  getFilteredRecruitments: () => PlayerRecruitment[];
  getAllRecruitments: () => PlayerRecruitment[];
}

export const usePlayerRecruitmentStore = create<PlayerRecruitmentState>((set, get) => ({
  recruitments: [],
  allRecruitments: [],
  filters: {},
  searchQuery: '',
  loading: false,
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // 獲取篩選後的招募（用於搜尋結果）
  fetchRecruitments: async () => {
    set({ loading: true });
    try {
      const { filters, searchQuery } = get();
      const recruitments = await api.getPlayerRecruitments({
        category: filters.category,
        region: filters.region,
        dayOfWeek: filters.dayOfWeek,
        search: searchQuery || undefined,
      });
      set({ recruitments, loading: false });
    } catch (error) {
      console.error('Failed to fetch recruitments:', error);
      set({ loading: false });
    }
  },
  
  // 獲取所有招募（不受篩選影響，用於「我建立的招募」）
  fetchAllRecruitments: async () => {
    try {
      const recruitments = await api.getPlayerRecruitments();
      set({ allRecruitments: recruitments });
    } catch (error) {
      console.error('Failed to fetch all recruitments:', error);
    }
  },
  
  getFilteredRecruitments: () => {
    const { recruitments } = get();
    return recruitments;
  },
  
  getAllRecruitments: () => {
    const { allRecruitments } = get();
    return allRecruitments;
  },
}));
