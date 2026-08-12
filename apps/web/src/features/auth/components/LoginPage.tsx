import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/lib';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    try {
      setEmail('test@foodroulette.app');
      setPassword('password123');
      await login({ email: 'test@foodroulette.app', password: 'password123' });
      navigate(ROUTES.HOME);
    } catch (err: any) {
      setError('Đăng nhập demo thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    setError('Đăng nhập Google đang được phát triển.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-orange-500/30 mb-4">
          <span className="text-3xl">🍟</span>
        </div>
        <h1 className="text-2xl font-extrabold text-stone-800">Chào mừng trở lại!</h1>
        <p className="text-stone-500 mt-1">Đăng nhập để tiếp tục quay món</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
        {/* 1-Click Quick Demo Login Button */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 mb-5 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce-short" />
          <span>⚡ Đăng Nhập Nhanh Demo (1-Click)</span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Mật khẩu
              </label>
              <Link
                to={ROUTES.AUTH.FORGOT_PASSWORD}
                className="text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang đăng nhập...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-b from-amber-50 to-orange-50 text-stone-500">
              hoặc
            </span>
          </div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3.5 bg-white border border-stone-200 rounded-xl text-stone-700 font-medium hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        {/* Register Link */}
        <p className="mt-6 text-center text-stone-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link
            to={ROUTES.AUTH.REGISTER}
            className="text-amber-600 font-semibold hover:text-amber-700"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
