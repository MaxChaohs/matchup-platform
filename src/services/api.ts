// 在 Vercel 上，前后端在同一域名，使用相对路径
// 本地开发时使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '請求失敗' }));
    throw new Error(error.error || '請求失敗');
  }

  return response.json();
}

export const api = {
  // Auth APIs (新增)
  login: (data: any) => request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  register: (data: any) => request<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  googleAuthCallback: (data: any) => request<any>('/auth/google/callback', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  // User APIs
  getUsers: () => request<any[]>('/users'),
  getUser: (id: string) => request<any>(`/users/${id}`),
  createUser: (data: any) => request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id: string, data: any) => request<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteUser: (id: string) => request<{ message: string }>(`/users/${id}`, {
    method: 'DELETE',
  }),

  // Team Match APIs
  getTeamMatches: (params?: { category?: string; region?: string; dayOfWeek?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.region) query.append('region', params.region);
    if (params?.dayOfWeek) query.append('dayOfWeek', params.dayOfWeek);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return request<any[]>(`/team-matches${queryString ? `?${queryString}` : ''}`);
  },
  getTeamMatch: (id: string) => request<any>(`/team-matches/${id}`),
  createTeamMatch: (data: any) => request<any>('/team-matches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTeamMatch: (id: string, data: any) => request<any>(`/team-matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTeamMatch: (id: string) => request<{ message: string }>(`/team-matches/${id}`, {
    method: 'DELETE',
  }),

  // Player Recruitment APIs
  getPlayerRecruitments: (params?: { category?: string; region?: string; dayOfWeek?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.region) query.append('region', params.region);
    if (params?.dayOfWeek) query.append('dayOfWeek', params.dayOfWeek);
    if (params?.search) query.append('search', params.search);
    const queryString = query.toString();
    return request<any[]>(`/player-recruitments${queryString ? `?${queryString}` : ''}`);
  },
  getPlayerRecruitment: (id: string) => request<any>(`/player-recruitments/${id}`),
  createPlayerRecruitment: (data: any) => request<any>('/player-recruitments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePlayerRecruitment: (id: string, data: any) => request<any>(`/player-recruitments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePlayerRecruitment: (id: string) => request<{ message: string }>(`/player-recruitments/${id}`, {
    method: 'DELETE',
  }),
};

