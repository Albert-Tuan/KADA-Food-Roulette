# PROGRESS.md

> **Theo dõi tiến độ implementation Food Roulette**
> **Version:** 2.1 · **Date:** 2026-08-09
> **Based on:** `brand/FOOD-ROULETTE-SITEMAP.md` v2.4

---

## Tổng quan

| Module | Status | Owner | Notes |
|--------|--------|-------|-------|
| Project Setup | ✅ Done | Tuấn Anh | Express.js, Expo, Vite, Prisma, Docker |
| Brand & Docs | ✅ Done | Tuấn Anh | prompts.md, brand.md, sitemap, ERD |
| Database | ✅ Done | Tuấn Anh | Schema v5.0, 15 tables, migrations, seed |
| Backend (Core) | ✅ Done | Tuấn Anh | Auth, middleware, services |
| Backend (API) | ✅ Done | Trường | All modules implemented |
| Mobile App | 🟡 In Progress | Hoàng Hiếu + Gia Bình | UI done, animation pending |
| Web App | 🟡 In Progress | Hoàng Hiếu | Components done, routing pending |
| Landing Page | ❌ Not Started | - | Full landing page needed |
| CI/CD | ✅ Done | Thành Nam | GitHub Actions, EAS Build |

---

## v1.0 MVP Scope

| Feature | Backend | Mobile | Web | Status |
|---------|---------|--------|-----|--------|
| **Auth (email + Google)** | ✅ | ✅ | ✅ | ✅ Done |
| **Onboarding** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Spin cá nhân** | ✅ | ✅ | ✅ | ✅ Done |
| **Spin Wallet** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Group spin (max 20, vote)** | ✅ | 🟡 | ✅ | 🟡 Partial |
| **Locket capture (camera-only)** | ✅ | ✅ | N/A | ✅ Done |
| **Locket feed** | ✅ | ✅ | ✅ | ✅ Done |
| **Taste Board** | ✅ | ❌ | ✅ | 🟡 Partial |
| **Profile công khai** | ✅ | ✅ | ✅ | ✅ Done |
| **Thêm quán (user-submitted)** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Steward dashboard** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Google Places lookup** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Restaurant Partner (B2B)** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Corporate Account (B2B)** | ✅ | ❌ | ❌ | 🟡 Partial |
| **Landing page** | N/A | N/A | ❌ | ❌ Not Started |
| **Chính sách bảo mật** | N/A | ❌ | ❌ | ❌ Not Started |
| **Điều khoản sử dụng** | N/A | ❌ | ❌ | ❌ Not Started |

---

## Backend (Trường)

### Đã xong ✅

| Module | Files | Owner |
|--------|-------|-------|
| **Auth** | `auth.controller.ts`, `auth.routes.ts` | Tuấn Anh |
| **Roulette** | `roulette.controller.ts`, `roulette.routes.ts` | Trường |
| **Groups** | `groups.controller.ts`, `groups.routes.ts` | Trường |
| **Restaurants** | `restaurants.controller.ts`, `restaurants.routes.ts` | Trường |
| **Lockets** | `lockets.controller.ts`, `lockets.routes.ts` | Trường |
| **Preferences** | `preferences.controller.ts`, `preferences.service.ts` | Trường |
| **Menu** | `menu.controller.ts`, `menu.service.ts`, `menu.routes.ts` | Trường |
| **Circle** | `circle.controller.ts`, `circle.service.ts`, `circle.routes.ts` | Trường |
| **Steward** | `steward.controller.ts`, `steward.routes.ts` | Trường |

### Shared Services ✅
- `ocr.service.ts` — Tesseract OCR wrapper
- `menuParser.service.ts` — Vietnamese menu parser
- `preferenceLearner.service.ts` — User preference learning

### Đang làm 🟡
- [ ] API integration testing
- [ ] Error handling edge cases
- [ ] API documentation (OpenAPI)

### Còn lại ⬜
- [ ] Check-in API (GPS verification)
- [ ] Real-time notifications (WebSocket)
- [ ] Payment integration (Spin Packs)
- [ ] Full-text search (MySQL FULLTEXT)

---

## Mobile App (Hoàng Hiếu + Gia Bình)

### Đã xong ✅

| Screen | File | Owner |
|--------|------|-------|
| Root Layout | `app/_layout.tsx` | Tuấn Anh |
| Tab Navigation | `app/(tabs)/_layout.tsx` | Hoàng Hiếu |
| Home | `app/(tabs)/index.tsx` | Hoàng Hiếu |
| Spin | `app/(tabs)/spin.tsx` | Hoàng Hiếu |
| Lockets Feed | `app/(tabs)/lockets.tsx` | Hoàng Hiếu |
| Profile | `app/(tabs)/profile.tsx` | Hoàng Hiếu |
| Login | `app/auth/login.tsx` | Hoàng Hiếu |
| Register | `app/auth/register.tsx` | Hoàng Hiếu |
| Locket Capture | `app/locket/capture.tsx` | Hoàng Hiếu + Gia Bình |
| Restaurant Detail | `app/restaurant/[id].tsx` | Hoàng Hiếu |

