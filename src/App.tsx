import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Home from './pages/Home';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthListener() {
  const { syncGoogleUser } = useAuthStore();

  useEffect(() => {
    // 處理 OAuth 回調 - 檢查 URL 參數和 hash 中的認證資訊
    const handleAuthCallback = async () => {
      // 檢查 URL 查詢參數中的錯誤（Supabase 回調錯誤）
      const urlParams = new URLSearchParams(window.location.search);
      const queryError = urlParams.get('error');
      const queryErrorDescription = urlParams.get('error_description');
      
      if (queryError) {
        console.error('OAuth 查詢參數錯誤:', queryError, queryErrorDescription);
        console.error('當前 URL:', window.location.href);
        console.error('請確認 Supabase Dashboard → Authentication → URL Configuration → Redirect URLs 中包含:', window.location.origin + '/login');
        
        let errorMessage = queryErrorDescription || queryError || 'Google 登入失敗';
        
        // 如果是 state parameter missing 錯誤，提供更明確的提示
        if (queryError === 'invalid_request' && queryErrorDescription?.includes('state parameter')) {
          errorMessage = 'OAuth 設定錯誤：請在 Supabase Dashboard → Authentication → URL Configuration → Redirect URLs 中添加：' + window.location.origin + '/login';
        }
        
        useAuthStore.setState({ error: errorMessage });
        // 清除 URL 參數
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // 檢查 URL hash 中的認證資訊
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        if (error) {
          console.error('OAuth hash 錯誤:', error, errorDescription);
          useAuthStore.setState({ error: errorDescription || error || 'Google 登入失敗' });
          // 清除 URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (accessToken) {
          // 如果有 access_token，表示是 OAuth 回調
          // 清除 URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // 等待一下讓 Supabase 處理 session
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 獲取 session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('獲取 session 失敗:', sessionError);
            useAuthStore.setState({ error: '無法獲取認證資訊' });
            return;
          }

          if (session?.user) {
            await syncGoogleUser(session.user);
            // 導航到首頁
            if (window.location.pathname === '/login') {
              window.location.href = '/';
            }
          } else {
            console.error('Session 中沒有用戶資訊');
            useAuthStore.setState({ error: '無法獲取用戶資訊' });
          }
        }
      }
    };

    // 初始檢查和處理回調
    handleAuthCallback();

    // 檢查是否有現有的 session（非 OAuth 回調情況）
    if (!window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          syncGoogleUser(session.user);
        }
      });
    }

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // 避免重複同步（如果已經在 handleAuthCallback 中處理過）
        if (!window.location.hash.includes('access_token')) {
          await syncGoogleUser(session.user);
        }
        // 使用 window.location 來導航，避免 hook 順序問題
        if (window.location.pathname === '/login') {
          window.location.href = '/';
        }
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncGoogleUser]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;

