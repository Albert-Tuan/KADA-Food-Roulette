import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';

const GroupSpinWhoSpins: React.FC = () => {
  const navigate = useNavigate();
  const { members, setSpinner } = useGroupSpinStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [activeBlipIndex, setActiveBlipIndex] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinnerIndex(null);

    const randomRotations = Math.floor(Math.random() * 5) + 5; // 5 to 10 full rotations
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + (randomRotations * 360) + extraDegrees;
    
    setWheelRotation(totalRotation);

    let currentAvatar = 0;
    const blipInterval = setInterval(() => {
        setActiveBlipIndex(currentAvatar);
        currentAvatar = (currentAvatar + 1) % members.length;
    }, 100);

    setTimeout(() => {
        clearInterval(blipInterval);
        const winner = Math.floor(Math.random() * members.length);
        setWinnerIndex(winner);
        setActiveBlipIndex(null);
        setSpinner(members[winner].id);
        
        setTimeout(() => {
            setIsSpinning(false);
            navigate('/group-spin/spin');
        }, 2000);
    }, 3000);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container antialiased">
      <style>{`
        .squishy-btn { box-shadow: 0 4px 0 #61000e; }
        .squishy-btn:active { box-shadow: 0 0px 0 #61000e; transform: translateY(4px); }
        .avatar-pop { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .avatar-pop.highlighted { transform: scale(1.15); box-shadow: 0 0 0 4px #FFC107; z-index: 30; }
        .spin-animation { transition: transform 3s cubic-bezier(0.25, 0.1, 0.15, 1); }
        @keyframes subtlePulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        .animate-subtle-pulse { animation: subtlePulse 2s infinite ease-in-out; }
      `}</style>
      
      {/* TopAppBar */}
      <header className="bg-background dark:bg-background w-full top-0 sticky flex justify-between items-center px-margin-mobile py-base max-w-7xl mx-auto z-40">
        <div onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-surface-container-low transition-colors rounded-lg p-1 -ml-1 cursor-pointer">
          <span className="material-symbols-outlined text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <span className="font-display-hero text-headline-md-mobile text-primary tracking-tight">Food Roulette</span>
        </div>
        <div className="flex items-center">
          <span className="font-label-strong text-caption text-on-surface-variant bg-surface-white border border-subtle-gray rounded-full px-3 py-1 shadow-sm flex items-center gap-1">
            1,250 <span className="text-streak-gold text-lg leading-none">🪙</span>
          </span>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-stack-lg max-w-lg mx-auto w-full relative">
        <div className="absolute top-10 left-10 opacity-20 hidden md:block">
          <span className="material-symbols-outlined text-6xl text-tertiary-container rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        </div>
        <div className="absolute top-20 right-10 opacity-20 hidden md:block">
          <span className="material-symbols-outlined text-5xl text-secondary-container -rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span>
        </div>

        {/* Typography Header */}
        <div className="text-center mb-stack-lg flex flex-col items-center z-10 w-full">
          <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-surface-variant mb-4 transform -rotate-3">
            <span className="material-symbols-outlined text-4xl text-streak-gold" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          </div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-stack-sm tracking-tight w-full">Ai sẽ quay?</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mx-auto">Hệ thống sẽ chọn ngẫu nhiên một người đại diện để quay vòng xoay may mắn, đảm bảo công bằng cho cả hội!</p>
        </div>

        {/* The "Who Spins" Mini-Roulette Visual */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-stack-lg flex items-center justify-center mt-4">
          <div className="absolute inset-0 rounded-full border-[12px] border-surface-container shadow-[0_12px_36px_-12px_rgba(181,35,48,0.25)] bg-surface-white overflow-hidden">
            <div 
              ref={wheelRef}
              className="w-full h-full spin-animation" 
              style={{ background: 'conic-gradient(from 0deg, var(--tw-colors-surface-container-low) 0deg 90deg, var(--tw-colors-surface-white) 90deg 180deg, var(--tw-colors-surface-container-low) 180deg 270deg, var(--tw-colors-surface-white) 270deg 360deg)', transform: `rotate(${wheelRotation}deg)` }}
            ></div>
          </div>

          {/* Avatars */}
          {members.map((member, index) => {
            const angle = (index * 360) / members.length;
            const radius = 110; // adjusted for visual placement
            const rad = angle * (Math.PI / 180) - Math.PI / 2; // -90 deg to start at top
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;

            return (
              <div 
                key={member.id}
                className={`absolute left-1/2 top-1/2 flex flex-col items-center gap-1 avatar-pop ${activeBlipIndex === index || winnerIndex === index ? 'highlighted' : ''}`}
                style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
              >
                <div className="relative">
                  <img className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-surface-white shadow-md object-cover relative z-10" alt={member.name} src={member.avatarUrl} />
                  <div className="absolute inset-0 rounded-full bg-streak-gold blur-md transition-opacity duration-300 pointer-events-none" style={{ opacity: winnerIndex === index ? 0.7 : 0 }}></div>
                </div>
                <span className="font-label-strong text-caption text-on-surface bg-surface-white border border-subtle-gray px-2 py-0.5 rounded-full shadow-sm z-20">{member.name}</span>
              </div>
            );
          })}

          <div className="absolute z-20 w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-lg border-[3px] border-surface-variant flex-col">
            <span className={`material-symbols-outlined text-primary text-3xl mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          ref={buttonRef}
          onClick={handleSpin}
          className={`w-full max-w-[300px] mt-4 font-headline-md text-headline-md-mobile py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-3 ${winnerIndex !== null ? 'bg-tertiary text-on-tertiary shadow-[0_4px_0_#00341f]' : isSpinning ? 'bg-primary text-on-primary shadow-none translate-y-1' : 'bg-primary text-on-primary squishy-btn animate-subtle-pulse hover:bg-surface-tint'}`}
        >
          {winnerIndex !== null ? (
            <>XONG! <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span></>
          ) : isSpinning ? (
            <>ĐANG CHỌN... <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span></>
          ) : (
            <>QUAY ĐI! <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span></>
          )}
        </button>
      </main>
    </div>
  );
};

export default GroupSpinWhoSpins;
