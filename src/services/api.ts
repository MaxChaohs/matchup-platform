// 在 Vercel 上，前后端在同一域名，使用相对路径
// 本地开发时使用环境变量或默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

// 獲取 token
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

// 保存 token
const saveToken = (token: string) => {
  try {
    const stored = localStorage.getItem('auth-storage');
    const data = stored ? JSON.parse(stored) : {};
    data.token = token;
    localStorage.setItem('auth-storage', JSON.stringify(data));
  } catch (e) {
    // 忽略錯誤
  }
};

// 清除 token
const clearToken = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const data = JSON.parse(stored);
      delete data.token;
      localStorage.setItem('auth-storage', JSON.stringify(data));
    }
  } catch (e) {
    // 忽略錯誤
  }
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // 如果有 token，添加到 header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = '請求失敗';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch {
        // 如果無法解析 JSON，使用狀態碼
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // 處理網絡錯誤
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到伺服器，請檢查網絡連接');
    }
    // 如果是我們自己拋出的錯誤，直接重新拋出
    if (error.message) {
      throw error;
    }
    // 其他未知錯誤
    throw new Error(error.message || '請求失敗，請稍後再試');
  }
}

export const api = {
  // Auth APIs
  register: (data: { username: string; email: string; phone?: string; password: string }) => {
    return request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then((response) => {
      saveToken(response.token);
      return response;
    });
  },
  login: (username: string, password: string) => {
    return request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }).then((response) => {
      saveToken(response.token);
      return response;
    });
  },
  getCurrentUser: () => request<any>('/auth/me'),
  forgotPassword: (email: string) => {
    return request<{ message: string; resetUrl?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  resetPassword: (token: string, password: string) => {
    return request<{ message: string; token: string; user: any }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }).then((response) => {
      saveToken(response.token);
      return response;
    });
  },
  clearToken,

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

