import { create } from 'zustand';
import type { Restaurant, SpinFilters } from '../features/spin/types';
import { restaurantApi } from '../api/endpoints/restaurants';
import { rouletteApi } from '../api/endpoints/roulette';
import { mapBackendRestaurantToSpinCandidate } from '../features/spin/utils/mapper';

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
  fetchNearbyCandidates: (lat: number, lng: number) => Promise<void>;
  markCheckedIn: (id: string) => void;
  isCheckedIn: (id: string) => boolean;
  spin: (lat?: number, lng?: number) => Promise<void>;
  resetStore: () => void;
}

const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Bún đậu Tiến Hải', category: 'Món Việt', rating: 4.5, totalReviews: 320, distance: 1500, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', dietary: ['Ăn mặn'] },
  { id: '2', name: 'Bún chả Hương Liên', category: 'Món Việt', rating: 4.8, totalReviews: 512, distance: 2000, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea264eb?w=400', dietary: ['Ăn mặn'] },
  { id: '3', name: 'Pizza 4P\'s', category: 'Ý', rating: 4.9, totalReviews: 1024, distance: 3000, priceLevel: 4, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', dietary: ['Ăn chay', 'Ăn mặn'] },
  { id: '4', name: 'Gogi House', category: 'Hàn Quốc', rating: 4.6, totalReviews: 856, distance: 1200, priceLevel: 3, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', dietary: ['Ăn mặn'] },
  { id: '5', name: 'Phở Hòa', category: 'Món Việt', rating: 4.7, totalReviews: 450, distance: 500, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=400', dietary: ['Ăn mặn'] },
  { id: '6', name: 'Haidilao', category: 'Lẩu', rating: 4.9, totalReviews: 2000, distance: 4000, priceLevel: 4, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb431?w=400', dietary: ['Ăn mặn', 'Ăn chay'] },
  { id: '7', name: 'Cơm tấm Ba Ghiền', category: 'Món Việt', rating: 4.4, totalReviews: 300, distance: 2500, priceLevel: 1, imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea264eb?w=400', dietary: ['Ăn mặn'] },
  { id: '8', name: 'Trà sữa KOI', category: 'Đồ uống', rating: 4.8, totalReviews: 900, distance: 800, priceLevel: 2, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', dietary: ['Ăn chay'] },
];

let API_CANDIDATES: Restaurant[] = [...MOCK_RESTAURANTS];

const applyFilters = (filters: SpinFilters, custom: Restaurant[], apiData: Restaurant[]) => {
  const filtered = apiData.filter(r => {
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
  candidates: [],
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
      candidates: applyFilters(updatedFilters, state.customCandidates, API_CANDIDATES),
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
      candidates: applyFilters(state.filters, newCustoms, API_CANDIDATES),
    };
  }),

  removeCustomCandidate: (id) => set((state) => {
    const newCustoms = state.customCandidates.filter(c => c.id !== id);
    return {
      customCandidates: newCustoms,
      candidates: applyFilters(state.filters, newCustoms, API_CANDIDATES),
    };
  }),

  setCurrentResult: (result) => set({ currentResult: result }),

  fetchNearbyCandidates: async (lat: number, lng: number) => {
    try {
      // Simulate network delay for Mock Data
      await new Promise(resolve => setTimeout(resolve, 800));
      API_CANDIDATES = [...MOCK_RESTAURANTS];
      set((state) => ({
        candidates: applyFilters(state.filters, state.customCandidates, API_CANDIDATES)
      }));
    } catch (error) {
      console.error('Failed to fetch nearby restaurants:', error);
    }
  },

  spin: async (lat?: number, lng?: number) => {
    const { candidates } = get();
    if (candidates.length === 0) return;
    
    // Fallback to local random (Mock spin)
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    set({ 
      currentResult: candidates[winnerIndex],
      checkedInRestaurantIds: [] // Reset check-in lock for the new spin
    });
  },

  resetStore: () => set((state) => ({
    customCandidates: [],
    candidates: applyFilters(state.filters, [], API_CANDIDATES),
  })),
}));
