import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpinStore } from '../../../stores/spinStore';

const SpinResult: React.FC = () => {
  const navigate = useNavigate();
  const { currentResult } = useSpinStore();

  useEffect(() => {
    if (!currentResult) {
      navigate('/');
      return;
    }

    const container = document.getElementById('confetti-container');
    if (!container) return;

    const colors = ['#ff5a5f', '#FFC107', '#55a37a', '#ffb780'];
    const fragments: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animation = `fall ${Math.random() * 2 + 1.5}s linear infinite`;
      confetti.style.animationDelay = `${Math.random() * 1}s`;

      // Random shapes
      if (Math.random() > 0.5) {
        confetti.style.width = `${Math.random() * 5 + 5}px`;
        confetti.style.height = `${Math.random() * 15 + 5}px`;
      }

      confetti.style.left = `${Math.random() * 100}vw`;

      // keyframes injected globally in index.css (fallback handled below)
      // Actually we will add the @keyframes fall in index.css or just inline a <style> block here
      container.appendChild(confetti);
      fragments.push(confetti);
    }

    const timer = setTimeout(() => {
      if (container) {
        container.innerHTML = '';
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="bg-background text-on-background antialiased min-h-screen pb-[80px]">
      <style>{`
        @keyframes fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {/* Top Navigation Placeholder (Hidden for this specific task flow screen as it's a result screen) */}
      <header className="w-full top-0 sticky bg-background z-40 hidden md:flex justify-between items-center px-margin-desktop py-base max-w-7xl mx-auto shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-2xl">local_fire_department</span>
          <span className="font-display-hero text-headline-md tracking-tight">Food Roulette</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-label-strong text-on-surface-variant">1,250 🪙</span>
          <button onClick={() => navigate('/')} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto md:max-w-3xl md:mt-8 relative overflow-hidden bg-surface-white md:rounded-3xl md:shadow-lg md:border md:border-subtle-gray pb-8 min-h-screen md:min-h-0">
        {/* Confetti effect container */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-50 overflow-hidden" id="confetti-container"></div>

        {/* Hero Image Section with Gradient Overlay */}
        <div className="relative w-full h-[50vh] md:h-[60vh]">
          <img
            alt="Restaurant Hero Image"
            className="absolute inset-0 w-full h-full object-cover"
            src={currentResult?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDPXkp_PqwHdeonWUy3cMkUvQLu0I6vRU2kzzfUP4Ni8SabeF7Cq5dl3DyJCibawkf_uUpTQdYEfyAoSNbTq49ri9QImqQ0KfkTvZTuYUz6qZBJWbHakxaJFSQ-e7sbekjgT2_-VyiccCC1q3A7vrNR2cjByhNlNbQhXuqD1QIUIB-MpLFLY-xIpwTH5H2jBVSo5a4nzxfa5hqSdJJKbz_zqpqUx8is_ZzYOYnevY8LPAUsR7S75qjNhQ"}
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Top Actions Overlay */}
          <div className="absolute top-0 left-0 w-full p-margin-mobile flex justify-between items-center z-10 md:hidden">
            <button
              onClick={() => navigate('/')}
              aria-label="Close"
              className="bg-surface-white/20 backdrop-blur-md p-2 rounded-full text-surface-white hover:bg-surface-white/40 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="bg-surface-white/90 px-3 py-1 rounded-full text-primary font-label-strong text-caption shadow-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">local_fire_department</span> 1,250 🪙
            </div>
          </div>

          {/* Restaurant Details Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-margin-mobile flex flex-col gap-stack-sm z-10">
            <div className="flex gap-2 mb-1">
              <span className="bg-primary px-2 py-1 rounded-full text-on-primary font-label-strong text-[10px] uppercase tracking-wider">It's a Match!</span>
              <span className="bg-surface-white/20 backdrop-blur-md px-2 py-1 rounded-full text-surface-white font-label-strong text-[10px] uppercase tracking-wider border border-surface-white/30">{currentResult?.category}</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-surface-white drop-shadow-md">
                {currentResult?.name}
            </h1>
            <div className="flex items-center gap-4 text-surface-white/90 font-body-md text-caption">
              <div className="flex items-center gap-1 bg-surface-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-surface-white/20">
                <span className="material-symbols-outlined text-streak-gold text-[16px]">star</span>
                <span className="font-label-strong">{currentResult?.rating}</span>
                <span className="opacity-75">({currentResult?.totalReviews})</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-surface-white/20">
                <span className="material-symbols-outlined text-[16px]">directions_walk</span>
                <span className="font-label-strong">{currentResult ? (currentResult.distance / 1000).toFixed(1) : 0}km</span>
              </div>
              <div className="flex items-center gap-1 bg-surface-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-surface-white/20">
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span className="font-label-strong">{Array(currentResult?.priceLevel || 1).fill('$').join('')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-margin-mobile py-stack-lg md:px-margin-desktop bg-surface-white flex flex-col gap-stack-lg relative -mt-4 rounded-t-3xl z-20 h-full">
          {/* Quick Info Quote */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-subtle-gray">
            <p className="font-body-md text-body-md text-on-surface-variant italic text-center">
                "Known for their rich, spicy broth and generous portions. A local favorite!"
            </p>
          </div>
          {/* Primary Actions */}
          <div className="flex flex-col gap-stack-md mt-2">
            <button
              onClick={() => navigate('/check-in')}
              className="btn-squish w-full bg-primary border-primary-container text-on-primary py-4 rounded-xl font-headline-md text-headline-md-mobile flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:brightness-95"
            >
              <span className="material-symbols-outlined">restaurant</span>
              Let's Eat Here!
            </button>
            <div className="flex gap-stack-md w-full">
              <button
                onClick={() => navigate('/')}
                className="btn-squish flex-1 bg-surface-container border-subtle-gray text-on-surface py-3 rounded-xl font-label-strong text-body-md flex items-center justify-center gap-2 shadow-sm hover:bg-surface-container-high active:bg-surface-variant"
              >
                <span className="material-symbols-outlined">refresh</span>
                Spin Again
              </button>
              <button onClick={() => window.alert('Đang mở bản đồ chỉ đường...')} className="btn-squish flex-1 bg-tertiary-container border-tertiary text-on-primary py-3 rounded-xl font-label-strong text-body-md flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:brightness-95">
                <span className="material-symbols-outlined">directions</span>
                Directions
              </button>
            </div>
          </div>
          <hr className="border-t border-subtle-gray w-full my-2" />
          {/* Secondary Social Actions */}
          <div className="flex justify-center gap-stack-lg">
            <button onClick={() => window.alert('Đã lưu vào danh sách xem sau (Locket)!')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-surface-container-low border border-subtle-gray flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>bookmark</span>
              </div>
              <span className="font-label-strong text-caption text-on-surface-variant">Save to Locket</span>
            </button>
            <button onClick={() => window.alert('Đã tạo liên kết chia sẻ!')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-surface-container-low border border-subtle-gray flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors shadow-sm">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>share</span>
              </div>
              <span className="font-label-strong text-caption text-on-surface-variant">Share Group</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpinResult;
