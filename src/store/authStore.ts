import { create } from 'zustand';
import { User } from '../types';
import { api } from '../services/api'; // 引入 api
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>; // 新增 register 定義
  loginWithGoogle: () => Promise<boolean>;
  syncGoogleUser: (supabaseUser: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  error: string | null; // 新增錯誤狀態
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
      saveUserToStorage(user); // 註冊成功後直接登入
      set({ user, isAuthenticated: true });
      return true;
    } catch (err: any) {
      console.error('註冊失敗:', err);
      set({ error: err.message || '註冊失敗' });
      return false;
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      // 使用 Supabase 進行 Google OAuth 登入
      // redirectTo 必須是完整的 URL，且必須在 Supabase Dashboard 的 Redirect URLs 中設定
      const redirectTo = `${window.location.origin}/login`;
      
      console.log('開始 Google OAuth，redirectTo:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        },
      });

      if (error) {
        console.error('OAuth 初始化錯誤:', error);
        throw error;
      }
      
      // signInWithOAuth 會返回一個 URL，用戶需要被重定向到這個 URL
      // 但實際上 Supabase 會自動處理重定向，所以這裡不需要手動處理
      // OAuth 會重定向到 Google，然後回到 redirectTo URL
      // 實際的用戶資料同步會在 App.tsx 的認證狀態監聽中處理
      return true;
    } catch (err: any) {
      console.error('Google 登入失敗:', err);
      set({ error: err.message || 'Google 登入失敗' });
      return false;
    }
  },

  syncGoogleUser: async (supabaseUser: any) => {
    try {
      // 將 Supabase 用戶資訊同步到後端
      const user = await api.googleAuthCallback({
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
        avatar: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
        supabaseUserId: supabaseUser.id,
      });
      
      saveUserToStorage(user);
      set({ user, isAuthenticated: true, error: null });
    } catch (err: any) {
      console.error('Google 登入同步失敗:', err);
      set({ error: err.message || 'Google 登入同步失敗' });
    }
  },

  logout: async () => {
    // 登出 Supabase session
    await supabase.auth.signOut();
    saveUserToStorage(null);
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: (updatedUser: User) => {
    saveUserToStorage(updatedUser);
    set({ user: updatedUser });
  },
}));