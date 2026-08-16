import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Utensils,
  Flame,
  User,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';
import { preferencesApi } from '../../../api/endpoints/preferences';

const CUISINE_OPTIONS = [
  { id: 'pho_bun', name: 'Phở & Bún Việt', icon: '🍜', category: 'món việt' },
  { id: 'com_tam', name: 'Cơm Tấm & Cơm Niêu', icon: '🍚', category: 'cơm' },
  { id: 'lau_nuong', name: 'Lẩu & Nướng BBQ', icon: '🥩', category: 'tiệc' },
  { id: 'mon_nhat', name: 'Sushi & Món Nhật', icon: '🍣', category: 'nhật' },
  { id: 'mon_han', name: 'Đồ Hàn & Kimchi', icon: '🥘', category: 'hàn' },
  { id: 'mon_au', name: 'Pizza & Món Âu', icon: '🍕', category: 'âu' },
  { id: 'mon_thai', name: 'Món Thái Chua Cay', icon: '🌶️', category: 'thái' },
  { id: 'tra_sua', name: 'Trà Sữa & Cà Phê', icon: '🧋', category: 'đồ uống' },
  { id: 'an_vat', name: 'Ăn Vặt & Fastfood', icon: '🍟', category: 'ăn vặt' },
  { id: 'chay_healthy', name: 'Chay & Healthy', icon: '🥗', category: 'chay' },
  { id: 'hai_san', name: 'Hải Sản & Quán Ốc', icon: '🦪', category: 'hải sản' },
  { id: 'banh_mi', name: 'Bánh Mì & Điểm Tâm', icon: '🥖', category: 'điểm tâm' },
];

const SPICE_LEVELS = [
  { id: 'none', label: 'Không Cay', icon: '🧊' },
  { id: 'low', label: 'Ít Cay', icon: '🌶️' },
  { id: 'medium', label: 'Cay Vừa', icon: '🔥' },
  { id: 'high', label: 'Rất Cay', icon: '🌋' },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Ăn Chay (Ovo/Lacto)', icon: '🌿' },
  { id: 'vegan', label: 'Thuần Chay 100%', icon: '🌱' },
  { id: 'halal', label: 'Chuẩn Halal', icon: '🕌' },
  { id: 'gluten_free', label: 'Không Gluten', icon: '🌾' },
];

