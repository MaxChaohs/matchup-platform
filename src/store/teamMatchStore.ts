import { create } from 'zustand';
import { TeamMatch, MatchFilters } from '../types';
import { api } from '../services/api';

interface TeamMatchState {
  teamMatches: TeamMatch[];
  filters: MatchFilters;
  searchQuery: string;
  loading: boolean;
  setFilters: (filters: MatchFilters) => void;
  setSearchQuery: (query: string) => void;
  fetchTeamMatches: () => Promise<void>;
  getFilteredTeamMatches: () => TeamMatch[];
}

export const useTeamMatchStore = create<TeamMatchState>((set, get) => ({
  teamMatches: [],
  filters: {},
  searchQuery: '',
  loading: false,
  setFilters: (filters) => set({ filters }),
  setSearchQuery: (query) => set({ searchQuery: query }),
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
  getFilteredTeamMatches: () => {
    const { teamMatches } = get();
    return teamMatches;
  },
}));

