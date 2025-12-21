import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { api } from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 檢查認證狀態
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuthStore();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
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
      saveToken(token);
      
      // 獲取用戶資訊
      api.getCurrentUser()
        .then((user) => {
          updateUser(user);
        })
        .catch((error) => {
          console.error('Failed to get user:', error);
        });
    }
  }, [searchParams, updateUser]);

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

