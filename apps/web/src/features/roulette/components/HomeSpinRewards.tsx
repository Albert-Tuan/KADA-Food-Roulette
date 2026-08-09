import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSpinStore } from '../../../stores/spinStore';
import SpinFilterModal from './SpinFilterModal';

const HomeSpinRewards: React.FC = () => {
  const navigate = useNavigate();
  const { spin, candidates } = useSpinStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // State for filters
  const [selectedPrice, setSelectedPrice] = useState<string>('$$');
  const [selectedDistance, setSelectedDistance] = useState<string>('Trung bình (2-5km)');
  const [selectedStyle, setSelectedStyle] = useState<string>('Cơm');
  const [selectedTaste, setSelectedTaste] = useState<string>('Cay');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const toggleAllergy = (a: string) => {
    setSelectedAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    const extraSpins = (Math.floor(Math.random() * 4) + 3) * 360;
    const randomSegment = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins + randomSegment;
    setRotation(newRotation);
    
    // Calculate which candidate the pointer lands on
    const pointerAngle = (360 - (newRotation % 360)) % 360;
    const sliceAngle = 360 / candidates.length;
    const winnerIndex = Math.floor(pointerAngle / sliceAngle);
    
    setTimeout(() => {
      setIsSpinning(false);
      spin(winnerIndex); // Pass the exact calculated winner
      navigate('/spin/result');
    }, 3000);
  };

  return (
    <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col items-center">
      {/* Page Title Context & Filter */}
      <div className="text-center mb-stack-lg relative w-full max-w-md">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="absolute right-0 top-0 bg-surface-variant text-on-surface-variant p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">tune</span>
        </button>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-stack-sm mt-4 md:mt-0">Ăn gì hôm nay?</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Chọn một quán ngẫu nhiên xung quanh bạn!</p>
      </div>

      {/* Wheel Component */}
      <div className="relative w-full max-w-md mx-auto mb-stack-lg">
        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mx-auto">
          {/* Wheel Pointer */}
          <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]"></div>
          
          {/* Wheel */}
          <div 
            className="w-full h-full rounded-full border-8 border-surface-white shadow-[0_12px_24px_rgba(0,0,0,0.1)] relative overflow-hidden bg-surface-container-low"
            style={{
              background: candidates.length > 0 
                ? `conic-gradient(${candidates.map((_, i) => {
                    const colors = ['#ff5a5f', '#ffab69', '#55a37a', '#FFC107', '#b52330', '#88d7aa'];
                    const start = (i * 360) / candidates.length;
                    const end = ((i + 1) * 360) / candidates.length;
                    return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                  }).join(', ')})`
                : '#e1d9cb',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
            }}
          >
            {/* Segment labels */}
            {candidates.map((candidate, i) => {
              const sliceAngle = 360 / candidates.length;
              const rotationAngle = (i * sliceAngle) + (sliceAngle / 2) - 90;
              return (
                <div 
                  key={candidate.id}
                  className="absolute top-1/2 left-1/2 origin-top-left text-white font-bold text-[12px] md:text-[14px] drop-shadow-md pointer-events-none w-[120px] md:w-[170px] text-right pr-[20px] line-clamp-2" 
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

      {/* Spin Action */}
      <button 
        className={`bg-primary text-on-primary font-headline-md text-headline-md-mobile px-8 py-4 rounded-full shadow-md btn-squish mb-stack-lg hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center gap-2 ${isSpinning ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleSpin}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
        QUAY NGAY!
      </button>

      {/* Candidates List */}
      <div className="w-full max-w-2xl mb-stack-lg">
        <h3 className="font-headline-md text-headline-md text-on-background mb-stack-md flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-secondary-container">restaurant_menu</span>
          Danh sách đề cử ({candidates.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
          {candidates.map(restaurant => (
            <div key={restaurant.id} className="bg-surface-white border border-subtle-gray rounded-xl p-stack-md shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full mb-stack-sm overflow-hidden border-2 border-primary-fixed">
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
              </div>
              <span className="font-label-strong text-label-strong text-on-surface line-clamp-1">{restaurant.name}</span>
              <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-streak-gold" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                {restaurant.rating} • {(restaurant.distance / 1000).toFixed(1)}km
              </span>
            </div>
          ))}
          
          {candidates.length === 0 && (
            <div className="col-span-full bg-surface-variant rounded-xl p-stack-md flex flex-col items-center text-center justify-center border border-dashed border-outline-variant opacity-70">
              <span className="material-symbols-outlined text-on-surface-variant mb-stack-sm">hourglass_empty</span>
              <span className="font-caption text-caption text-on-surface-variant">Không có quán nào phù hợp, hãy đổi bộ lọc</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md grid grid-cols-2 gap-stack-md mb-stack-lg">
        <Link to="/group-spin/who-spins" className="w-full bg-surface-white border-2 border-subtle-gray text-on-surface font-label-strong py-3 rounded-xl hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">group</span>
          Group Spin
        </Link>
        <Link to="/locket" className="w-full bg-surface-white border-2 border-subtle-gray text-on-surface font-label-strong py-3 rounded-xl hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">photo_library</span>
          Locket Feed
        </Link>
      </div>

      {/* Recent Discovery Card */}
      <div className="w-full max-w-2xl text-left">
        <h3 className="font-headline-md-mobile md:font-headline-md text-on-surface mb-stack-md px-2">Recent Discovery</h3>
        <div className="bg-surface-white rounded-xl overflow-hidden squishy-card flex flex-col sm:flex-row">
          {/* Image Side */}
          <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-[200px]">
            <img 
              className="w-full h-full object-cover" 
              alt="Ramen"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcawci1qIGgoudRL8ZWJaPNu6jXXckUuYagsjQMXrqBfGBR8mg8n7_tw9HaS5XF8wS1Iy_4JqTxCH0OgG-rVad79IgBJ5CXwHeqqBP3d8rBRpQDISYhZJrSQWrBV5OGsnCJJPhOQp_5k9gDv-hkzJII2MQR19GuJJqnNgnwsYeexbJqOBnB9a77o4DeM_lBV4Ni_Nv0fAUGvCFVcYi7zAc999dYvdN2mGSGHey3h_8IaqP6u50Id19KQ" 
            />
            {/* Status Indicator overlay */}
            <div className="absolute bottom-3 left-3 flex gap-2">
              <div className="bg-surface-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-streak-gold text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-label-strong text-caption text-on-surface">4.8</span>
              </div>
            </div>
          </div>
          {/* Content Side */}
          <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-headline-md-mobile text-on-surface">Umami Noodle Bar</h4>
                <span className="material-symbols-outlined text-subtle-gray hover:text-primary cursor-pointer transition-colors">favorite</span>
              </div>
              <p className="font-body-md text-on-surface-variant text-sm mb-3">Japanese • Ramen • $$</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-surface-container-low border border-subtle-gray px-2 py-1 rounded-md font-caption text-on-surface-variant">Spicy</span>
                <span className="bg-surface-container-low border border-subtle-gray px-2 py-1 rounded-md font-caption text-on-surface-variant">Vegetarian Options</span>
              </div>
            </div>
            <button className="text-primary font-label-strong flex items-center gap-1 self-start hover:underline">
              View Details
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
      <SpinFilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </main>
  );
};

export default HomeSpinRewards;
