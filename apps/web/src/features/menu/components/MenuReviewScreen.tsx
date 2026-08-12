import React, { useState } from 'react';
import { Plus, Trash2, Dices, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { menuApi, MenuItem } from '../../../api/endpoints/menu';

export const MenuReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as {
    menuId?: string;
    initialItems?: MenuItem[];
    confidence?: number;
    previewUrl?: string;
  } || {};

  const [items, setItems] = useState<MenuItem[]>(
    state.initialItems || []
  );

  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemPrice, setNewItemPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleToggleTag = (index: number, tag: string) => {
    const updated = [...items];
    const currentTags = updated[index].tags || [];
    if (currentTags.includes(tag)) {
      updated[index].tags = currentTags.filter((t) => t !== tag);
    } else {
      updated[index].tags = [...currentTags, tag];
    }
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const priceNum = parseInt(newItemPrice.replace(/\D/g, ''), 10);
    setItems([
      ...items,
      {
        name: newItemName.trim(),
        priceVND: isNaN(priceNum) ? null : priceNum,
        category: 'món chính',
        tags: [],
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleConfirmAndSpin = async () => {
    setIsSubmitting(true);
    if (state.menuId) {
      try {
        await menuApi.verifyMenu(state.menuId, items);
      } catch (verifyErr) {
        console.log('[MenuReviewScreen] DB verify notice (graceful mode):', verifyErr);
      }
    }
    setIsSubmitting(false);
    navigate('/spin/menu-wheel', {
      state: {
        menuItems: items,
        fromMenuCapture: true,
      },
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-amber-50/40 p-4 pb-48 text-stone-800 font-sans">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-amber-200/60 shadow-sm hover:bg-amber-100/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            📋 Xác Nhận Menu Đã Nhận Diện
          </h1>
          <p className="text-xs text-stone-500">AI đã quét được {items.length} món ăn từ menu</p>
        </div>
      </div>

      {/* Confidence Badge */}
      {state.confidence !== undefined && (
        <div className="mb-4 p-3 rounded-xl bg-white border border-amber-200 shadow-sm flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Độ chính xác nhận diện AI:
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {Math.round(state.confidence * 100)}%
          </span>
        </div>
      )}

      {/* List of Parsed Items */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const score = item.matchScore ?? 85;
          const isHighMatch = score >= 80;
          const isMediumMatch = score >= 60 && score < 80;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5 ${
                item.warnings && item.warnings.length > 0
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-amber-100'
              }`}
            >
              {/* Top Row: Name Input + Delete Button */}
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...items];
                    updated[idx].name = e.target.value;
                    setItems(updated);
                  }}
                  className="font-bold text-sm text-stone-800 bg-transparent border-b border-stone-200 hover:border-amber-400 focus:border-amber-500 focus:outline-none flex-1 py-0.5"
                />
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sub Row: AI Match Score Badge + Price Input */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                    isHighMatch
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isMediumMatch
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {isHighMatch ? '💚' : isMediumMatch ? '💛' : '🔴'} {score}% Hợp Gu
                </span>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-stone-500">Giá:</span>
                  <input
                    type="number"
                    placeholder="Giá VNĐ"
                    value={item.priceVND || ''}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].priceVND = e.target.value ? parseInt(e.target.value, 10) : null;
                      setItems(updated);
                    }}
                    className="w-28 text-right text-xs font-bold text-amber-800 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs font-semibold text-amber-900">đ</span>
                </div>
              </div>

              {/* Sub-Dishes List for Combos */}
              {item.subDishes && item.subDishes.length > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-700">
                  <span className="font-bold text-[11px] text-amber-900 block mb-1">
                    🍱 Danh sách các món trong Combo:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.subDishes.map((sd, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[11px] font-medium text-stone-700 shadow-2xs"
                      >
                        • {sd}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Personalization Warnings */}
              {item.warnings && item.warnings.length > 0 && (
                <div className="space-y-1">
                  {item.warnings.map((w, wIdx) => (
                    <div
                      key={wIdx}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Tag Selector Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-100 text-[11px]">
                <span className="text-stone-400 font-medium mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Tags:
                </span>
                {['cay', 'chay', 'chiên', 'nướng'].map((t) => {
                  const isSelected = item.tags?.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => handleToggleTag(idx, t)}
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t === 'cay' && '🔥 '}
                      {t === 'chay' && '🌱 '}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Item Row */}
      <div className="mt-4 p-3 rounded-2xl bg-amber-100/50 border border-dashed border-amber-300 flex items-center gap-2">
        <input
          type="text"
          placeholder="Tên món bị thiếu..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-amber-200 focus:outline-none focus:border-amber-500"
        />
        <input
          type="number"
          placeholder="Giá VNĐ"
          value={newItemPrice}
          onChange={(e) => setNewItemPrice(e.target.value)}
          className="w-24 text-xs px-2 py-2 rounded-xl bg-white border border-amber-200 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handleAddItem}
          className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sticky Bottom Action positioned right above MainLayout bottom navigation bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-3 bg-white/95 backdrop-blur border-t border-amber-200 shadow-lg z-40">
        <button
          onClick={handleConfirmAndSpin}
          disabled={items.length === 0 || isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Dices className="w-5 h-5 animate-spin-slow" />
          Quay Vòng Chọn Món Ngay ({items.length} món)
        </button>
      </div>
    </div>
  );
};

export default MenuReviewScreen;
