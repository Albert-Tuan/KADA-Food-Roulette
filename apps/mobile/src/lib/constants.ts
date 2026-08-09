// App constants

export const APP_NAME = 'Food Roulette';
export const APP_TAGLINE = 'Không biết ăn gì? Để vòng quyết định.';

// API
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 10000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Roulette
export const SPIN_DURATION_MS = 5000;
export const SPIN_MIN_DURATION_MS = 2000;

// Group
export const MAX_GROUP_MEMBERS = 20;
export const VOTE_TIMEOUT_MINUTES = 5;

// Check-in
export const CHECKIN_TIMEOUT_MINUTES = 15;
export const CHECKIN_MAX_DISTANCE_METERS = 100;

// Locket
export const LOCKET_TIMESTAMP_TOLERANCE_SECONDS = 60;
export const MAX_CAPTION_LENGTH = 280;
export const MAX_IMAGE_SIZE_MB = 10;

// Rewards
export const XP_PER_SPIN = 10;
export const XP_PER_CHECKIN = 20;
export const XP_PER_REVIEW = 15;
export const COINS_PER_STREAK = 5;
export const STREAK_BONUS_DAYS = 7;

// Categories
export const FOOD_CATEGORIES = [
  { value: 'com', label: 'Cơm' },
  { value: 'bun', label: 'Bún' },
  { value: 'pho', label: 'Phở' },
  { value: 'mi', label: 'Mì' },
  { value: 'banh', label: 'Bánh' },
  { value: 'nuoc', label: 'Nước' },
  { value: 'tra', label: 'Trà' },
  { value: 'cafe', label: 'Cà Phê' },
  { value: 'monchay', label: 'Món Chay' },
  { value: 'monnuoc', label: 'Món Nước' },
  { value: 'anquat', label: 'Ăn Quán' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'doannhanh', label: 'Đồ Ăn Nhanh' },
  { value: 'khac', label: 'Khác' },
] as const;

export const PRICE_LEVELS = [
  { value: 1, label: 'Bình dân (dưới 50k)' },
  { value: 2, label: 'Trung bình (50k - 150k)' },
  { value: 3, label: 'Hơi sang (150k - 300k)' },
  { value: 4, label: 'Sang trọng (trên 300k)' },
] as const;

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user-storage',
  ONBOARDING: 'onboarding-complete',
} as const;
