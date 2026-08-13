import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dices, ArrowLeft, Trash2, CheckCircle2, Share2, Utensils, Receipt, RotateCcw, X, Copy, Users, Sparkles, Home } from 'lucide-react';
import { MenuItem } from '../../../api/endpoints/menu';

export const MenuDishSpinWheel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as {
    menuItems?: MenuItem[];
    fromMenuCapture?: boolean;
  }) || {};

  const getInitialDishes = (): MenuItem[] => {
    if (state.menuItems && state.menuItems.length > 0) {
      return state.menuItems;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('latest_scanned_menu');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [];
  };

  const [dishes] = useState<MenuItem[]>(getInitialDishes());
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedDishes, setSelectedDishes] = useState<MenuItem[]>([]);
  const [lastWonDish, setLastWonDish] = useState<MenuItem | null>(null);

  // Custom Modal & Toast States
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [emptyWarningToast, setEmptyWarningToast] = useState(false);
  const [peopleCount, setPeopleCount] = useState<number>(3);

  const handleSpin = () => {
    if (isSpinning || dishes.length === 0) return;
    setIsSpinning(true);
    setLastWonDish(null);

    const extraSpins = (Math.floor(Math.random() * 4) + 4) * 360;
    const randomSegment = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins + randomSegment;
    setRotation(newRotation);

    const pointerAngle = (360 - (newRotation % 360)) % 360;
    const sliceAngle = 360 / dishes.length;
    const winnerIndex = Math.floor(pointerAngle / sliceAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = dishes[winnerIndex];
      setLastWonDish(winner);
      setSelectedDishes((prev) => [...prev, winner]);
    }, 3200);
  };

  const handleRemoveSelectedDish = (idx: number) => {
    setSelectedDishes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmOrder = () => {
    if (selectedDishes.length === 0) {
      setEmptyWarningToast(true);
      setTimeout(() => setEmptyWarningToast(false), 2500);
      return;
    }
    setIsReceiptModalOpen(true);
  };

  const handleCopyOrderSummary = () => {
    const text = `🍻 BÀN ĂN FOOD ROULETTE - ${selectedDishes.length} MÓN (${totalBill.toLocaleString('vi-VN')}đ):\n` +
      selectedDishes.map((d, i) => `${i + 1}. ${d.name} - ${d.priceVND ? d.priceVND.toLocaleString('vi-VN') + 'đ' : 'Theo menu'}`).join('\n') +
      `\n\n💰 Dự tính mỗi người (${peopleCount} người): ${Math.round(totalBill / peopleCount).toLocaleString('vi-VN')}đ`;

    navigator.clipboard?.writeText?.(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const totalBill = selectedDishes.reduce((sum, item) => sum + (item.priceVND || 0), 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-amber-50/40 p-4 pb-32 text-stone-800 font-sans relative">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-stone-900 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce-short border border-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Đã sao chép danh sách món! Hãy dán vào Zalo/Messenger 💬</span>
        </div>
      )}

      {emptyWarningToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-600 text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-shake border border-rose-400">
          <span>⚠️ Bạn chưa chọn món nào! Hãy bấm QUAY CHỌN MÓN trước nhé.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-amber-200/60 shadow-sm hover:bg-amber-100/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-stone-800 flex items-center gap-1.5">
              🍻 Vòng Quay Chọn Món Tại Quán
            </h1>
            <p className="text-xs text-stone-500">Quay gọi món chầu nhậu / tiệc nhóm ({dishes.length} món sẵn sàng)</p>
          </div>
        </div>
      </div>

      {/* Winner Popup Banner */}
      {lastWonDish && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl animate-bounce-short flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider block w-max mb-1">
              🎉 Vừa quay trúng:
            </span>
            <p className="font-extrabold text-base">{lastWonDish.name}</p>
            <p className="text-xs text-emerald-100 font-semibold">
              {lastWonDish.priceVND ? `${lastWonDish.priceVND.toLocaleString('vi-VN')}đ` : 'Theo giá menu'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white text-emerald-800 shadow-sm">
              +{selectedDishes.length} món đã chọn
            </span>
          </div>
        </div>
      )}

      {/* Spin Wheel Area */}
      <div className="relative w-[300px] h-[300px] mx-auto my-6">
        {/* Pointer */}
        <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-600 z-30 drop-shadow-md"></div>

        {/* Wheel Disc */}
        <div
          className="w-full h-full rounded-full border-8 border-white shadow-2xl relative overflow-hidden bg-amber-100/60"
          style={{
            background: dishes.length > 0
              ? `conic-gradient(${dishes.map((_, i) => {
                  const colors = ['#ff6b6b', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
                  const start = (i * 360) / dishes.length;
                  const end = ((i + 1) * 360) / dishes.length;
                  return `${colors[i % colors.length]} ${start}deg ${end}deg`;
                }).join(', ')})`
              : '#e5e7eb',
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.85, 0.35, 1.05)' : 'none'
          }}
        >
          {/* Wheel Labels */}
          {dishes.map((dish, i) => {
            const sliceAngle = 360 / dishes.length;
            const rotationAngle = (i * sliceAngle) + (sliceAngle / 2) - 90;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 origin-top-left text-white font-extrabold text-[11px] drop-shadow-md pointer-events-none w-[120px] text-right pr-4 line-clamp-1"
                style={{ transform: `rotate(${rotationAngle}deg) translateY(-50%)` }}
              >
                {dish.name}
              </div>
            );
          })}
        </div>

        {/* Wheel Center Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-amber-500 shadow-xl flex flex-col items-center justify-center font-black text-xs text-amber-700 hover:scale-105 active:scale-95 transition-all z-20"
        >
          <Dices className={`w-6 h-6 text-amber-600 ${isSpinning ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-extrabold uppercase">QUAY</span>
        </button>
      </div>

      {/* Main Spin Action Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mb-6"
      >
        <Dices className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
        {isSpinning ? 'Đang quay chọn món...' : '🎯 QUAY CHỌN MÓN TIẾP TEO!'}
      </button>

      {/* Selected Dishes Order Board (Bàn Ăn / Món Đã Chọn) */}
      <div className="p-4 rounded-3xl bg-white border border-amber-200 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h3 className="font-extrabold text-sm text-stone-800 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600" />
            Danh Sách Món Đã Chọn ({selectedDishes.length})
          </h3>
          {selectedDishes.length > 0 && (
            <button
              onClick={() => setSelectedDishes([])}
              className="text-[11px] font-bold text-stone-400 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Xóa hết
            </button>
          )}
        </div>

        {selectedDishes.length === 0 ? (
          <div className="py-6 text-center text-stone-400 text-xs flex flex-col items-center gap-1.5">
            <Utensils className="w-8 h-8 text-amber-300 stroke-1" />
            <p className="font-medium">Chưa có món nào được chọn.</p>
            <p className="text-[11px] text-stone-400">Bấm <b>QUAY CHỌN MÓN TIẾP TEO</b> để AI gắp món lên bàn ăn!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDishes.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-stone-800">{item.name}</p>
                    {item.subDishes && item.subDishes.length > 0 && (
                      <p className="text-[10px] text-stone-500 line-clamp-1">Gồm: {item.subDishes.join(', ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-amber-900">
                    {item.priceVND ? `${item.priceVND.toLocaleString('vi-VN')}đ` : ''}
                  </span>
                  <button
                    onClick={() => handleRemoveSelectedDish(idx)}
                    className="p-1 text-stone-400 hover:text-rose-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Total Bill Counter */}
            <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-600 flex items-center gap-1">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Tổng tiền dự tính ({selectedDishes.length} món):
              </span>
              <span className="font-black text-sm text-emerald-700">
                {totalBill.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={handleConfirmOrder}
          className="py-3.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          Chốt Danh Sách Món
        </button>
        <button
          onClick={handleCopyOrderSummary}
          className="py-3.5 px-3 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-100 transition-colors shadow-xs"
        >
          <Share2 className="w-4 h-4 text-amber-600" />
          Gửi Nhóm Bạn Nhậu
        </button>
      </div>

      {/* BEAUTIFUL ORDER CONFIRMATION RECEIPT MODAL */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-amber-100 overflow-hidden relative animate-scale-up">

            {/* Top Pattern Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white relative">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Phiếu Đặt Món AI Roulette
                </span>
              </div>
              <h2 className="text-xl font-black">🎉 BÀN ĂN ĐÃ CHỐT!</h2>
              <p className="text-xs text-amber-100">Danh sách món ăn vừa được gắp từ vòng quay</p>
            </div>

            {/* Receipt Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

              {/* People Count Selector */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/70 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" /> Số người đi ăn cùng:
                </span>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPeopleCount(num)}
                      className={`w-6 h-6 rounded-full font-bold text-xs transition-all ${
                        peopleCount === num
                          ? 'bg-amber-600 text-white shadow-sm scale-110'
                          : 'bg-white text-stone-600 border border-stone-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Itemized Receipt Table */}
              <div className="border border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50/50 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between font-sans font-extrabold text-stone-700 border-b border-stone-200 pb-2">
                  <span>Tên món ({selectedDishes.length})</span>
                  <span>Thành tiền</span>
                </div>

                {selectedDishes.map((dish, i) => (
                  <div key={i} className="flex justify-between items-start text-stone-700">
                    <span className="font-sans font-medium max-w-[180px] line-clamp-1">
                      {i + 1}. {dish.name}
                    </span>
                    <span className="font-bold text-stone-900">
                      {dish.priceVND ? `${dish.priceVND.toLocaleString('vi-VN')}đ` : 'Theo menu'}
                    </span>
                  </div>
                ))}

                {/* Total & Per Person Split */}
                <div className="border-t border-dashed border-stone-300 pt-3 font-sans space-y-1">
                  <div className="flex justify-between items-center font-black text-sm text-stone-800">
                    <span>TỔNG CỘNG:</span>
                    <span className="text-emerald-600 text-base">{totalBill.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
                    <span>Dự tính mỗi người ({peopleCount} người):</span>
                    <span className="font-extrabold text-amber-700">
                      ~{Math.round(totalBill / peopleCount).toLocaleString('vi-VN')}đ / người
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col gap-2">
              <button
                onClick={handleCopyOrderSummary}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 hover:shadow-lg active:scale-[0.99] transition-all"
              >
                <Copy className="w-4 h-4" />
                Sao Chép Danh Sách Gửi Zalo/Mess
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors"
                >
                  Quay Tiếp Món Khác
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-2.5 px-3 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-black transition-colors flex items-center justify-center gap-1"
                >
                  <Home className="w-3.5 h-3.5 text-amber-400" />
                  Về Trang Chủ
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MenuDishSpinWheel;