const DISLIKED_INGREDIENTS = [
  { id: 'onion', label: 'Hành lá / Củ hành' },
  { id: 'garlic', label: 'Tỏi' },
  { id: 'cilantro', label: 'Rau ngò / Mùi' },
  { id: 'peanut', label: 'Đậu phộng (Lạc)' },
  { id: 'seafood', label: 'Hải sản (Tôm, Cua)' },
  { id: 'pork', label: 'Thịt heo' },
  { id: 'beef', label: 'Thịt bò' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Location
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('TP. Hồ Chí Minh (Gần bạn)');

  // Step 2: Cuisines
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'pho_bun',
    'com_tam',
    'lau_nuong',
  ]);

  // Step 3: Dietary & Spice
  const [spiceTolerance, setSpiceTolerance] = useState<string>('medium');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [dislikedList, setDislikedList] = useState<string[]>([]);

  // Step 4: Profile
  const [displayNamePublic, setDisplayNamePublic] = useState<string>('Foodie Explorer');
  const [displayNamePrivate, setDisplayNamePrivate] = useState<string>('Bạn Thân');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0]);
  const [bio, setBio] = useState<string>('Mê ẩm thực đường phố và thích khám phá quán mới mỗi ngày!');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleRequestLocation = () => {
    setLocationGranted(true);
    setDetectedLocation('📍 Quận 1, TP. Hồ Chí Minh (Đã định vị)');
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);

      const cuisineScores: Record<string, number> = {};
      selectedCuisines.forEach((c) => {
        cuisineScores[c] = 90;
      });

      await preferencesApi.completeOnboarding({
        displayNamePrivate: displayNamePrivate.trim() || undefined,
        displayNamePublic: displayNamePublic.trim() || undefined,
        avatarUrl: selectedAvatar,
        bio: bio.trim() || undefined,
        preferences: {
          cuisineScores,
          priceRange: 2,
          dietaryRestrictions: selectedDietary,
          spiceTolerance,
          dislikedIngredients: dislikedList,
        },
      });

      // Cache locally
      localStorage.setItem('user_is_onboarded', 'true');
      localStorage.setItem(
        'user_preferences',
        JSON.stringify({
          cuisineScores,
          priceRange: 2,
          dietaryRestrictions: selectedDietary,
          spiceTolerance,
          dislikedIngredients: dislikedList,
        })
      );

      setCurrentStep(5);
    } catch (error) {
      console.log('Non-blocking onboarding sync:', error);
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-amber-100/30 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-amber-200/80 shadow-2xl shadow-amber-900/10 overflow-hidden">
        {/* Header with Step Progress */}
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="font-black text-sm uppercase tracking-wider text-amber-900">
                Food Roulette Onboarding
              </span>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-200/60 px-3 py-1 rounded-full">
              Bước {currentStep} / 5
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-amber-200/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 md:p-8">
          {/* STEP 1: GPS Permission */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-100/80 border-2 border-amber-300 flex items-center justify-center text-amber-700 shadow-inner">
                <MapPin className="w-10 h-10 text-orange-600" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-stone-900 mb-2">
                  Cho phép truy cập Vị trí GPS 📍
                </h2>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Food Roulette cần vị trí của bạn để quay và đề xuất các quán ăn ngon nhất quanh bạn
                  trong bán kính 1km - 5km.
                </p>
              </div>

              <div className="w-full max-w-md p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-sm flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{locationGranted ? `✅ ${detectedLocation}` : '📍 Vị trí chưa được cấp quyền'}</span>
              </div>

              <div className="w-full max-w-md space-y-3 pt-2">
                <button
                  onClick={handleRequestLocation}
                  className={`w-full py-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all ${
                    locationGranted
                      ? 'bg-emerald-600 shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:scale-[1.02] active:scale-[0.98] shadow-orange-500/30'
                  }`}
                >
                  {locationGranted ? '✓ ĐÃ CẤP QUYỀN VỊ TRÍ' : '📡 CHO PHÉP ĐỊNH VỊ GPS'}
                </button>

                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-2.5 text-xs font-bold text-stone-400 hover:text-stone-700"
                >
                  Để sau, tiếp tục ➔
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Cuisine Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-stone-900 mb-1">
                  Bạn thích ăn món gì nhất? 🍽️
                </h2>
                <p className="text-xs md:text-sm text-stone-600">
                  Chọn ít nhất 2 thể loại yêu thích để thuật toán AI ưu tiên trên bánh xe quay.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {CUISINE_OPTIONS.map((c) => {
                  const isSelected = selectedCuisines.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleItem(selectedCuisines, setSelectedCuisines, c.id)}
                      className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${
                        isSelected
                          ? 'bg-amber-100/70 border-orange-500 shadow-md shadow-orange-500/10'
                          : 'bg-stone-50/60 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-2xl">{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-extrabold truncate ${
                            isSelected ? 'text-orange-900' : 'text-stone-800'
                          }`}
                        >
                          {c.name}
                        </p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>TIẾP TỤC ({selectedCuisines.length} THỂ LOẠI ĐÃ CHỌN)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Dietary & Spice Tolerance */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-stone-900 mb-1">
                  Khẩu vị & Dị ứng ăn uống 🌶️
                </h2>
                <p className="text-xs md:text-sm text-stone-600">
                  AI sẽ tự động lọc bỏ các món gây dị ứng hoặc không phù hợp với khẩu vị của bạn.
                </p>
              </div>

              <div className="space-y-5 max-h-[360px] overflow-y-auto pr-1">
                {/* Spice Levels */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-2 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Mức độ ăn cay của bạn:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {SPICE_LEVELS.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setSpiceTolerance(sp.id)}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                          spiceTolerance === sp.id
                            ? 'bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-500/20'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-lg">{sp.icon}</span>
                        <span className="text-[11px] font-bold">{sp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-2 block">
                    🌱 Chế độ ăn uống đặc biệt:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((d) => {
                      const isChecked = selectedDietary.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => toggleItem(selectedDietary, setSelectedDietary, d.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5 ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:border-emerald-400'
                          }`}
                        >
                          <span>{d.icon}</span>
                          <span>{d.label}</span>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Disliked Ingredients */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-2 block">
                    🚫 Nguyên liệu muốn tránh (Dị ứng / Không ăn):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DISLIKED_INGREDIENTS.map((ing) => {
                      const isChecked = dislikedList.includes(ing.id);
                      return (
                        <button
                          key={ing.id}
                          onClick={() => toggleItem(dislikedList, setDislikedList, ing.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            isChecked
                              ? 'bg-rose-600 border-rose-700 text-white'
                              : 'bg-rose-50/50 border-rose-200 text-rose-800 hover:border-rose-300'
                          }`}
                        >
                          {isChecked ? '❌ ' : '+ '}
                          {ing.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>TIẾP THEO: THIẾT LẬP HỒ SƠ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 4: Profile & Display Names */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-black text-stone-900 mb-1">
                  Hồ sơ & Avatar của bạn ✨
                </h2>
                <p className="text-xs md:text-sm text-stone-600">
                  Tên và hình đại diện sẽ hiển thị khi bạn tham gia quay nhóm hoặc chia sẻ Locket.
                </p>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {/* Avatar Row */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-2 block">
                    🖼️ Chọn ảnh đại diện:
                  </label>
                  <div className="flex items-center gap-3">
                    {PRESET_AVATARS.map((avatarUri, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedAvatar(avatarUri)}
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                          selectedAvatar === avatarUri
                            ? 'border-orange-500 ring-4 ring-orange-500/20 scale-105'
                            : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={avatarUri}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Public Display Name */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-1.5 block">
                    👤 Tên hiển thị công khai (Bảng xếp hạng):
                  </label>
                  <input
                    type="text"
                    value={displayNamePublic}
                    onChange={(e) => setDisplayNamePublic(e.target.value)}
                    placeholder="Vd: Hoàng Hiếu Foodie"
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-stone-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                {/* Private Display Name */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-1.5 block">
                    🔒 Biệt danh thân mật (Dành cho bạn bè):
                  </label>
                  <input
                    type="text"
                    value={displayNamePrivate}
                    onChange={(e) => setDisplayNamePrivate(e.target.value)}
                    placeholder="Vd: Hiếu Mập"
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-stone-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-black uppercase text-amber-900 mb-1.5 block">
                    ✍️ Giới thiệu ngắn về khẩu vị (Bio):
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Thích ăn lẩu nướng, mê khám phá quán mới..."
                    className="w-full px-4 py-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-stone-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
              </div>

              <button
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>HOÀN TẤT & KHÁM PHÁ NGAY 🚀</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: Celebration & Start */}
          {currentStep === 5 && (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-400 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20 animate-bounce">
                🎉
              </div>

              <div>
                <h2 className="text-3xl font-black text-stone-900 mb-2">
                  Chúc Mừng Bạn Đã Sẵn Sàng!
                </h2>
                <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Hồ sơ ẩm thực AI của bạn đã được thiết lập thành công. Hãy bắt đầu cuộc phiêu lưu ẩm
                  thực ngay hôm nay!
                </p>
              </div>

              {/* Summary Card */}
              <div className="w-full max-w-md p-4 rounded-3xl bg-amber-50/80 border border-amber-200 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedAvatar}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                  />
                  <div>
                    <h4 className="font-black text-base text-stone-900">{displayNamePublic}</h4>
                    <p className="text-xs text-stone-500 line-clamp-1">{bio}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-full border border-amber-200 text-amber-900">
                    🍽️ {selectedCuisines.length} Thể loại thích
                  </span>
                  <span className="text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-full border border-amber-200 text-amber-900">
                    🌶️ {SPICE_LEVELS.find((s) => s.id === spiceTolerance)?.label || 'Vừa'}
                  </span>
                  {selectedDietary.length > 0 && (
                    <span className="text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-full border border-amber-200 text-emerald-800">
                      🌿 {selectedDietary.length} Chế độ ăn
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-black text-base shadow-xl shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>🎰 VÀO VÒNG QUAY CHỌN MÓN NGAY</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
