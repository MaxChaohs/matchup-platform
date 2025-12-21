import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await api.forgotPassword(email);
      setSuccess(true);
      // 開發環境可能返回 resetUrl
      if (response.resetUrl) {
        setResetUrl(response.resetUrl);
      }
    } catch (error: any) {
      setError(error.message || '發送失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
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

      {/* Right Column - Forgot Password Form */}
      <div className="w-full lg:w-2/5 bg-gray-800 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-2">忘記密碼</h2>
          <p className="text-gray-400 mb-6">
            請輸入您的電子郵件地址，我們將發送重設密碼連結給您
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/30 border border-green-500 rounded-lg">
                <p className="text-green-400 text-sm">
                  如果該電子郵件存在，我們已發送重設密碼連結到您的信箱。
                  請檢查您的收件匣（包括垃圾郵件資料夾）。
                </p>
              </div>
              
              {resetUrl && (
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-300 text-sm mb-2">開發環境重設連結：</p>
                  <a
                    href={resetUrl}
                    className="text-green-400 hover:text-green-300 text-sm break-all"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}

              <Link
                to="/login"
                className="block w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors text-center"
              >
                返回登入
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  電子郵件地址
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '發送中...' : '發送重設密碼連結'}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-green-400 hover:text-green-300 text-sm"
                >
                  返回登入
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