### Infrastructure ✅
- Expo SDK 52 + Expo Router
- NativeWind v4 configuration
- API client (`src/api/client.ts`)
- API endpoints (`src/api/endpoints/*`)
- Zustand stores (`src/stores/authStore.ts`)

### Đang làm 🟡
- [ ] Spin wheel animation (Reanimated 3)
- [ ] Onboarding flow

### Còn lại ⬜
- [ ] Onboarding screens (4-5 screens)
- [ ] Group spin flow UI
- [ ] Taste Board management UI
- [ ] Review writing UI
- [ ] Menu capture UI
- [ ] AI suggestion UI
- [ ] Push notification setup
- [ ] Spin Shop UI
- [ ] Spin Wallet UI

### Blockers
- Need assets: `assets/icon.png`, `assets/splash.png`
- Need design tokens from `brand/brand.md`

---

## Web App (Hoàng Hiếu)

### Đã xong ✅

| Feature | Components |
|---------|------------|
| **Auth** | `LoginPage.tsx`, `RegisterPage.tsx` |
| **Roulette** | `LuckySpinWheel.tsx`, `SpinResult.tsx`, `MysteryBoxReveal.tsx`, `HomeSpinRewards.tsx` |
| **Groups** | `GroupSpinWhoSpins.tsx`, `GroupVoteResult.tsx`, `GroupVoteVeto.tsx`, `GroupCheckInVerification.tsx`, `GroupCheckInCompleteRewards.tsx`, `CircleAiSuggestionCard.tsx` |
| **Lockets** | `LocketFeed.tsx`, `ShareYourHarvestSuccess.tsx` |
| **Profile** | `PreferencesScreen.tsx`, `ProfileTasteProfile.tsx`, `StreakDashboard.tsx` |
| **Restaurants** | `NearbyRestaurantsMapView.tsx`, `NearbyRestaurantsLeaderboard.tsx`, `FriendsLeaderboardDetail.tsx`, `KhCCommitment.tsx` |
| **Check-in** | `WriteReview.tsx`, `CheckInVerification.tsx`, `CheckInCompleteRewards.tsx`, `ReviewSubmitted.tsx` |
| **Menu** | `MenuCaptureScreen.tsx`, `MenuReviewScreen.tsx` |
| **Rewards** | `SeasonGarden.tsx`, `EnhancedSeasonGardenProgress.tsx` |
| **Layout** | `MainLayout.tsx` |

### Đang làm 🟡
- [ ] Page routing setup (React Router)
- [ ] API hooks (TanStack Query)
- [ ] State integration

### Còn lại ⬜
- [ ] Landing page (full)
- [ ] Onboarding flow
- [ ] Spin Shop page
- [ ] Spin Wallet page
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Real-time group spin

---

## Database (Tuấn Anh)

### Đã xong ✅
- [x] Schema v5.0 (15 tables)
- [x] Migrations + seed data
- [x] ERD v5.0 reviewed
- [x] Performance indexes
- [x] Validation constraints
- [x] Docker MySQL setup
- [x] 6 validation SQL scripts
- [x] 5 query test scripts

### Tables
| Table | Purpose |
|-------|---------|
| `User` | Auth, profile, preferences |
| `Friendship` | Social (mutual opt-in) |
| `Group` | Group spin (max 20) |
| `GroupMember` | Group membership |
| `SpinSession` | Spin history |
| `SpinSessionCandidate` | Roulette candidates |
| `Vote` | Group vote |
| `Restaurant` | Google Places + user-submitted |
| `RestaurantHours` | Operating hours |
| `RestaurantPhoto` | User photos |
| `Locket` | Camera-only food photos |
| `CheckIn` | Visit verification |
| `SpinWallet` | Spin economy v2 |
| `SpinLog` | Spin transaction history |
| `SubscriptionPlan` | B2B pricing |
| `RestaurantPartner` | B2B restaurant |
| `RestaurantVisit` | B2B visit tracking |
| `CorporateAccount` | B2B corporate |
| `CorporateMember` | B2B seats |
| `TasteBoard` | Collection of lockets |
| `TasteBoardItem` | Board items |
| `Menu` | AI OCR menus |
| `MenuItem` | Parsed menu items |
| `UserPreference` | AI personalization |
| `CircleRecommendation` | AI group suggestions |

### Còn lại ⬜
- [ ] Full-text search (MySQL FULLTEXT)
- [ ] PostGIS extension (geo queries)

---

## CI/CD (Thành Nam)

