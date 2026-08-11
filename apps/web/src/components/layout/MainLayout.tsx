import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, User, ShieldCheck } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-amber-50/30 text-stone-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
              🍟
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Food Roulette
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/spin/menu-capture"
              className="p-2 rounded-full bg-amber-100/70 text-amber-700 hover:bg-amber-200 transition-colors"
              title="Quét Menu"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <Link
              to="/preferences"
              className="p-2 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              title="Khẩu vị Cá nhân"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Outlet Content */}
      <main className="flex-1 max-w-md mx-auto w-full pb-20 p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-stone-200 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              location.pathname === '/' ? 'text-orange-500' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span>Trang chủ</span>
          </Link>

          <Link
            to="/group-spin/result"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              location.pathname.startsWith('/group-spin') ? 'text-orange-500' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span>AI Nhóm</span>
          </Link>

          <Link
            to="/preferences"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              location.pathname === '/preferences' ? 'text-orange-500' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Hồ sơ</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
