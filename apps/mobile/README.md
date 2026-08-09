# Food Roulette - Mobile App

> *"Không biết ăn gì? Để vòng quyết định."*

Mobile app (React Native + Expo) giúp người Việt chọn quán ăn ngẫu nhiên bằng vòng quay.

---

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Expo SDK 52 + Expo Router |
| Language | TypeScript |
| Styling | NativeWind (Tailwind cho React Native) |
| Animation | Reanimated 3 |
| State | Zustand + TanStack Query |
| Camera | expo-camera + expo-image-manipulator |
| GPS | expo-location |
| HTTP | Axios |
| Design | Earthy/warm-light-first |

---

## Cấu trúc dự án

```
apps/mobile/
├── app/                         # Expo Router pages
│   ├── _layout.tsx             # Root layout
│   ├── +not-found.tsx          # 404 page
│   ├── auth/                   # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── locket/                 # Locket screens
│   │   ├── capture.tsx
│   │   └── [id].tsx
│   ├── profile/                # Chỉnh sửa và cài đặt profile
│   ├── u/[public_id].tsx       # Profile công khai
│   ├── restaurant/              # Restaurant screens
│   │   └── [id].tsx
│   └── (tabs)/                 # Tab navigation
│       ├── _layout.tsx         # Tab layout
│       ├── index.tsx           # Home
│       ├── spin.tsx            # Spin/Roulette
│       ├── lockets.tsx         # Locket feed
│       └── profile.tsx         # Profile
│
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── client.ts           # Axios instance
│   │   ├── endpoints/          # API endpoint definitions
│   │   │   ├── auth.ts
│   │   │   ├── roulette.ts
│   │   │   ├── restaurants.ts
│   │   │   ├── groups.ts
│   │   │   ├── lockets.ts
│   │   │   └── preferences.ts
│   │   └── index.ts
│   ├── lib/                    # Utils & constants
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   ├── features/               # Locket/Profile modules và mock repositories
│   └── stores/                 # Zustand stores
│       ├── authStore.ts
│       └── index.ts
│
├── app.json                   # Expo config
├── babel.config.js            # Babel config
├── global.css                 # NativeWind entry stylesheet
├── metro.config.js            # Metro bundler config
├── tailwind.config.js         # NativeWind config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## Bắt đầu

### Yêu cầu

- Node.js 18+
- npm hoặc yarn
- Xcode (cho iOS) / Android Studio (cho Android) - tùy platform

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Run on device/simulator
# iOS:
npx expo run:ios
# Android:
npx expo run:android
# Hoặc development server:
npx expo start
```

### Environment Variables

Tạo `.env` trong thư mục `apps/mobile/`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Screens

### Tab Navigation
| Screen | Route | Mô tả |
|--------|-------|--------|
| Home | `(tabs)/index.tsx` | Trang chủ, giới thiệu app |
| Spin | `(tabs)/spin.tsx` | Quay bánh xe chọn quán |
| Lockets | `(tabs)/lockets.tsx` | Feed hình ảnh món ăn |
| Profile | `(tabs)/profile.tsx` | Trang cá nhân |

### Auth Screens
| Screen | Route | Mô tả |
|--------|-------|--------|
| Login | `auth/login.tsx` | Đăng nhập |
| Register | `auth/register.tsx` | Đăng ký |

### Feature Screens
| Screen | Route | Mô tả |
|--------|-------|--------|
| Capture | `locket/capture.tsx` | Chụp ảnh locket |
| Locket detail | `locket/[id].tsx` | Chi tiết locket |
| Edit profile | `profile/edit.tsx` | Chỉnh sửa hồ sơ |
| Settings | `profile/settings.tsx` | Cài đặt profile |
| Public profile | `u/[public_id].tsx` | Profile công khai |
| Restaurant | `restaurant/[id].tsx` | Chi tiết quán ăn |

---

## API Integration

Mobile app kết nối với backend qua API:

```typescript
// API Client (src/api/client.ts)
import axios from 'axios';
import { API_URL } from '@/lib/constants';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptors for auth token
apiClient.interceptors.request.use((config) => {
  const token = getToken(); // from secure storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**Base URL:** `http://localhost:3001/api` (development)

---

## Design System

### Colors (từ brand/brand.md)

```javascript
// Primary - Earthy/Warm
primary: '#C4785A'      // Terracotta
primaryDark: '#8B5A3C'

// Secondary - Warm tones
secondary: '#F5E6D3'    // Cream
secondaryDark: '#E8D4C4'

// Background
background: '#FFFBF5'   // Warm white

// Text
textPrimary: '#2D2A26'
textSecondary: '#6B6560'
```

### Typography

```javascript
// Font: Sử dụng system font
// iOS: San Francisco
// Android: Roboto
```

---

## Feature Checklist (MVP v1.0)

- [x] Auth (Login/Register)
- [x] Tab Navigation
- [ ] Home Screen
- [ ] Spin/Roulette Screen
- [x] Locket Feed (mock repository)
- [x] Locket Capture (mock repository)
- [x] Profile Screen (mock repository)
- [ ] Restaurant Detail

---

## Related Documentation

| File | Mô tả |
|------|--------|
| `CLAUDE.md` | Entry point cho AI |
| `brand/brand.md` | Brand kit (màu, font, tone) |
| `brand/prompts.md` | Master prompt |
| `VIBE_RULES.md` | Golden rules |

---

*Food Roulette Team · 2026-08-08*
