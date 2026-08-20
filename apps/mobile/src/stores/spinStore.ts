import { create } from 'zustand';
import type { Restaurant, SpinFilters } from '../features/spin/types';
import { restaurantApi } from '../api/endpoints/restaurants';
import { rouletteApi } from '../api/endpoints/roulette';
import { mapBackendRestaurantToSpinCandidate } from '../features/spin/utils/mapper';

interface SpinState {
  filters: SpinFilters;
  baseCandidates: Restaurant[];
  candidates: Restaurant[];
  customCandidates: Restaurant[];
  currentResult: Restaurant | null;
  luckySpinCount: number;
  checkedInRestaurantIds: string[];
  setFilters: (filters: Partial<SpinFilters>) => void;
  setCandidates: (items: Restaurant[]) => void;
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



const getPriceLevel = (priceVND: number) => {
  if (priceVND <= 100000) return 1;
  if (priceVND <= 300000) return 2;
  if (priceVND <= 500000) return 3;
  return 4;
};

const applyFilters = (filters: SpinFilters, base: Restaurant[], custom: Restaurant[]) => {
  const filtered = base.filter(r => {
    if (r.distance > filters.maxDistance) return false;
    const maxAllowedLevel = getPriceLevel(filters.maxPriceVND);
    if (r.priceLevel > maxAllowedLevel) return false;
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
    maxPriceVND: 1000000,
    categories: [],
    dietary: [],
  },
  customCandidates: [],
  baseCandidates: [],
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
      candidates: applyFilters(updatedFilters, state.baseCandidates, state.customCandidates),
    };
  }),

  setCandidates: (items) => set((state) => ({
    baseCandidates: items,
    candidates: applyFilters(state.filters, items, state.customCandidates),
  })),

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
      candidates: applyFilters(state.filters, state.baseCandidates, newCustoms),
    };
  }),

  removeCustomCandidate: (id) => set((state) => {
    const newCustoms = state.customCandidates.filter(c => c.id !== id);
    return {
      customCandidates: newCustoms,
      candidates: applyFilters(state.filters, state.baseCandidates, newCustoms),
    };
  }),

  setCurrentResult: (result) => set({ currentResult: result }),

  fetchNearbyCandidates: async (lat: number, lng: number) => {
    try {
      const state = get();
      // Radius from filters is in meters, API expects km
      const radiusKm = state.filters.maxDistance / 1000;
      const backendRestaurants = await restaurantApi.nearby(lat, lng, radiusKm);
      const newBaseCandidates = backendRestaurants.map(mapBackendRestaurantToSpinCandidate);
      
      set({
        baseCandidates: newBaseCandidates,
        candidates: applyFilters(state.filters, newBaseCandidates, state.customCandidates)
      });
    } catch (error) {
      console.error('Failed to fetch nearby restaurants:', error);
      throw error;
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
    candidates: applyFilters(state.filters, state.baseCandidates, []),
  })),
}));
