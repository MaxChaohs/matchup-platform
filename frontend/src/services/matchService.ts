import api from './api';
import type { Match } from '../types';

export const matchService = {
  createMatch: async (data: {
    title: string;
    description?: string;
    type: 'sport' | 'esport';
    category: string;
    location: string;
    startTime: string;
    maxParticipants: number;
  }): Promise<{ message: string; match: Match }> => {
    const response = await api.post('/matches', data);
    return response.data;
  },

  getMatches: async (params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ matches: Match[]; total: number; page: number; limit: number }> => {
    const response = await api.get('/matches', { params });
    return response.data;
  },

  getMatchById: async (id: string): Promise<{ match: Match }> => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  getUserMatches: async (type: 'created' | 'participated' = 'created'): Promise<{ matches: Match[] }> => {
    const response = await api.get('/matches/user/matches', { params: { type } });
    return response.data;
  },
};

