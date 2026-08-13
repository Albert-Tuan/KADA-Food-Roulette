import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProfileTasteProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'locket' | 'achievements'>('locket');

  // State for toggles
  const [allergies, setAllergies] = useState({
    seafood: false,
    peanut: false,
    milk: false,
    gluten: false,
    egg: false
  });

  const toggleAllergy = (key: keyof typeof allergies) => {
    setAllergies(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="w-full max-w-lg mx-auto px-margin-mobile space-y-stack-lg pb-stack-lg">

      {/* User Profile Section */}
      <section className="flex flex-col items-center mt-4">
        <div className="relative mb-stack-md">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-white shadow-md">
            <img 
              alt="Avatar" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200" 
            />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-surface-white rounded-full flex items-center justify-center shadow-sm border border-subtle-gray">
            <span className="material-symbols-outlined text-streak-gold text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
        </div>
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Bạn Nhậu Demo</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">@testuser2026</p>

        {/* Quick Link to Preference Settings */}
        <Link
          to="/preferences"
          className="mt-3 px-4 py-2 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-amber-200/80 shadow-xs"
        >
          <span className="material-symbols-outlined text-sm">tune</span>
          ⚙️ Tùy Chỉnh Khẩu Vị AI
        </Link>
      </section>

      {/* Stats Bar */}
      <section className="grid grid-cols-3 gap-3 bg-surface-white rounded-xl p-4 border border-subtle-gray shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-center border-r border-subtle-gray">
          <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center mb-2 text-primary">
            <span className="material-symbols-outlined">photo_library</span>
          </div>
          <span className="font-headline-md text-headline-md-mobile text-on-background">24</span>
          <span className="font-caption text-caption text-on-surface-variant">Locket</span>
        </div>
        <div className="flex flex-col items-center text-center border-r border-subtle-gray">
          <div className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center mb-2 text-primary">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <span className="font-headline-md text-headline-md-mobile text-on-background">48</span>
          <span className="font-caption text-caption text-on-surface-variant">Check-in</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-[#fff8e1] rounded-full flex items-center justify-center mb-2 text-streak-gold">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <span className="font-headline-md text-headline-md-mobile text-on-background">7</span>
          <span className="font-caption text-caption text-on-surface-variant">Ngày streak</span>
        </div>
      </section>

      {/* Taste Profile Card */}
      <section className="bg-surface-white rounded-xl p-6 border border-subtle-gray shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h3 className="font-headline-md text-headline-md-mobile text-on-background mb-4">Gu ẩm thực của bạn</h3>
        <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center mb-2">
          <div className="absolute inset-0 m-auto w-full h-full border border-subtle-gray rounded-full opacity-30"></div>
          <div className="absolute inset-0 m-auto w-3/4 h-3/4 border border-subtle-gray rounded-full opacity-50"></div>
          <div className="absolute inset-0 m-auto w-2/4 h-2/4 border border-subtle-gray rounded-full opacity-70"></div>
          <div className="absolute inset-0 m-auto w-full h-[1px] bg-subtle-gray rotate-0"></div>
          <div className="absolute inset-0 m-auto w-full h-[1px] bg-subtle-gray rotate-[72deg]"></div>
          <div className="absolute inset-0 m-auto w-full h-[1px] bg-subtle-gray rotate-[144deg]"></div>
          <svg className="absolute w-[85%] h-[85%] z-10 drop-shadow-md" viewBox="0 0 100 100">
            <path d="M 50 15 L 85 40 L 75 80 L 20 70 L 15 35 Z" fill="rgba(255, 90, 95, 0.2)" stroke="#b52330" strokeLinejoin="round" strokeWidth="2"></path>
            <circle cx="50" cy="15" fill="#b52330" r="3"></circle>
            <circle cx="85" cy="40" fill="#b52330" r="3"></circle>
            <circle cx="75" cy="80" fill="#b52330" r="3"></circle>
            <circle cx="20" cy="70" fill="#b52330" r="3"></circle>
            <circle cx="15" cy="35" fill="#b52330" r="3"></circle>
          </svg>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 font-label-strong text-caption text-on-surface-variant">Spicy</div>
          <div className="absolute top-1/4 right-0 translate-x-4 font-label-strong text-caption text-on-surface-variant">Sweet</div>
          <div className="absolute bottom-4 right-4 translate-x-4 translate-y-4 font-label-strong text-caption text-on-surface-variant">Healthy</div>
          <div className="absolute bottom-4 left-4 -translate-x-4 translate-y-4 font-label-strong text-caption text-on-surface-variant">Savory</div>
          <div className="absolute top-1/4 left-0 -translate-x-4 font-label-strong text-caption text-on-surface-variant">Sour</div>
        </div>
        <p className="text-center font-body-md text-caption text-on-surface-variant mt-4">
          Bạn là tín đồ của vị <span className="font-label-strong text-primary">Cay</span> và <span className="font-label-strong text-primary">Ngọt</span>!
        </p>
      </section>

      {/* Allergy Settings */}
      <section className="bg-surface-white rounded-xl p-6 border border-subtle-gray shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h3 className="font-headline-md text-headline-md-mobile text-on-background mb-2">Thiết lập Dị ứng</h3>
        <p className="font-body-md text-caption text-on-surface-variant mb-4">Các lựa chọn này sẽ loại trừ các nhà hàng tương ứng khỏi kết quả quay và khám phá của bạn.</p>
        <div className="space-y-3">
          {[
            { id: 'seafood', icon: 'set_meal', label: 'Hải sản' },
            { id: 'peanut', icon: 'nutrition', label: 'Đậu phộng' },
            { id: 'milk', icon: 'water_drop', label: 'Sữa' },
            { id: 'gluten', icon: 'bakery_dining', label: 'Gluten' },
            { id: 'egg', icon: 'egg', label: 'Trứng' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-transparent hover:border-subtle-gray transition-all">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                <span className="font-label-strong text-on-background">{item.label}</span>
              </div>
              <button 
                onClick={() => toggleAllergy(item.id as keyof typeof allergies)}
                className={`w-10 h-6 rounded-full relative transition-colors ${allergies[item.id as keyof typeof allergies] ? 'bg-primary' : 'bg-subtle-gray'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${allergies[item.id as keyof typeof allergies] ? 'left-5' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Content Tabs */}
      <section className="mt-stack-lg">
        <div className="flex border-b border-subtle-gray mb-stack-md">
          <button 
            onClick={() => setActiveTab('locket')}
            className={`flex-1 pb-3 text-center border-b-2 font-label-strong text-label-strong transition-colors ${activeTab === 'locket' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-background'}`}
          >
            Locket của tôi
          </button>
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 pb-3 text-center border-b-2 font-label-strong text-label-strong transition-colors ${activeTab === 'achievements' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-background'}`}
          >
            Thành tích
          </button>
        </div>

        {activeTab === 'locket' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {/* Large featured locket */}
              <div className="col-span-2 relative aspect-[2/1] rounded-xl overflow-hidden shadow-sm">
                <img alt="Spicy Ramen Bowl" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7Xx5qXA1RVI0BLVvOfuaiYjKPQMPZqlh1eayun6WRA2lu0hAsjj86vbPh0oMJeag5zDwjPE6yQa68H-90hxkp5h6_F2E_dKZ3KVV9KJ8SL4EqcyGmvio9Z-HM03RUGisW4ALhXaeP3bTVdFUI0VEpB0yd84XuFZSS9W4E7xIn-YeSDYnyqosmeNJpgK9PR94VBbwTPNPgrHyETF4mlyUVf2gQIGKhf_vJtTkAm3Z7xIJN438u6H1gZQ" />
                <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                    </span>
                    <span className="font-label-strong text-caption text-white">Mì Cay Sasin</span>
                  </div>
                </div>
              </div>
              {/* Square lockets */}
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                <img alt="Matcha Crepe Cake" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvytG0FXxSjsRcadn9ZEhYUSfa-ZJ19vIIzvM7TZpD-HqbdtqBfyuE8P06SeT28j8RXSx32MKeV3EA3MjcnQOFqGBqw8hG13vbiQiPI1zCy760-YvYRg4kplGjFBM5iaGIKwX8hLo9QADgN2TFpc4HlaErv0w1guN0oGH79DAIXMukdjUMexDvIHtTtDSPbiqUUybWoqjh8WUSwpbUF8qRK8Ub_u6A8w2zE2FojhTgCVaGDg6BiHI0ow" />
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                </div>
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
                <img alt="Artisanal Tacos" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5xM8VugMzaTBHDVutxOO_sAm9mQ9s-JbO-P09MSPK5zkcz719fPoo7c4_jpGE-s9hotq5yLnHBqFjbZnL0tujgLsBKJmwDoXTftJUze1SkoQYdcAfY1vyd6FZb5YOXNl0PCsuPKi93CTh0avfXp71c-tNW72tLvmBieJ_eP6YzS5j8g4p_46dTiIxWJcHMTQiqjimPBHsCnHNGC7zq4hC0Ql36l3kLVHrvFxYPN1ckU2B7i4IMFdJlQ" />
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">favorite</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-3 bg-surface-container-low border border-subtle-gray rounded-xl font-label-strong text-label-strong text-on-background hover:bg-surface-container-high transition-colors">
              Xem tất cả locket
            </button>
          </>
        )}
        
        {activeTab === 'achievements' && (
          <div className="text-center p-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">military_tech</span>
            <p>Chưa có thành tích nào</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default ProfileTasteProfile;
