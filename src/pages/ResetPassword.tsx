import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 驗證 token
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('缺少重設密碼連結');
        setIsVerifying(false);
        return;
      }

      try {
        const result = await api.verifyResetToken(token);
        if (result.valid) {
          setIsValidToken(true);
        } else {
          setError(result.error || '無效的重設連結');
        }
      } catch (err: any) {
        setError('驗證失敗，請重新申請密碼重設');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    if (password.length < 6) {
      setError('密碼長度至少 6 個字元');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.resetPassword(token!, password);
      if (result.success) {
        setSuccess(true);
        // 3 秒後導向登入頁
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || '重設密碼失敗');
    } finally {
      setIsLoading(false);
    }
  };

  // 載入中
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">驗證中...</p>
        </div>
      </div>
    );
  }

  // Token 無效
  if (!isValidToken && !success) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">連結無效</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            返回登入頁面
          </Link>
        </div>
      </div>
    );
  }

  // 重設成功
  if (success) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">密碼重設成功！</h2>
          <p className="text-gray-400 mb-6">您的密碼已成功更新。即將導向登入頁面...</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            立即登入
          </Link>
        </div>
      </div>
    );
  }

  // 重設密碼表單
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-700 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">重設密碼</h2>
          <p className="text-gray-400 mt-2">請輸入您的新密碼</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新密碼 */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">新密碼</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 個字元"
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 確認密碼 */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">確認新密碼</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次輸入新密碼"
              className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '處理中...' : '重設密碼'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-green-400 hover:text-green-300 text-sm">
            返回登入頁面
          </Link>
        </div>
      </div>
    </div>
  );
}