### Đã xong ✅
- [x] GitHub Actions iOS EAS Build workflow
- [x] GitHub Actions Web CI workflow
- [x] Dependabot config
- [x] CODEOWNERS
- [x] Module-specific .gitignore

### Còn lại ⬜
- [ ] EAS Submit (store submission)
- [ ] Android CI/CD
- [ ] Automated testing workflow
- [ ] Preview deployments
- [ ] Locket upload pipeline
- [ ] Review API pipeline

---

## Landing Page (Toàn team)

### Đã xong ✅
- [x] Design specs in sitemap §4

### Còn lại ⬜ (theo sitemap §4)
- [ ] Hero với Spin Wheel animation
- [ ] Section "Vấn đề của bạn"
- [ ] Section "Cách hoạt động" (3 bước)
- [ ] Section "Tính năng chính"
- [ ] Section "Đối tượng sử dụng"
- [ ] Section "Social Proof"
- [ ] Section "Đăng ký / CTA"
- [ ] Section "FAQ"
- [ ] Footer
- [ ] Privacy policy page (`/chinh-sach-bao-mat`)
- [ ] Terms of service page (`/dieu-khoan-su-dung`)

---

## v1.1 Scope (Menu Capture + AI)

| Feature | Status | Owner |
|---------|--------|-------|
| Menu Capture API | ✅ Done | Trường |
| Menu Capture UI | ✅ Done | Hoàng Hiếu |
| AI OCR (Tesseract) | ✅ Done | Trường |
| Vietnamese Menu Parser | ✅ Done | Trường |
| Taste Profile UI | ✅ Done | Hoàng Hiếu |
| AI Suggestion Card | ✅ Done | Hoàng Hiếu |
| Circle Recommendation Service | ✅ Done | Trường |
| Preference Learning Service | ✅ Done | Trường |

---

## Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | AI OCR engine final (Tesseract vs Google ML Kit)? | Trường | ✅ Tesseract selected |
| 2 | Preference learning (real-time vs batch)? | Trường | Open |
| 3 | Payment gateway (VNPay, MoMo, Stripe)? | Tuấn Anh | Open |
| 4 | Push notification provider (Expo vs Firebase)? | Thành Nam | Open |

---

## Next Steps (1-2 tuần tới)

### Priority 1 — MVP Complete
1. **Mobile**: Spin wheel animation + onboarding
2. **Web**: Page routing + API hooks
3. **Integration**: Mobile ↔ Backend full test

### Priority 2 — v1.0 Full
4. Landing page (hero + sections)
5. Privacy policy + Terms pages
6. Group spin flow (mobile)
7. Taste Board management (mobile)

### Priority 3 — Polish
8. CI/CD: Android CI + EAS Submit
9. Store listing assets
10. Onboarding flow (web)

---

## Team

| Role | Người | Task chính |
|------|-------|-------------|
| PM + Architect | Đặng Tuấn Anh | Spec, architecture, setup, backend core, database, CI/CD base |
| Backend Lead | Lê Huy Trường | All API modules, OCR, recommendation, preference learning |
| Frontend Lead | Lê Văn Hoàng Hiếu | Mobile + Web components, screens, UI |
| Content + Frontend | Trần Gia Bình | Screens, copy, mobile GPS fixes |
| DevOps | Nguyễn Thành Nam | CI/CD, GitHub Actions, EAS Build |

---

## File Structure Reference

```
KADA-Food-Roulette/
├── apps/
│   ├── mobile/
│   │   ├── app/                    # Expo Router pages
│   │   │   ├── (tabs)/             # Tab screens
│   │   │   ├── auth/               # Auth screens
│   │   │   └── locket/            # Locket screens
│   │   └── src/
│   │       ├── api/                # API client + endpoints
│   │       ├── stores/             # Zustand stores
│   │       └── lib/               # Utils
│   └── web/
│       └── src/
│           ├── features/            # Feature modules
│           │   ├── auth/
│           │   ├── roulette/
│           │   ├── groups/
│           │   ├── lockets/
│           │   ├── profile/
│           │   ├── restaurants/
│           │   ├── checkin/
│           │   ├── menu/
│           │   └── rewards/
│           └── components/          # Shared components
├── backend/
│   ├── prisma/                     # Schema + migrations
│   └── src/
│       ├── modules/                # Feature modules
│       │   ├── auth/
│       │   ├── roulette/
│       │   ├── groups/
│       │   ├── restaurants/
│       │   ├── lockets/
│       │   ├── preferences/
│       │   ├── menu/
│       │   ├── circle/
│       │   └── steward/
│       ├── shared/                 # Shared services
│       ├── middleware/             # Express middleware
│       └── utils/                  # Utilities
└── docker/                        # Docker configs
```

---

*Updated: 2026-08-09 · Last update by: Cursor AI*
*Based on: `brand/FOOD-ROULETTE-SITEMAP.md` v2.4*
