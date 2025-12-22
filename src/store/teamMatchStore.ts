import { create } from 'zustand';
import { TeamMatch, MatchFilters } from '../types';
import { api } from '../services/api';

interface TeamMatchState {
  teamMatches: TeamMatch[];
  allTeamMatches: TeamMatch[]; // 所有對戰（不受篩選影響，用於「我建立的對戰」）
  filters: MatchFilters;
  searchQuery: string;
  loading: boolean;
  setFilters: (filters: MatchFilters) => void;
  setSearchQuery: (query: string) => void;
  fetchTeamMatches: () => Promise<void>;
  fetchAllTeamMatches: () => Promise<void>; // 獲取所有對戰
  getFilteredTeamMatches: () => TeamMatch[];
  getAllTeamMatches: () => TeamMatch[];
}

export const useTeamMatchStore = create<TeamMatchState>((set, get) => ({
  teamMatches: [],
  allTeamMatches: [],
  filters: {},
  searchQuery: '',
  loading: false,
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // 獲取篩選後的對戰（用於搜尋結果）
  fetchTeamMatches: async () => {
    set({ loading: true });
    try {
      const { filters, searchQuery } = get();
      const matches = await api.getTeamMatches({
        category: filters.category,
        region: filters.region,
        dayOfWeek: filters.dayOfWeek,
        search: searchQuery || undefined,
      });
      set({ teamMatches: matches, loading: false });
    } catch (error) {
      console.error('Failed to fetch team matches:', error);
      set({ loading: false });
    }
  },
  
  // 獲取所有對戰（不受篩選影響，用於「我建立的對戰」）
  fetchAllTeamMatches: async () => {
    try {
      const matches = await api.getTeamMatches();
      set({ allTeamMatches: matches });
    } catch (error) {
      console.error('Failed to fetch all team matches:', error);
    }
  },
  
  getFilteredTeamMatches: () => {
    const { teamMatches } = get();
    return teamMatches;
  },
  
  getAllTeamMatches: () => {
    const { allTeamMatches } = get();
    return allTeamMatches;
  },
}));
