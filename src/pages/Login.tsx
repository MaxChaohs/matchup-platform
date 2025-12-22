import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function Login() {
  // UI State
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: ''
  });
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [resetToken, setResetToken] = useState(''); // 開發模式用

  // Store & Router
  const { login, register, error: authError } = useAuthStore();
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let success;
    if (isLogin) {
      success = await login(formData.username, formData.password);
    } else {
      success = await register(formData);
    }

    setIsLoading(false);
    
    if (success) {
      navigate('/');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const result = await api.forgotPassword(forgotEmail);
      setForgotSuccess(true);
      // 開發模式：顯示 reset token
      if (result.dev_token) {
        setResetToken(result.dev_token);
      }
    } catch (err: any) {
      setForgotError(err.message || '發送失敗');
    } finally {
      setForgotLoading(false);
    }
  };

  // 關閉忘記密碼 Modal
  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setForgotError('');
    setResetToken('');
  };

  // 切換模式時清空表單
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', email: '', phone: '' });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Promotional Content */}
      <div className="hidden lg:flex lg:w-3/5 bg-orange-100 items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-black mb-6">MATCH POINT</h1>
          <p className="text-2xl text-black mb-8 font-semibold">
            The Matchmaking Platform for Every Sport & Game
          </p>
          <div className="space-y-4 text-lg text-black">
            <p>• Create matches in seconds.</p>
            <p>• Find teammates instantly.</p>
            <p>• Challenge players around your campus.</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login/Register Form */}
      <div className="w-full lg:w-2/5 bg-gray-800 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          
          {/* Header Text */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400">
              {isLogin ? 'Please enter your details.' : 'Join us to start your journey.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Register Only Fields: Email & Phone */}
            {!isLogin && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (Optional)"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-10 pr-12 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
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

            {/* Error Message */}
            {authError && (
              <div className="p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm">
                {authError}
              </div>
            )}

            {/* Remember Me & Forgot Password (Only in Login Mode) */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-300">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleMode}
                className="ml-2 text-green-400 hover:text-green-300 font-medium focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          {/* Test Account Info */}
          <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-gray-400">
             <p className="font-semibold mb-2 text-gray-300">測試帳號：</p>
             <p>註冊新帳號即可使用，或使用舊測試帳號。</p>
          </div>
          
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-700 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">忘記密碼</h3>
              <button
                onClick={closeForgotPassword}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword}>
                <p className="text-gray-400 mb-4">
                  請輸入您註冊時使用的電子郵件，我們將發送密碼重設連結給您。
                </p>

                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {forgotError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm">
                    {forgotError}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeForgotPassword}
                    className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? '發送中...' : '發送連結'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">已發送重設連結！</p>
                  <p className="text-gray-400 text-sm">
                    如果此電子郵件已註冊，您將收到密碼重設連結。
                  </p>
                </div>

                {/* 開發模式：顯示 reset token */}
                {resetToken && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-900/50 border border-yellow-800 text-yellow-200 text-sm">
                    <p className="font-semibold mb-1">⚠️ 開發模式</p>
                    <p className="mb-2">正式環境中，重設連結會透過電子郵件發送。</p>
                    <a
                      href={`/reset-password?token=${resetToken}`}
                      className="text-green-400 hover:text-green-300 underline break-all"
                    >
                      點此重設密碼
                    </a>
                  </div>
                )}

                <button
                  onClick={closeForgotPassword}
                  className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  確定
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
