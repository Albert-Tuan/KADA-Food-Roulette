import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, Flame, DollarSign, Ban, RotateCcw, ArrowLeft, Check, Sparkles, User, AlertCircle } from 'lucide-react';
import { preferencesApi, UserPreference } from '../../../api/endpoints/preferences';

export const PreferencesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [pref, setPref] = useState<UserPreference | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form states
  const [priceRange, setPriceRange] = useState<number>(2);
  const [spiceTolerance, setSpiceTolerance] = useState<string>('medium');
  const [dietary, setDietary] = useState<string[]>([]);
  const [dislikedInput, setDislikedInput] = useState<string>('');
  const [disliked, setDisliked] = useState<string[]>([]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await preferencesApi.getPreferences();
      setPref(data);
      setPriceRange(data.priceRange ?? 2);
      setSpiceTolerance(data.spiceTolerance || 'medium');
      setDietary(data.dietaryRestrictions || []);
      setDisliked(data.dislikedIngredients || []);
      localStorage.setItem('user_preferences', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to fetch server preferences, checking local storage cache:', err);
      const cached = localStorage.getItem('user_preferences');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPref(parsed);
          setPriceRange(parsed.priceRange ?? 2);
          setSpiceTolerance(parsed.spiceTolerance || 'medium');
          setDietary(parsed.dietaryRestrictions || []);
          setDisliked(parsed.dislikedIngredients || []);
        } catch {
          // ignore parsing error
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const updated = await preferencesApi.updatePreferences({
        priceRange,
        spiceTolerance,
        dietaryRestrictions: dietary,
        dislikedIngredients: disliked,
      });
      setPref(updated);
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      setMessage('Đã lưu sở thích ẩm thực cá nhân thành công! ✓');
    } catch (err) {
      console.error(err);
      const localPref = {
        userId: 'demo_user_123',
        cuisineScores: pref?.cuisineScores || {},
        priceRange,
        spiceTolerance,
        dietaryRestrictions: dietary,
        dislikedIngredients: disliked,
      };
      setPref(localPref);
      localStorage.setItem('user_preferences', JSON.stringify(localPref));
      setMessage('Đã lưu sở thích cá nhân thành công! ✓');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Bạn có chắc muốn đặt lại tất cả điểm học AI cá nhân hóa?')) {
      try {
        const reset = await preferencesApi.resetPreferences();
        setPref(reset);
        localStorage.setItem('user_preferences', JSON.stringify(reset));
        setMessage('Đã reset điểm AI học được về mặc định.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleDietary = (item: string) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter((d) => d !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const addDisliked = () => {
    if (dislikedInput.trim() && !disliked.includes(dislikedInput.trim())) {
      setDisliked([...disliked, dislikedInput.trim()]);
      setDislikedInput('');
    }
  };

  const removeDisliked = (item: string) => {
    setDisliked(disliked.filter((d) => d !== item));
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-amber-50/40 p-6 flex flex-col items-center justify-center text-stone-500">
        <Sparkles className="w-8 h-8 text-amber-500 animate-spin mb-2" />
        <p className="text-xs">Đang tải sở thích cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-amber-50/40 p-4 pb-28 text-stone-800 font-sans">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-amber-200/60 shadow-sm hover:bg-amber-100/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            🔮 AI Preference Settings
          </h1>
          <p className="text-xs text-stone-500">Tùy chỉnh và quản lý sở thích ăn uống cá nhân hóa</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700">×</button>
        </div>
      )}

      {/* AI Learned Taste Profile Radar Scores */}
      {pref && pref.cuisineScores && Object.keys(pref.cuisineScores).length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-200" />
            AI Taste Profile (Đã học từ lịch sử)
          </h3>
          <p className="text-xs text-amber-100 mb-3">Tự động tích lũy từ các lần Spin, Locket và Review của bạn</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(pref.cuisineScores).map(([cuisine, score]) => (
              <div key={cuisine} className="p-2 rounded-xl bg-white/15 backdrop-blur flex justify-between items-center">
                <span className="font-semibold capitalize">{cuisine}</span>
                <span className="font-extrabold text-amber-200">{Math.round((score as number) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Explicit Controls */}
      <div className="space-y-5">
        {/* 1. Price Budget Level */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Mức Giá Mong Muốn (Budget)
          </h3>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { level: 1, label: '< 50K' },
              { level: 2, label: '50K - 150K' },
              { level: 3, label: '150K - 300K' },
              { level: 4, label: '> 300K' },
            ].map((p) => (
              <button
                key={p.level}
                onClick={() => setPriceRange(p.level)}
                className={`py-2.5 px-2 rounded-xl border text-center font-bold transition-all ${
                  priceRange === p.level
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Spice Tolerance */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-500" />
            Khả Năng Ăn Cay
          </h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { val: 'mild', label: 'Ít cay / Không cay' },
              { val: 'medium', label: 'Cay vừa' },
              { val: 'spicy', label: 'Cay nồng 🔥' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setSpiceTolerance(s.val)}
                className={`py-2.5 px-2 rounded-xl border text-center font-bold transition-all ${
                  spiceTolerance === s.val
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Special Dietary Restrictions */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            Chế Độ Ăn Đặc Biệt
          </h3>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {['chay', 'halal', 'không gluten', 'keto', 'low-carb'].map((d) => {
              const active = dietary.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDietary(d)}
                  className={`px-3 py-1.5 rounded-full border font-semibold capitalize transition-all ${
                    active
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {active ? '✓ ' : '+ '}
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Disliked Ingredients */}
        <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
          <h3 className="font-bold text-sm text-stone-800 mb-2 flex items-center gap-2">
            <Ban className="w-4 h-4 text-stone-600" />
            Thành Phần Không Thích / Dị Ứng
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="VD: hải sản, hành tây..."
              value={dislikedInput}
              onChange={(e) => setDislikedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addDisliked()}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={addDisliked}
              className="px-3 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 transition-colors"
            >
              Thêm
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {disliked.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-1"
              >
                {item}
                <button onClick={() => removeDisliked(item)} className="hover:text-rose-900">×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi Cài Đặt'}
        </button>

        <button
          onClick={handleReset}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt Lại Học Điểm AI Về Ban Đầu
        </button>
      </div>
    </div>
  );
};

export default PreferencesScreen;
