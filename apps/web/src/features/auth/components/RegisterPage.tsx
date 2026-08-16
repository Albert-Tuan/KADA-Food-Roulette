import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/lib';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayNamePrivate: '',
    displayNamePublic: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayNamePrivate: formData.displayNamePrivate,
        displayNamePublic: formData.displayNamePublic,
      });
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-orange-500/30 mb-4">
          <span className="text-3xl">🍟</span>
        </div>
        <h1 className="text-2xl font-extrabold text-stone-800">Tạo tài khoản mới</h1>
        <p className="text-stone-500 mt-1">Tham gia cộng đồng Food Roulette</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8">
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
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Display Name Private */}
          <div>
            <label htmlFor="displayNamePrivate" className="block text-sm font-medium text-stone-700 mb-1.5">
              Tên hiển thị trong nhóm bạn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="displayNamePrivate"
                name="displayNamePrivate"
                type="text"
                value={formData.displayNamePrivate}
                onChange={handleChange}
                placeholder="VD: Mini, Tuấn, Hùng..."
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-stone-500 mt-1">Chỉ bạn bè của bạn mới thấy tên này</p>
          </div>

          {/* Display Name Public */}
          <div>
            <label htmlFor="displayNamePublic" className="block text-sm font-medium text-stone-700 mb-1.5">
              Tên công khai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="displayNamePublic"
                name="displayNamePublic"
                type="text"
                value={formData.displayNamePublic}
                onChange={handleChange}
                placeholder="VD: minifoodie, foodlover2024..."
                required
                pattern="[a-zA-Z0-9_]+"
                title="Chỉ chấp nhận chữ cái, số và dấu gạch dưới"
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-xs text-stone-500 mt-1">Dùng để share profile, chỉ chấp nhận a-z, 0-9, _</p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1.5">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1.5">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang đăng ký...</span>
              </>
            ) : (
              <span>Tạo tài khoản</span>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-stone-600 text-sm">
          Đã có tài khoản?{' '}
          <Link
            to={ROUTES.AUTH.LOGIN}
            className="text-amber-600 font-semibold hover:text-amber-700"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
