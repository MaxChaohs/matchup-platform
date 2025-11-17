import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void;
}

// 測試帳號
const TEST_ACCOUNTS = [
  { username: 'test', password: 'test123', user: { _id: '1', id: '1', username: 'test', email: 'test@example.com', phone: '0912345678' } },
  { username: 'admin', password: 'admin123', user: { _id: '2', id: '2', username: 'admin', email: 'admin@example.com', phone: '0987654321' } },
];

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
const saveUserToStorage = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem('auth-storage', JSON.stringify({ user, isAuthenticated: true }));
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
  login: async (username: string, password: string) => {
    const account = TEST_ACCOUNTS.find(
      acc => acc.username === username && acc.password === password
    );
    
    if (account) {
      try {
        // 嘗試在數據庫中創建或獲取用戶
        const { api } = await import('../services/api');
        const dbUser = await api.createUser({
          username: account.user.username,
          email: account.user.email,
          phone: account.user.phone,
        });
        // 使用數據庫返回的用戶（包含真實的 _id）
        saveUserToStorage(dbUser);
        set({ user: dbUser, isAuthenticated: true });
        return true;
      } catch (error) {
        // 如果 API 調用失敗，使用本地測試帳號
        console.warn('無法連接到數據庫，使用本地測試帳號:', error);
        saveUserToStorage(account.user);
        set({ user: account.user, isAuthenticated: true });
        return true;
      }
    }
    return false;
  },
  logout: () => {
    saveUserToStorage(null);
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (updatedUser: User) => {
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
}));

