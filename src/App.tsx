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
    // 檢查是否有現有的 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncGoogleUser(session.user);
      }
    });

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncGoogleUser(session.user);
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

