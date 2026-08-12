# PROGRESS.md

> **Theo doi tiến độ implementation Food Roulette**
> **Version:** 2.4 · **Date:** 2026-08-12
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
| **Onboarding** | ✅ | ❌ | ❌ | 🟡 Partial (API done, UI pending) |
| **Spin cá nhân** | ✅ | ✅ | ✅ | ✅ Done |
| **Spin Wallet** | ✅ | ✅ | ✅ | ✅ Done |
| **Group spin (max 20, vote)** | ✅ | ✅ | ✅ | ✅ Done |
| **Locket capture (camera-only)** | ✅ | ✅ | N/A | ✅ Done |
| **Locket feed** | ✅ | ✅ | ✅ | ✅ Done |
| **Taste Board** | ✅ | ✅ | ✅ | ✅ Done |
| **Profile công khai** | ✅ | ✅ | ✅ | ✅ Done |
| **Thêm quán (user-submitted)** | ✅ | ✅ | ✅ | ✅ Done |
| **Steward dashboard** | ✅ | ✅ | ✅ | ✅ Done |
| **Google Places lookup** | ✅ | ✅ | ✅ | ✅ Done |
| **Restaurant Partner (B2B)** | ✅ | ✅ | ✅ | ✅ Done |
| **Corporate Account (B2B)** | ✅ | ✅ | ✅ | ✅ Done |
| **Landing page** | N/A | N/A | ❌ | ❌ Not Started |
| **Chính sách bảo mật** | N/A | N/A | ❌ | ❌ Not Started |
| **Điều khoản sử dụng** | N/A | N/A | ❌ | ❌ Not Started |
| **Spin Filter UI** | ✅ | ✅ | ✅ | ✅ Done |
| **Review System** | ✅ | ✅ | ✅ | ✅ Done |
| **Discover Map** | ✅ | ✅ | ✅ | ✅ Done |
| **Moderation System** | ✅ | N/A | ✅ | ✅ Done (Web dashboard) |

---

## v1.1: Onboarding + Discover + Steward

> **Mục tiêu:** Hoàn thiện onboarding flow, thêm bản đồ khám phá, Steward dashboard
> **Status:** 🟡 In Progress — Most features done, Landing page pending

| Feature | Backend | Mobile | Web | Status | Plan File |
|---------|---------|--------|-----|--------|-----------|
| **Onboarding Flow** | ✅ | ❌ | ❌ | 🟡 Partial | `plans/feature-v1.1-onboarding.md` |
| **Discover Map** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.1-discover-map.md` |
| **Steward Dashboard** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.1-steward.md` |
| **Review UI** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.1-review-ui.md` |
| **Moderation System** | ✅ | N/A | ✅ | ✅ Done | `plans/feature-v1.2-ai-moderation.md` |
| **Menu Scan** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.2-menu-scan.md` |

---

## v1.2: Voice + AI + Gamification

> **Mục tiêu:** Tính năng khác biệt - voice input, AI suggestion, gamification
> **Status:** 🔄 In Progress

