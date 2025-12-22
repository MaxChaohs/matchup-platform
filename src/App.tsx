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
    // 處理 OAuth 回調
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const queryError = urlParams.get('error');
      const queryErrorDescription = urlParams.get('error_description');
      
      // 處理錯誤
      if (queryError) {
        console.error('OAuth 錯誤:', queryError, queryErrorDescription);
        let errorMessage = queryErrorDescription || queryError || 'Google 登入失敗';
        if (queryErrorDescription?.includes('state parameter')) {
          errorMessage = 'Google 登入失敗：請清除瀏覽器快取後重試';
        }
        useAuthStore.setState({ error: errorMessage });
        window.history.replaceState({}, document.title, '/login');
        return;
      }

      // 檢查 hash 中的 access_token（implicit flow）
      if (window.location.hash?.includes('access_token')) {
        console.log('檢測到 OAuth access_token');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        window.history.replaceState({}, document.title, '/');
        
        if (session?.user) {
          console.log('OAuth 成功:', session.user.email);
          await syncGoogleUser(session.user);
        }
        return;
      }

      // 檢查 code（PKCE flow）
      const code = urlParams.get('code');
      if (code) {
        console.log('檢測到 OAuth code');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data: { session } } = await supabase.auth.getSession();
        window.history.replaceState({}, document.title, '/');
        
        if (session?.user) {
          console.log('OAuth 成功:', session.user.email);
          await syncGoogleUser(session.user);
        }
      }
    };

    handleAuthCallback();

    // 檢查現有 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncGoogleUser(session.user);
      }
    });

    // 監聽認證狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session?.user) {
        await syncGoogleUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
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

