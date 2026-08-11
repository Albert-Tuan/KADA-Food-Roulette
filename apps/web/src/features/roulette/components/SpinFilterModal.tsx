import React, { useState, useEffect } from 'react';
import { useSpinStore } from '../../../stores/spinStore';

interface SpinFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CUISINES = ['Phở', 'Cơm tấm', 'Bún chả', 'Pizza', 'BBQ', 'Bánh mì', 'Lẩu', 'Ốc', 'Ăn vặt', 'Món Hàn'];
const DIETARY_TAGS = ['Chay', 'Không cay', 'Không hành', 'Low Carb', 'Ăn kiêng'];

const SpinFilterModal: React.FC<SpinFilterModalProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, customCandidates, addCustomCandidate, removeCustomCandidate } = useSpinStore();

  const [localDistance, setLocalDistance] = useState(filters.maxDistance);
  const [localPrice, setLocalPrice] = useState(filters.maxPrice);
  const [localCategories, setLocalCategories] = useState<string[]>(filters.categories);
  const [localDietary, setLocalDietary] = useState<string[]>(filters.dietary);
  const [newCustomFood, setNewCustomFood] = useState('');

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setLocalDistance(filters.maxDistance);
      setLocalPrice(filters.maxPrice);
      setLocalCategories(filters.categories);
      setLocalDietary(filters.dietary);
    }
  }, [isOpen, filters]);

  const toggleCategory = (cat: string) => {
    if (localCategories.includes(cat)) {
      setLocalCategories(localCategories.filter(c => c !== cat));
    } else {
      setLocalCategories([...localCategories, cat]);
    }
  };

  const toggleDietary = (tag: string) => {
    if (localDietary.includes(tag)) {
      setLocalDietary(localDietary.filter(t => t !== tag));
    } else {
      setLocalDietary([...localDietary, tag]);
    }
  };

  const applyFilters = () => {
    if (newCustomFood.trim()) {
      addCustomCandidate(newCustomFood.trim());
      setNewCustomFood('');
    }
    setFilters({
      maxDistance: localDistance,
      maxPrice: localPrice,
      categories: localCategories,
      dietary: localDietary
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="bg-surface w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl p-6 md:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md text-headline-md text-on-surface">Bộ Lọc Vòng Quay</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Distance Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-strong text-label-strong text-on-surface">Khoảng cách</label>
              <span className="font-body-md text-body-md text-primary font-bold">{localDistance / 1000} km</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={localDistance}
              onChange={(e) => setLocalDistance(Number(e.target.value))}
              className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-on-surface-variant mt-2">
              <span>0.5 km</span>
              <span>10 km</span>
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-strong text-label-strong text-on-surface">Mức giá</label>
              <span className="font-body-md text-body-md text-primary font-bold">
                {Array(localPrice).fill('$').join('')}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(level => (
                <button
                  key={level}
                  onClick={() => setLocalPrice(level)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${localPrice >= level ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {Array(level).fill('$').join('')}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisine Categories */}
          <div>
            <label className="font-label-strong text-label-strong text-on-surface block mb-3">Thể loại món ăn</label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    localCategories.includes(cat)
                      ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-sm'
                      : 'bg-surface-white text-on-surface border-subtle-gray hover:border-outline'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Filter */}
          <div>
            <label className="font-label-strong text-label-strong text-on-surface block mb-3">Khẩu vị / Dị ứng</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleDietary(tag)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1 ${
                    localDietary.includes(tag)
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant border-subtle-gray hover:border-outline'
                  }`}
                >
                  {localDietary.includes(tag) && <span className="material-symbols-outlined text-[16px]">check</span>}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Food Addition */}
          <div>
            <label className="font-label-strong text-label-strong text-on-surface block mb-3">Thêm món ăn tự chọn</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Nhập tên món (VD: Cơm rang...)"
                className="flex-1 bg-surface-container-lowest border border-subtle-gray rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                value={newCustomFood}
                onChange={(e) => setNewCustomFood(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCustomFood.trim()) {
                    addCustomCandidate(newCustomFood.trim());
                    setNewCustomFood('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newCustomFood.trim()) {
                    addCustomCandidate(newCustomFood.trim());
                    setNewCustomFood('');
                  }
                }}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-strong text-sm shadow-sm hover:brightness-110 active:brightness-95 transition-all"
              >
                Thêm
              </button>
            </div>

            {customCandidates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customCandidates.map(c => (
                  <div key={c.id} className="flex items-center gap-1 bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full text-sm font-label-strong">
                    <span>{c.name}</span>
                    <span
                      className="material-symbols-outlined text-[16px] cursor-pointer hover:text-primary transition-colors"
                      onClick={() => removeCustomCandidate(c.id)}
                    >
                      close
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              setLocalDistance(5000);
              setLocalPrice(4);
              setLocalCategories([]);
              setLocalDietary([]);
              customCandidates.forEach(c => removeCustomCandidate(c.id));
            }}
            className="flex-1 py-4 font-label-strong rounded-2xl bg-surface-variant text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Đặt Lại
          </button>
          <button
            onClick={applyFilters}
            className="flex-[2] py-4 font-label-strong rounded-2xl bg-primary text-on-primary shadow-md hover:bg-surface-tint transition-all active:translate-y-1"
          >
            Áp Dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinFilterModal;
