import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// 從 localStorage 讀取保存的用戶信息和token
const loadAuthFromStorage = (): { user: User | null; token: string | null } => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const data = JSON.parse(stored);
      return {
        user: data.user || null,
        token: data.token || null,
      };
    }
  } catch (e) {
    // 忽略錯誤
  }
  return { user: null, token: null };
};

// 保存用戶信息和token到 localStorage
const saveAuthToStorage = (user: User | null, token: string | null) => {
  try {
    if (user && token) {
      localStorage.setItem('auth-storage', JSON.stringify({ 
        user, 
        token,
        isAuthenticated: true 
      }));
    } else {
      localStorage.removeItem('auth-storage');
    }
  } catch (e) {
    // 忽略錯誤
  }
};

const { user: storedUser, token: storedToken } = loadAuthFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!(storedUser && storedToken),
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await api.login(usernameOrEmail, password);
      saveAuthToStorage(response.user, response.token);
      set({ 
        user: response.user, 
        token: response.token,
        isAuthenticated: true 
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  },
  register: async (username: string, email: string, password: string, phone?: string) => {
    try {
      const response = await api.register({ username, email, password, phone });
      saveAuthToStorage(response.user, response.token);
      set({ 
        user: response.user, 
        token: response.token,
        isAuthenticated: true 
      });
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      // 確保錯誤訊息被正確傳遞
      const errorMessage = error?.message || error?.toString() || '註冊失敗，請稍後再試';
      throw new Error(errorMessage);
    }
  },
  logout: () => {
    saveAuthToStorage(null, null);
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (updatedUser: User) => {
    const { token } = loadAuthFromStorage();
    saveAuthToStorage(updatedUser, token);
    set({ user: updatedUser });
  },
}));

