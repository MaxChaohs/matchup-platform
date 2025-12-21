import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, phone: string | undefined, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

// 從 localStorage 讀取保存的用戶信息
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const data = JSON.parse(stored);
      return data.user || null;
    }
  } catch (e) {
    // 忽略錯誤
  }
  return null;
};

// 保存用戶信息到 localStorage
const saveUserToStorage = (user: User | null, token?: string) => {
  try {
    if (user) {
      const data: any = { user, isAuthenticated: true };
      if (token) {
        data.token = token;
      }
      localStorage.setItem('auth-storage', JSON.stringify(data));
    } else {
      localStorage.removeItem('auth-storage');
    }
  } catch (e) {
    // 忽略錯誤
  }
};

const storedUser = loadUserFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  isAuthenticated: !!storedUser,
  isLoading: false,
  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await api.login(username, password);
      saveUserToStorage(response.user, response.token);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (username: string, email: string, phone: string | undefined, password: string) => {
    try {
      set({ isLoading: true });
      const response = await api.register({ username, email, phone, password });
      saveUserToStorage(response.user, response.token);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      set({ isLoading: false });
      console.error('Register error:', error);
      throw error;
    }
  },
  logout: () => {
    api.clearToken();
    saveUserToStorage(null);
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (updatedUser: User) => {
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
  checkAuth: async () => {
    try {
      const user = await api.getCurrentUser();
      saveUserToStorage(user);
      set({ user, isAuthenticated: true });
    } catch (error) {
      // Token 無效或過期
      api.clearToken();
      saveUserToStorage(null);
      set({ user: null, isAuthenticated: false });
    }
  },
}));

