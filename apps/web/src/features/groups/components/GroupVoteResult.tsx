import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CircleAiSuggestionCard from './CircleAiSuggestionCard';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';

const GroupVoteResult: React.FC = () => {
  const navigate = useNavigate();
  const { members, votes } = useGroupSpinStore();
  const { currentResult, candidates } = useSpinStore();
  
  const acceptedVotes = Object.values(votes).filter(v => v === 'ACCEPT').length;
  const isAccepted = acceptedVotes > members.length / 2;
  
  const resultData = currentResult || candidates[0] || {
    name: 'Bún Bò Bà Luân',
    category: 'Vietnamese',
    rating: 4.8,
    distance: 1200,
    priceLevel: 2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALk4dwkNUyR5ChcBEi3M73YQuX5xZMTFGpJc2bo49ylnPPsMi0siDmms2h3I8u_slf6tQrGyop4aO9CFvCLhdm1Y55bHN3n1WbyCz9m70qkGdqlDc6cFZMtVvpJc60F7-FsurmSgwfKUhtGwpVvcNt_etwZcRYegxebSBPJcgfFu9_nPJ6ER1LNbbuzIa_AJosS_QKVDtqEFSleXw-3_i16U-PMp_ffSVg49FVBDvRfWseioTLsf3lsQ'
  };

  // Mock data for AI Circle Suggestions in group spin result
  const mockMemberScores = [
    {
      userId: 'user-1',
      userName: 'Minh',
      topItem: { name: 'Bún bò đặc biệt Bà Luân', priceVND: 65000, category: 'món chính', tags: ['cay'] },
      matchScore: 0.92,
      reasons: ['Bạn thích món bún bò ✓', 'Trong budget của bạn ✓', 'Bạn thích món cay 🔥'],
      alternativeItems: [{ name: 'Bún bò gân' }, { name: 'Bún bò giò heo' }],
    },
    {
      userId: 'user-2',
      userName: 'Lan',
      topItem: { name: 'Bún bò nạm chả', priceVND: 55000, category: 'món chính', tags: [] },
      matchScore: 0.85,
      reasons: ['Lan thích bún nước ✓', 'Vừa phải không quá cay ✓'],
      alternativeItems: [{ name: 'Bún bò tái' }],
    },
    {
      userId: 'user-3',
      userName: 'Tuấn',
      topItem: { name: 'Bún bò bắp hoa', priceVND: 60000, category: 'món chính', tags: [] },
      matchScore: 0.78,
      reasons: ['Phù hợp khẩu vị đạm cao ✓'],
      alternativeItems: [{ name: 'Bún bò gân nạm' }],
    },
  ];

  useEffect(() => {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    const colors = ['#ff5a5f', '#FFC107', '#16A34A', '#ffab69'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti-piece');
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100 + 'vw';
        const animationDuration = (Math.random() * 2 + 2) + 's';
        const animationDelay = Math.random() * 3 + 's';
        
        confetti.style.setProperty('--color', color);
        confetti.style.left = left;
        confetti.style.animationDuration = animationDuration;
        confetti.style.animationDelay = animationDelay;
        
        if(Math.random() > 0.5) {
            confetti.style.borderRadius = '50%';
        }

        container.appendChild(confetti);
    }

    const timer = setTimeout(() => {
      if (container) {
        container.innerHTML = '';
      }
    }, 6000);

    return () => {
      clearTimeout(timer);
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
      <style>{`
        .confetti-piece {
            position: absolute;
            width: 10px;
            height: 20px;
            background-color: var(--color);
            opacity: 0;
            animation: confetti-fall 3s ease-in-out infinite;
        }
        @keyframes confetti-fall {
            0% { opacity: 1; transform: translateY(-100vh) rotate(0deg); }
            100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
      
      {/* Confetti Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" id="confetti-container"></div>
      
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-margin-mobile py-base sticky top-0 z-50 bg-surface dark:bg-surface-dim shadow-sm dark:shadow-none">
        <div className="text-headline-md font-headline-md font-extrabold text-primary dark:text-primary-container flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          Food Roulette
        </div>
        <div className="text-primary dark:text-primary-fixed-dim font-label-strong text-label-strong flex items-center gap-1">
          <span className="material-symbols-outlined">toll</span>
          500 coins
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-stack-lg z-10 w-full max-w-md mx-auto">
        {/* Celebratory Header */}
        <div className="text-center mb-stack-lg animate-bounce">
          <h1 className="text-display-hero font-display-hero text-primary mb-stack-sm drop-shadow-md">{isAccepted ? 'ĐI THÔI!' : 'QUAY LẠI!'}</h1>
          <p className="text-headline-md font-headline-md text-secondary">
            {isAccepted ? 'ĐA SỐ CHẤP NHẬN!' : 'CHƯA ĐẠT ĐỒNG THUẬN'}
          </p>
        </div>

        {/* Winning Restaurant Card */}
        <div className="w-full bg-surface-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] border border-subtle-gray overflow-hidden mb-stack-lg relative transform transition-transform hover:scale-[1.02]">
          <div className="relative w-full h-48">
            <img className="w-full h-full object-cover" alt={resultData.name} src={resultData.imageUrl} />
            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
            {/* Badges */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              <div className="bg-surface-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-streak-gold text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-caption font-caption text-on-surface">{resultData.rating}</span>
              </div>
              <div className="bg-surface-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-tertiary text-[16px]">location_on</span>
                <span className="text-caption font-caption text-on-surface">{(resultData.distance / 1000).toFixed(1)}km</span>
              </div>
            </div>
          </div>
          <div className="p-4">
            <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-1">{resultData.name}</h2>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="bg-surface-container-low border border-subtle-gray text-on-surface-variant px-2 py-0.5 rounded-md text-caption font-caption">{resultData.category}</span>
              <span className="bg-surface-container-low border border-subtle-gray text-on-surface-variant px-2 py-0.5 rounded-md text-caption font-caption">{Array(resultData.priceLevel).fill('$').join('')}</span>
            </div>
            <p className="text-body-md font-body-md text-tertiary font-medium flex items-center gap-1 mt-stack-md">
              <span className="material-symbols-outlined text-[18px]">group</span>
              {acceptedVotes}/{members.length} thành viên đã đồng ý
            </p>
          </div>
        </div>

        {/* AI Suggestion Section */}
        <div className="w-full mb-stack-md">
          <CircleAiSuggestionCard memberScores={mockMemberScores} />
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-stack-md">
          {isAccepted ? (
            <button onClick={() => navigate('/group-check-in')} className="w-full bg-primary text-on-primary rounded-xl py-3 px-4 text-headline-md font-headline-md shadow-md border-b-4 border-on-primary-fixed-variant active:border-b-0 active:translate-y-1 transition-all duration-150 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
              Tạo Khế Ước
            </button>
          ) : (
            <button onClick={() => navigate('/group-spin/who-spins')} className="w-full bg-error text-on-error rounded-xl py-3 px-4 text-headline-md font-headline-md shadow-md border-b-4 border-error-container active:border-b-0 active:translate-y-1 transition-all duration-150 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>replay</span>
              Quay Lại Nhé
            </button>
          )}
          <button className="w-full bg-surface-white text-primary border-2 border-outline-variant rounded-xl py-3 px-4 text-label-strong font-label-strong hover:bg-surface-container-low transition-colors duration-200 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">directions</span>
            Chỉ đường
          </button>
        </div>

        {/* Informational Note */}
        <p className="text-caption font-caption text-on-surface-variant text-center mt-stack-lg max-w-[280px]">
          <span className="material-symbols-outlined text-[14px] inline-block align-middle mr-1">info</span>
          Khế ước sẽ giúp nhóm bạn chắc chắn thực hiện kế hoạch này!
        </p>
      </main>
    </div>
  );
};

export default GroupVoteResult;
