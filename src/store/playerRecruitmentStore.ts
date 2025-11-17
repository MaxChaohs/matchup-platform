import { create } from 'zustand';
import { PlayerRecruitment, MatchFilters } from '../types';
import { api } from '../services/api';

interface PlayerRecruitmentState {
  recruitments: PlayerRecruitment[];
  filters: MatchFilters;
  searchQuery: string;
  loading: boolean;
  setFilters: (filters: MatchFilters) => void;
  setSearchQuery: (query: string) => void;
  fetchRecruitments: () => Promise<void>;
  getFilteredRecruitments: () => PlayerRecruitment[];
}

export const usePlayerRecruitmentStore = create<PlayerRecruitmentState>((set, get) => ({
  recruitments: [],
  filters: {},
  searchQuery: '',
  loading: false,
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
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
  getFilteredRecruitments: () => {
    const { recruitments } = get();
    return recruitments;
  },
}));

