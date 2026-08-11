import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';

const GroupSpinFoodWheel: React.FC = () => {
  const navigate = useNavigate();
  const { spinnerId, members } = useGroupSpinStore();
  const { candidates, setCurrentResult } = useSpinStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [customFoods, setCustomFoods] = useState<Record<string, string>>({});


  const customCandidates = Object.entries(customFoods)
    .filter(([_, food]) => food.trim() !== '')
    .map(([memberId, food], index) => ({
      id: `custom-${memberId}`,
      name: food,
      category: 'Đề xuất nhóm',
      rating: 5.0,
      totalReviews: 1,
      distance: 0,
      priceLevel: 2 as const,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' // Generic food image
    }));

  const displayCandidates = customCandidates.length > 0 ? customCandidates : candidates;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const extraSpins = (Math.floor(Math.random() * 4) + 3) * 360;
    const randomSegment = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins + randomSegment;
    setRotation(newRotation);

    // Calculate which candidate the pointer lands on
    const pointerAngle = (360 - (newRotation % 360)) % 360;
    const sliceAngle = 360 / displayCandidates.length;
    const winnerIndex = Math.floor(pointerAngle / sliceAngle);

    setTimeout(() => {
      setIsSpinning(false);
      if (displayCandidates.length > 0) {
        setCurrentResult(displayCandidates[winnerIndex]);
      }
      navigate('/group-spin/veto');
    }, 3000);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      <header className="bg-background w-full top-0 sticky flex justify-between items-center px-margin-mobile py-base max-w-7xl mx-auto z-40">
        <div onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-surface-container-low transition-colors rounded-lg p-1 -ml-1 cursor-pointer">
          <span className="material-symbols-outlined text-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_back</span>
          <span className="font-headline-md text-primary">Vòng Quay Món Ăn</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-stack-lg max-w-md mx-auto w-full relative">
        <div className="text-center mb-stack-md w-full flex flex-col items-center">
           <div className="flex -space-x-3 mb-3">
             {members.slice(0, 5).map(m => (
               <img key={m.id} className="w-12 h-12 border-2 border-surface-white rounded-full object-cover shadow-sm" src={m.avatarUrl} alt={m.name} />
             ))}
           </div>
           <h2 className="font-headline-lg-mobile text-primary">Phòng Chờ (Lobby)</h2>
           <p className="text-on-surface-variant text-sm mt-1">Góp món cùng nhau, chốt nhanh kèo nhậu!</p>
        </div>

        {/* Custom Food Inputs */}
        <div className="w-full bg-surface-white rounded-xl p-4 shadow-sm mb-stack-md border border-subtle-gray">
          <h3 className="font-label-strong text-primary mb-1">Thêm đề xuất của nhóm</h3>
          <p className="text-xs text-on-surface-variant mb-4">Mỗi người có thể gợi ý 1 món. Nếu không ai gợi ý, vòng xoay sẽ tự chọn quán ngẫu nhiên.</p>
          <div className="flex flex-col gap-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border border-subtle-gray" />
                <span className="font-label-strong text-sm w-16 truncate">{member.name}</span>
                <input
                  type="text"
                  placeholder="Ví dụ: Cơm tấm, Pizza..."
                  className="flex-1 bg-surface-container-lowest border border-subtle-gray rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                  value={customFoods[member.id] || ''}
                  onChange={(e) => setCustomFoods(prev => ({ ...prev, [member.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Menu Scanner Button for Group */}
        <div
          onClick={() => navigate('/spin/menu-capture')}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-3.5 shadow-md mb-stack-lg flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur text-white">
              <span className="material-symbols-outlined text-xl">document_scanner</span>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-sm leading-tight flex items-center gap-1">
                📷 Quét Menu Bằng AI Quán Hiện Tại
              </h4>
              <p className="text-[11px] text-amber-100 mt-0.5">Tự động nhận diện menu & chia món ăn cho cả nhóm</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-amber-200 text-lg">chevron_right</span>
        </div>

        {/* Wheel Component */}
        <div className="relative w-full max-w-md mx-auto mb-stack-lg">
          <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] mx-auto">
            {/* Wheel Pointer */}
            <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary z-10 drop-shadow-md"></div>

            {/* Wheel */}
            <div
              className="w-full h-full rounded-full border-8 border-surface-white shadow-xl relative overflow-hidden bg-surface-container-low"
              style={{
                background: displayCandidates.length > 0
                  ? `conic-gradient(${displayCandidates.map((_, i) => {
                      const colors = ['#ff5a5f', '#ffab69', '#55a37a', '#FFC107', '#b52330', '#88d7aa'];
                      const start = (i * 360) / displayCandidates.length;
                      const end = ((i + 1) * 360) / displayCandidates.length;
                      return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                    }).join(', ')})`
                  : '#e1d9cb',
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
              }}
            >
              {displayCandidates.map((candidate, i) => {
                const sliceAngle = 360 / displayCandidates.length;
                const rotationAngle = (i * sliceAngle) + (sliceAngle / 2) - 90;
                return (
                  <div
                    key={candidate.id}
                    className="absolute top-1/2 left-1/2 origin-top-left text-white font-bold text-[12px] md:text-[14px] drop-shadow-md pointer-events-none w-[120px] md:w-[150px] text-right pr-[20px] line-clamp-2"
                    style={{ transform: `rotate(${rotationAngle}deg) translateY(-50%)` }}
                  >
                    {candidate.name}
                  </div>
                );
              })}
            </div>

            {/* Wheel Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] bg-surface-white rounded-full border-4 border-surface-container-low shadow-inner z-10"></div>
          </div>
        </div>

        <button
          className={`w-full bg-primary text-on-primary font-headline-md text-headline-md-mobile py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${isSpinning ? 'opacity-50 cursor-not-allowed translate-y-1' : 'hover:brightness-110 active:brightness-95 active:translate-y-1'}`}
          onClick={handleSpin}
          style={{ boxShadow: isSpinning ? 'none' : '0 4px 0 #61000e' }}
        >
          {isSpinning ? (
            <><span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span> ĐANG QUAY...</>
          ) : (
            <><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>casino</span> QUAY NGAY!</>
          )}
        </button>
      </main>
    </div>
  );
};

export default GroupSpinFoodWheel;
