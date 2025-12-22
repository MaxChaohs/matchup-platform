import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
  error: string | null;
}

// Helper functions for localStorage
const loadUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveUserToStorage = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('Failed to save user to storage:', error);
  }
};

const storedUser = loadUserFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  isAuthenticated: !!storedUser,
  error: null,

  login: async (username, password) => {
    set({ error: null });
    try {
      const user = await api.login({ username, password });
      saveUserToStorage(user);
      set({ user, isAuthenticated: true });
      return true;
    } catch (err: any) {
      console.error('登入失敗:', err);
      set({ error: err.message || '登入失敗' });
      return false;
    }
  },

  register: async (data) => {
    set({ error: null });
    try {
      const user = await api.register(data);
      saveUserToStorage(user);
      set({ user, isAuthenticated: true });
      return true;
    } catch (err: any) {
      console.error('註冊失敗:', err);
      set({ error: err.message || '註冊失敗' });
      return false;
    }
  },

  logout: () => {
    saveUserToStorage(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: (updatedUser: User) => {
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
}));
