import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';

interface LoginForm {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.identifier, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登入失敗，請檢查您的帳號密碼');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FFF5E6' }}>
      {/* 左側：平台介紹 */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-6xl font-bold text-black mb-4">MATCH POINT</h1>
          <p className="text-xl text-black mb-8">
            The Matchmaking Platform for Every Sport & Game
          </p>
          <ul className="space-y-3 text-lg text-black">
            <li>Create matches in seconds.</li>
            <li>Find teammates instantly.</li>
            <li>Challenge players around your campus.</li>
          </ul>
        </div>
      </div>

      {/* 右側：登入表單 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md rounded-lg p-8" style={{ backgroundColor: '#2D2D2D' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 使用者名稱/電話/電子郵件 */}
            <div>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Username, Phone, or Email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  {...register('identifier', { required: '請輸入使用者名稱、電話或電子郵件' })}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-400">{errors.identifier.message}</p>
              )}
            </div>

            {/* 密碼 */}
            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  {...register('password', { required: '請輸入密碼' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* 記住我 & 忘記密碼 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  className="mr-2 rounded"
                  {...register('rememberMe')}
                />
                <span className="text-sm">Remember me</span>
              </label>
              <a href="#" className="text-sm text-gray-400 hover:text-white">
                Forgot Password?
              </a>
            </div>

            {/* 錯誤訊息 */}
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}

            {/* 登入按鈕 */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold transition-colors"
              style={{ backgroundColor: '#10B981' }}
            >
              Log In
            </button>

            {/* OR 分隔線 */}
            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 border-t border-gray-600"></div>
              <span className="relative bg-gray-800 px-4 text-gray-400 text-sm">OR</span>
            </div>

            {/* 社交登入按鈕 */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-3 rounded-lg bg-gray-700 text-white flex items-center justify-center space-x-3 hover:bg-gray-600 transition-colors"
              >
                <span className="text-xl">🍎</span>
                <span>Log in with Apple</span>
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-lg bg-gray-700 text-white flex items-center justify-center space-x-3 hover:bg-gray-600 transition-colors"
              >
                <span className="text-xl font-bold text-blue-500">G</span>
                <span>Log in with Google</span>
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-lg bg-gray-700 text-white flex items-center justify-center space-x-3 hover:bg-gray-600 transition-colors"
              >
                <span className="text-xl font-bold text-blue-500">f</span>
                <span>Log in with Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