| Feature | Backend | Mobile | Web | Status | Plan File |
|---------|---------|--------|-----|--------|-----------|
| **Menu Scan + Taste Filter** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.2-menu-scan.md` |
| **Voice Group Spin** | 🟡 | ❌ | ❌ | 🟡 Partial | `plans/feature-v1.2-voice-spin.md` |
| **AI Suggestion Engine** | ✅ | ✅ | ✅ | ✅ Done | `plans/feature-v1.2-ai-suggestion.md` |
| **AI Moderation** | ✅ | N/A | ✅ | ✅ Done | `plans/feature-v1.2-ai-moderation.md` |
| **Gamification (Streaks + Badges)** | 🟡 | 🟡 | 🟡 | 🟡 Partial | `plans/feature-v2.0-gamification.md` |

---

## v2.0: Social + Expansion

> **Mục tiêu:** Tăng engagement với chat trong nhóm, mở rộng thành phố
> **Status:** 📋 Planned

| Feature | Backend | Mobile | Web | Status | Plan File |
|---------|---------|--------|-----|--------|-----------|
| **In-app Chat** | ❌ | ❌ | ❌ | ❌ Not Started | `plans/feature-v2.0-chat.md` |
| **Multi-city Support** | ❌ | ❌ | ❌ | ❌ Not Started | `plans/feature-v2.0-multicity.md` |
| **AI Food Advisor** | ❌ | ❌ | ❌ | ❌ Not Started | `plans/feature-v2.0-ai-advisor.md` |

---

## Landing Page + Legal

| Feature | Status | Plan File |
|---------|--------|-----------|
| **Landing Page** | ❌ Not Started | `plans/feature-landing-page.md` |
| **Privacy Policy** | ❌ Not Started | `plans/feature-legal-pages.md` |
| **Terms of Service** | ❌ Not Started | `plans/feature-legal-pages.md` |

---

## Backend (Trường)

### Đã xong ✅

| Module | Files | Owner |
|--------|-------|-------|
| **Auth** | `auth.controller.ts`, `auth.routes.ts` | Tuấn Anh |
| **Partner (B2B)** | `partner.controller.ts`, `partner.service.ts`, `partner.routes.ts`, `partner.types.ts` | Tuấn Anh |
| **Roulette** | `roulette.controller.ts`, `roulette.routes.ts` | Trường |
| **Groups** | `groups.controller.ts`, `groups.routes.ts` | Trường |
| **Restaurants** | `restaurants.controller.ts`, `restaurants.routes.ts` | Trường |
| **Places** | `places.controller.ts`, `places.routes.ts` | Trường |
| **Lockets** | `lockets.controller.ts`, `lockets.routes.ts`, `lockets.service.ts` | Trường |
| **Preferences** | `preferences.controller.ts`, `preferences.service.ts` | Trường |
| **Menu** | `menu.controller.ts`, `menu.service.ts`, `menu.routes.ts` | Trường |
| **Circle** | `circle.controller.ts`, `circle.service.ts`, `circle.routes.ts` | Trường |
| **Steward** | `steward.controller.ts`, `steward.routes.ts` | Trường |
| **Friends** | `friends.controller.ts`, `friends.service.ts`, `friends.routes.ts` | Trường |
| **Notifications** | `notifications.controller.ts`, `notifications.service.ts`, `notifications.routes.ts` | Trường |
| **Users** | `users.controller.ts`, `users.service.ts`, `users.routes.ts`, `users.validation.ts` | Trường |
| **Profile** | `profile.controller.ts`, `profile.service.ts`, `profile.routes.ts` | Trường |
| **Reviews** | `reviews.controller.ts`, `reviews.routes.ts` | Trường |
| **Moderation** | `moderation.controller.ts`, `moderation.routes.ts`, `moderation/index.ts` | Trường |

### Shared Services ✅
- `ocr.service.ts` — Tesseract OCR wrapper
- `menuParser.service.ts` — Vietnamese menu parser
- `preferenceLearner.service.ts` — User preference learning
- `lockets/lockets.storage.ts` — Media storage service
- `lockets/lockets.imageProcessor.ts` — Image processing
- `lockets/lockets.mediaAccess.ts` — Media access control
- `lockets/lockets.validation.ts` — Locket validation rules

### Tests ✅
- `__tests__/friends.test.ts` — Friends API tests
- `__tests__/notifications.test.ts` — Notifications API tests
- `__tests__/profile.test.ts` — Profile API tests
- `__tests__/lockets.test.ts` — Lockets API tests
- `__tests__/smoke.test.ts` — Health check tests
- `lockets/lockets.*.test.ts` — 6 test files (lifecycle, authorization, mediaAccess, storage, validation, imageProcessor)
- `users/users.validation.test.ts` — User validation tests

### Còn lại ⬜
- [ ] Real-time notifications (WebSocket)
- [ ] Payment integration (Spin Packs)
- [ ] Full-text search (MySQL FULLTEXT)

---

## Mobile App (Hoàng Hiếu + Gia Bình)

### Đã xong ✅

#### Auth & Core
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

#### Locket
| Screen | File | Owner |
|--------|------|-------|
| Locket Capture | `app/locket/capture.tsx` | Hoàng Hiếu + Gia Bình |
| Locket Detail | `app/locket/[id].tsx` | Gia Bình |

#### Restaurant
| Screen | File | Owner |
|--------|------|-------|
| Restaurant Detail | `app/restaurant/[id].tsx` | Hoàng Hiếu |
| Add Restaurant | `app/restaurants/add.tsx` | Hoàng Hiếu |

#### Profile
| Screen | File | Owner |
|--------|------|-------|
| Public Profile | `app/u/[public_id].tsx` | Gia Bình |
| Profile Edit | `app/profile/edit.tsx` | Gia Bình |
| Profile Settings | `app/profile/settings.tsx` | Gia Bình |

#### Spin (Personal)
| Screen | File | Owner |
|--------|------|-------|
| Lucky Spin Wheel | `app/spin/lucky-spin.tsx` | Hoàng Hiếu |
| Spin Result | `app/spin/result.tsx` | Hoàng Hiếu |
| Spin Check-in | `app/spin/check-in.tsx` | Hoàng Hiếu |
| Spin Rewards | `app/spin/rewards.tsx` | Hoàng Hiếu |
| Menu Capture | `app/spin/menu-capture.tsx` | Hoàng Hiếu |
| Menu Review | `app/spin/menu-review.tsx` | Hoàng Hiếu |

#### Group Spin
| Screen | File | Owner |
|--------|------|-------|
| Group Spin Layout | `app/group-spin/_layout.tsx` | Hoàng Hiếu |
| Group Spin Lobby | `app/group-spin/lobby.tsx` | Hoàng Hiếu |
| Group Spin Result | `app/group-spin/result.tsx` | Hoàng Hiếu |
| Group Spin Veto | `app/group-spin/veto.tsx` | Hoàng Hiếu |
| Group Spin Check-in | `app/group-spin/check-in.tsx` | Hoàng Hiếu |
| Group Spin Rewards | `app/group-spin/rewards.tsx` | Hoàng Hiếu |

#### Reviews
| Screen | File | Owner |
|--------|------|-------|
| Reviews List | `app/reviews/index.tsx` | Hoàng Hiếu |
| Write Review | `app/reviews/write.tsx` | Hoàng Hiếu |

#### Discover & Steward
| Screen | File | Owner |
|--------|------|-------|
| Discover Map | `app/discover/index.tsx` | Hoàng Hiếu |
| Steward Dashboard | `app/steward-LOCKED/index.tsx` | Hoàng Hiếu |

### Infrastructure ✅
- Expo SDK 52 + Expo Router
- NativeWind v4 configuration
- API client (`src/api/client.ts`)
- API endpoints (`src/api/endpoints/*`)
- Zustand stores (`src/stores/authStore.ts`)
- TypeScript config (v2 - without path aliases for TS 7.0 compatibility)

### Còn lại ⬜
- [ ] Onboarding screens (4-5 screens)
- [ ] Push notification setup
- [ ] Landing page (mobile web)

### Blockers
- Need assets: `assets/icon.png`, `assets/splash.png`
- Need design tokens from `brand/brand.md`

---

## Web App (Hoàng Hiếu)

### Đã xong ✅

#### Auth
| Feature | Components |
|---------|------------|
| **Auth** | `LoginPage.tsx`, `RegisterPage.tsx` |

#### Roulette & Spin
| Feature | Components |
|---------|------------|
| **Roulette** | `LuckySpinWheel.tsx`, `SpinResult.tsx`, `MysteryBoxReveal.tsx`, `HomeSpinRewards.tsx`, `SpinFilterModal.tsx` |

#### Groups
| Feature | Components |
|---------|------------|
| **Groups** | `GroupSpinFoodWheel.tsx`, `GroupSpinWhoSpins.tsx`, `GroupVoteResult.tsx`, `GroupVoteVeto.tsx`, `GroupCheckInVerification.tsx`, `GroupCheckInCompleteRewards.tsx`, `CircleAiSuggestionCard.tsx` |

#### Lockets
| Feature | Components |
|---------|------------|
| **Lockets** | `LocketFeed.tsx`, `ShareYourHarvestSuccess.tsx` |

#### Profile & Rewards
| Feature | Components |
|---------|------------|
| **Profile** | `PreferencesScreen.tsx`, `ProfileTasteProfile.tsx`, `StreakDashboard.tsx` |
| **Rewards** | `SeasonGarden.tsx`, `EnhancedSeasonGardenProgress.tsx` |

#### Restaurants
| Feature | Components |
|---------|------------|
| **Restaurants** | `NearbyRestaurantsMapView.tsx`, `NearbyRestaurantsLeaderboard.tsx`, `FriendsLeaderboardDetail.tsx`, `KhCCommitment.tsx`, `StewardDashboard.tsx`, `SubmitRestaurantForm.tsx` |

#### Check-in & Reviews
| Feature | Components |
|---------|------------|
| **Check-in** | `WriteReview.tsx`, `CheckInVerification.tsx`, `CheckInCompleteRewards.tsx`, `ReviewSubmitted.tsx` |

#### Menu
| Feature | Components |
|---------|------------|
| **Menu** | `MenuCaptureScreen.tsx`, `MenuReviewScreen.tsx` |

#### Steward Moderation
| Feature | Components |
|---------|------------|
| **Moderation** | `steward/moderation/_layout.tsx`, `steward/moderation/queue.tsx`, `steward/moderation/stats.tsx`, `steward/moderation/item/[id].tsx` |

#### Layout
| Feature | Components |
|---------|------------|
| **Layout** | `MainLayout.tsx` |

### Hoàn thành ✅
- [x] ✅ Page routing setup (React Router)
- [x] ✅ API hooks (TanStack Query)
- [x] ✅ State integration
- [x] ✅ Steward Moderation Dashboard

### Còn lại ⬜
- [ ] Landing page (full)
- [ ] Onboarding flow
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
- [x] GitHub Actions iOS EAS Build workflow (`mobile-ci-ios.yml`)
- [x] GitHub Actions Android EAS Build workflow (`mobile-ci-android.yml`)
- [x] GitHub Actions Web CI workflow
- [x] GitHub Actions Backend CI workflow
- [x] Dependabot config
- [x] CODEOWNERS
- [x] Module-specific .gitignore
- [x] `backend.Dockerfile` - Backend container
- [x] `docker/backend.Dockerfile` - GitHub Actions build context
- [x] Locket upload pipeline (backend)
- [x] Review API pipeline (backend)

### Còn lại ⬜
- [ ] EAS Submit (store submission)
- [ ] Automated testing workflow
- [ ] Preview deployments

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

## Team Work Assignment

Xem chi tiết trong: `plans/team-assignment.md`

### Summary — Cập nhật 2026-08-12

| Person | Role | Completed | Remaining | Notes |
|--------|------|----------|----------|-------|
| **Trường** | Backend Lead | ~80% | ~20h | Most APIs done, Moderation done, Review done |
| **Hoàng Hiếu** | Frontend Lead | ~85% | ~18h | All screens done, Landing + Onboarding pending |
| **Gia Bình** | Content + Frontend | ~75% | ~10h | Most screens done, Landing content pending |
| **Thành Nam** | DevOps | ~90% | ~4h | CI/CD mostly done, EAS Submit pending |
| **Tuấn Anh** | PM + Architect | ~80% | ~12h | Architecture done, Launch prep pending |

### Progress Since Last Update

#### ✅ Hoàn thành gần đây:
- Review System (Backend + Mobile + Web)
- Discover Map (Backend + Mobile + Web)
- Steward Dashboard (Mobile)
- Moderation System (Backend + Web)
- Menu Scan với Google Gemini OCR
- Spin Wallet UI (Mobile)
- Corporate Account UI (Mobile)

#### ⏳ Đang làm:
- Voice Group Spin (Backend partial)
- Gamification (Backend partial, UI partial)

#### 📋 Còn lại cho Launch:
- Landing Page
- Onboarding Flow
- Privacy Policy
- Terms of Service
- EAS Submit
- App Store assets

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

### Priority 1 — Landing + Launch Prep
1. Landing page (web) — Hoàng Hiếu
2. Privacy policy page — Gia Bình (content) + Hoàng Hiếu (page)
3. Terms of service page — Gia Bình (content) + Hoàng Hiếu (page)
4. Onboarding screens (mobile) — Hoàng Hiếu

### Priority 2 — v1.0 Polish
5. App store assets (icon, splash)
6. EAS Submit (App Store submission)
7. Push notification setup

### Priority 3 — v1.2 Features
8. Voice Group Spin (backend + UI)
9. Gamification UI polish

### Backlog — v2.0
- In-app Chat
- Multi-city Support
- AI Food Advisor

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

*Updated: 2026-08-12 · Last update by: Cursor AI (sync from git commits + file analysis)*
*Based on: `brand/FOOD-ROULETTE-SITEMAP.md` v2.4*
