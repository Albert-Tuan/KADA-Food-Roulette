import { create } from 'zustand';
import type { Restaurant, SpinFilters } from '../features/spin/types';

interface SpinState {
  filters: SpinFilters;
  candidates: Restaurant[];
  customCandidates: Restaurant[];
  currentResult: Restaurant | null;
  luckySpinCount: number;
  checkedInRestaurantIds: string[];
  setFilters: (filters: Partial<SpinFilters>) => void;
  addCustomCandidate: (item: string | { name: string; category?: string; imageUrl?: string }) => void;
  removeCustomCandidate: (id: string) => void;
  setCurrentResult: (restaurant: Restaurant | null) => void;
  grantLuckySpin: () => void;
  consumeLuckySpin: () => void;
  markCheckedIn: (id: string) => void;
  isCheckedIn: (id: string) => boolean;
  spin: (index?: number) => void;
  resetStore: () => void;
}

const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Phở Hòa Pasteur', category: 'Phở', rating: 4.8, totalReviews: 1200, distance: 800, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=400', dietary: ['Không cay'] },
  { id: '2', name: 'Cơm Tấm Ba Ghiền', category: 'Cơm tấm', rating: 4.6, totalReviews: 3400, distance: 1200, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=400', dietary: ['Không hành'] },
  { id: '3', name: 'Bún Chả Hà Nội', category: 'Bún chả', rating: 4.5, totalReviews: 890, distance: 450, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=400', dietary: [] },
  { id: '4', name: 'Pizza 4P\'s', category: 'Pizza', rating: 4.9, totalReviews: 5000, distance: 2500, priceLevel: 4, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400', dietary: ['Chay'] },
  { id: '5', name: 'Gyu-Kaku BBQ', category: 'BBQ', rating: 4.7, totalReviews: 1100, distance: 3000, priceLevel: 3, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400', dietary: ['Low Carb'] },
  { id: '6', name: 'Bánh Mì Huỳnh Hoa', category: 'Bánh mì', rating: 4.8, totalReviews: 4500, distance: 1500, priceLevel: 1, imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=400', dietary: ['Không cay'] },
];

const applyFilters = (filters: SpinFilters, custom: Restaurant[]) => {
  const filtered = MOCK_RESTAURANTS.filter(r => {
    if (r.distance > filters.maxDistance) return false;
    if (r.priceLevel > filters.maxPrice) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(r.category)) return false;
    if (filters.dietary.length > 0) {
      const hasAllDietary = filters.dietary.every(d => r.dietary?.includes(d));
      if (!hasAllDietary) return false;
    }
    return true;
  });
  return [...filtered, ...custom];
};

export const useSpinStore = create<SpinState>((set, get) => ({
  filters: {
    maxDistance: 5000,
    maxPrice: 4,
    categories: [],
    dietary: [],
  },
  customCandidates: [],
  candidates: MOCK_RESTAURANTS,
  currentResult: null,
  luckySpinCount: 1,
  checkedInRestaurantIds: [],

  grantLuckySpin: () => set((state) => ({ luckySpinCount: state.luckySpinCount + 1 })),
  consumeLuckySpin: () => set((state) => ({ luckySpinCount: Math.max(0, state.luckySpinCount - 1) })),
  markCheckedIn: (id) => set((state) => {
    if (state.checkedInRestaurantIds.includes(id)) return state;
    return { checkedInRestaurantIds: [...state.checkedInRestaurantIds, id] };
  }),
  isCheckedIn: (id) => get().checkedInRestaurantIds.includes(id),

  setFilters: (newFilters) => set((state) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    return {
      filters: updatedFilters,
      candidates: applyFilters(updatedFilters, state.customCandidates),
    };
  }),

  addCustomCandidate: (item) => set((state) => {
    let candidateName = 'Món ăn';
    let category = 'Tự chọn';
    let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';

    if (typeof item === 'string') {
      candidateName = item;
    } else if (item && typeof item === 'object') {
      candidateName = typeof item.name === 'string' ? item.name : String((item as any).name || 'Món ăn');
      if ((item as any).category) category = (item as any).category;
      if ((item as any).imageUrl) imageUrl = (item as any).imageUrl;
    }

    const newCustom: Restaurant = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: candidateName,
      category,
      rating: 5.0,
      totalReviews: 1,
      distance: 0,
      priceLevel: 1,
      imageUrl,
    };
    const newCustoms = [...state.customCandidates, newCustom];
    return {
      customCandidates: newCustoms,
      candidates: applyFilters(state.filters, newCustoms),
    };
  }),

  removeCustomCandidate: (id) => set((state) => {
    const newCustoms = state.customCandidates.filter(c => c.id !== id);
    return {
      customCandidates: newCustoms,
      candidates: applyFilters(state.filters, newCustoms),
    };
  }),

  setCurrentResult: (result) => set({ currentResult: result }),

  spin: (index?: number) => {
    const { candidates } = get();
    if (candidates.length === 0) return;
    const winnerIndex = index !== undefined ? index : Math.floor(Math.random() * candidates.length);
    set({ currentResult: candidates[winnerIndex] });
  },

  resetStore: () => set((state) => ({
    customCandidates: [],
    candidates: applyFilters(state.filters, []),
  })),
}));
