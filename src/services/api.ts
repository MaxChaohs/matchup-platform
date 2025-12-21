// 在 Vercel 上，前后端在同一域名，使用相对路径
// 本地开发时使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

// 從localStorage讀取JWT token
const getToken = (): string | null => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const data = JSON.parse(stored);
      return data.token || null;
    }
  } catch (e) {
    // 忽略錯誤
  }
  return null;
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // 如果有token，添加到headers
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 嘗試解析響應
    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      responseData = text ? { error: text } : { error: '請求失敗' };
    }

    if (!response.ok) {
      // 從響應中提取錯誤訊息
      const errorMessage = responseData?.error || responseData?.message || `請求失敗 (${response.status})`;
      throw new Error(errorMessage);
    }

    return responseData as T;
  } catch (error: any) {
    // 如果是網絡錯誤或其他錯誤，包裝並重新拋出
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || '網路錯誤，請檢查連線');
  }
}

export const api = {
  // Auth APIs
  register: (data: { username: string; email: string; password: string; phone?: string }) => 
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (usernameOrEmail: string, password: string) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
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

