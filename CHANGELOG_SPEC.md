# CHANGELOG_SPEC.md

> **Theo dõi mọi thay đổi về spec trong dự án Food Roulette.**
> Spec thay đổi phải được log tại đây. Các AI tool (Cursor/Claude/ChatGPT/Gemini) sẽ check file này để sync context.

---

## Format

```markdown
### [YYYY-MM-DD] - [Version]

**Type:** [feature|breaking|enhancement|deprecation|deprecated-removal]
**Author:** [Tên người thay đổi]
**Source:** [Link đến PR/discussion]

**Change:**
- Mô tả ngắn gọn thay đổi

**Impact:**
- File/feature bị ảnh hưởng

**Migration:**
- Hướng dẫn update (nếu có)
```

---

## Spec Change History

### 2026-08-11 - Schema v5.2 → v5.3 (Planning → Implementation)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-6-launch.md`

**Change:**
- Added `City` table with city-level configuration
- Added `CityDistrict` table for sub-regions
- Added `User.preferredCityId` and `Restaurant.cityId/cityDistrictId` foreign keys
- Seed 5 default cities: HCMC, Hanoi, Danang, Cantho, Haiphong

**Impact:**
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.3

**Migration:** Run `npx prisma migrate dev --name v5_3_city_tables`

### 2026-08-09

### Added

- **B2B Restaurant Partner Module**
  - By: PM - AI Assistant
  - Via: Cursor
  - Spec: `brand/prompts.md` §4.2, `Content/explore/restaurant-partner-strategy.md`
  - Files affected:
    - `backend/prisma/schema.prisma` (added: RestaurantPartner, RestaurantVisit, PromoCode, CorporateAccount, CorporateMember)
    - `backend/src/modules/partner/partner.types.ts` (new - TypeScript types)
    - `backend/src/modules/partner/partner.service.ts` (new - Business logic)
    - `backend/src/modules/partner/partner.controller.ts` (new - API handlers)
    - `backend/src/modules/partner/partner.routes.ts` (new - API routes)
    - `backend/src/index.ts` (updated - registered partner routes)

  **API Endpoints Implemented:**
  - `POST /api/v1/partners` - Register partner
  - `GET /api/v1/partners/:id` - Get partner by ID
  - `PUT /api/v1/partners/:id` - Update partner
  - `PUT /api/v1/partners/:id/upgrade` - Upgrade tier
  - `GET /api/v1/partners/restaurant/:id` - Get by restaurant
  - `GET /api/v1/partners/:id/dashboard` - Partner dashboard
  - `GET /api/v1/partners/:id/analytics` - Analytics
  - `GET /api/v1/partners/:id/score` - Score breakdown
  - `POST /api/v1/partners/visits` - Record visit (GPS verification)
  - `GET /api/v1/partners/:id/billing/:month` - Monthly billing
  - `POST /api/v1/partners/:id/billing/:month/confirm` - Confirm billing
  - `GET /api/v1/partners/featured/:id` - Featured placement score
  - `POST /api/v1/partners/:id/promo-codes` - Create promo code
  - `GET /api/v1/partners/:id/promo-codes` - List promo codes
  - `POST /api/v1/corporate/accounts` - Create corporate account
  - `POST /api/v1/corporate/accounts/:id/members` - Add member

  **Database Tables Added (5 tables):**
  - `restaurant_partners` - B2B partner information
  - `restaurant_visits` - Pay-per-visit tracking
  - `promo_codes` - Partner promo codes
  - `corporate_accounts` - Corporate B2B accounts
  - `corporate_members` - Corporate seat management

- **CI/CD workflows cho mobile + web**

### Added
- **CI/CD workflows cho mobile + web**
  - By: Nguyễn Thành Nam (AI-assisted via Cursor)
  - Spec: `AGENTS.md` §10.4 (DevOps coverage)
  - Files affected:
    - `.github/workflows/mobile-ci-ios.yml` (new - iOS EAS build trigger)
    - `.github/workflows/web-ci.yml` (new - Lint + Typecheck + Build)
- **Dependabot config**
  - By: Nguyễn Thành Nam
  - Files affected:
    - `.github/dependabot.yml` (new - 3 ecosystems: npm backend, npm mobile, npm web)
- **CODEOWNERS (placeholder usernames)**
  - By: Nguyễn Thành Nam
  - Files affected:
    - `.github/CODEOWNERS` (new - 5 roles mapped to folders, **cần replace placeholder** trước khi bật branch protection)
- **Module-specific .gitignore**
  - By: Nguyễn Thành Nam
  - Files affected:
    - `apps/mobile/.gitignore` (new - Expo, EAS, native)
    - `backend/.gitignore` (new - Prisma, Node, uploads, secrets)

### Notes
- Workflow `mobile-ci-ios.yml` (mới) chạy song song với `mobile-ci.yml` (cũ của team) — cần review gộp hoặc bỏ 1 trong 2.
- CODEOWNERS dùng placeholder GitHub handles (`@hoang-hieu-spin`, ...) — phải thay bằng username thật.

### 2026-08-08

### Added

- **Mobile App (Expo + React Native) Setup**
  - By: AI Assistant
  - Via: Cursor
  - Spec: `CLAUDE.md` §3 (Mobile structure)
  - Files affected:
    - `apps/mobile/package.json` (new - Expo SDK 52 + dependencies)
    - `apps/mobile/app.json` (new - Expo config)
    - `apps/mobile/tsconfig.json` (new - TypeScript config)
    - `apps/mobile/babel.config.js` (new - Babel with nativewind)
    - `apps/mobile/metro.config.js` (new - Metro bundler config)
    - `apps/mobile/tailwind.config.js` (new - NativeWind config)
    - `apps/mobile/app/_layout.tsx` (new - Root layout)
    - `apps/mobile/app/+not-found.tsx` (new - 404 page)
    - `apps/mobile/app/(tabs)/_layout.tsx` (new - Tab navigation)
    - `apps/mobile/app/(tabs)/index.tsx` (new - Home screen)
    - `apps/mobile/app/(tabs)/spin.tsx` (new - Spin/Roulette screen)
    - `apps/mobile/app/(tabs)/lockets.tsx` (new - Locket feed screen)
    - `apps/mobile/app/(tabs)/profile.tsx` (new - Profile screen)
    - `apps/mobile/app/auth/login.tsx` (new - Login screen)
    - `apps/mobile/app/auth/register.tsx` (new - Register screen)
    - `apps/mobile/app/locket/capture.tsx` (new - Camera capture screen)
    - `apps/mobile/app/restaurant/[id].tsx` (new - Restaurant detail screen)
    - `apps/mobile/src/api/client.ts` (new - Axios client)
    - `apps/mobile/src/api/endpoints/auth.ts` (new)
    - `apps/mobile/src/api/endpoints/roulette.ts` (new)
    - `apps/mobile/src/api/endpoints/restaurants.ts` (new)
    - `apps/mobile/src/api/endpoints/groups.ts` (new)
    - `apps/mobile/src/api/endpoints/lockets.ts` (new)
    - `apps/mobile/src/api/endpoints/preferences.ts` (new)
    - `apps/mobile/src/lib/constants.ts` (new - App constants)
    - `apps/mobile/src/lib/utils.ts` (new - Utility functions)
    - `apps/mobile/src/stores/authStore.ts` (new - Zustand auth store)

  **Mobile Stack Implemented:**
  - Expo SDK 52 + Expo Router (file-based routing)
  - NativeWind v4 (Tailwind for RN)
  - expo-camera + expo-image-picker
  - expo-location
  - expo-secure-store
  - Zustand (state management)
  - TanStack Query (data fetching)
  - Axios (HTTP client)

  **⚠️ Remaining tasks:**
  - Create `assets/icon.png`, `assets/splash.png`
  - Run `npx expo prebuild` for native projects
  - Test with `npx expo start`

### Changed

- **CLAUDE.md - Updated mobile structure**
  - By: AI Assistant
  - Via: Cursor
  - Change: Added detailed `apps/mobile/` structure with Expo Router pages
  - Files affected: `CLAUDE.md` §3

### 2026-08-08

### Resolved

- **Steward Role Design Decision**
  - By: AI Assistant (via Cursor)
  - Via: User decision
  - Decision: Dùng `role ENUM('USER', 'STEWARD', 'ADMIN')` trên bảng User (thay vì `is_steward boolean` hoặc bảng riêng)
  - Files affected:
    - `brand/prompts.md` §9 (resolved open question)
    - `brand/prompts.md` §7 (User interface)
    - `brand/FOOD-ROULETTE-SITEMAP.md` §19.10 (resolved open question)
    - `brand/FOOD-ROULETTE-SITEMAP.md` §19 (User interface)
  - Rationale: Đơn giản, đã implement trong code, đủ dùng cho MVP

- **Group, Locket, Notification & Device Hash Decisions**
  - By: AI Assistant (via Cursor)
  - Via: User decision
  - Decisions:
    - **Group membership:** Có chủ phòng tạo, nhưng **tất cả thành viên** (kể cả chủ phòng) đều có thể thêm người mới sau khi vào phòng
    - **Group lifecycle:** Group bị **xóa khi tất cả thành viên out**
    - **Locket lifecycle:** **Vĩnh viễn** (không tự hủy 24h)
    - **Push notification:** **Per-type toggle** - bật/tắt theo loại (locket mới, spin, group...)
    - **device_hash reset:** **User-initiated reset** - user chủ động confirm đổi máy trong app
  - Files affected:
    - `brand/prompts.md` §9 (resolved 5 open questions)
    - `brand/FOOD-ROULETTE-SITEMAP.md` §19.10 (resolved 5 open questions)

### 2026-08-08

### Added

- **Express.js + Prisma Backend Setup**
  - By: AI Assistant
  - Via: Cursor
  - Spec: `AGENTS.md` §10.2 (Backend Lead - Trường)
  - Files affected:
    - `backend/package.json` (added: express, cors, helmet, morgan, bcryptjs, jsonwebtoken, etc.)
    - `backend/tsconfig.json` (new - TypeScript configuration)
    - `backend/.env.example` (new - environment variables template)
    - `backend/.env` (updated - added JWT and server config)
    - `backend/src/index.ts` (new - Express entry point)
    - `backend/src/lib/prisma.ts` (new - Prisma client singleton)
    - `backend/src/types/index.ts` (new - shared types)
    - `backend/src/middleware/cors.ts` (new)
    - `backend/src/middleware/errorHandler.ts` (new)
    - `backend/src/middleware/validate.ts` (new)
    - `backend/src/middleware/auth.ts` (new - JWT authentication)
    - `backend/src/routes/auth.ts` (new - auth endpoints)
    - `backend/src/routes/index.ts` (new)
    - `backend/src/utils/jwt.ts` (new)
    - `backend/src/utils/hash.ts` (new)
    - `backend/src/utils/response.ts` (new)

  **Auth Endpoints Implemented:**
  - `POST /api/v1/auth/register` - Email + password registration
  - `POST /api/v1/auth/login` - Login with JWT
  - `POST /api/v1/auth/refresh` - Refresh token
  - `POST /api/v1/auth/logout` - Logout
  - `GET /api/v1/auth/me` - Get current user
  - `POST /api/v1/auth/google` - Google OAuth
  - `POST /api/v1/auth/forgot-password` - Password reset request

  **Infrastructure:**
  - Health check: `GET /health`
  - CORS middleware configured
  - Helmet security headers
  - Morgan request logging
  - Global error handler
  - Express-validator integration

  **✅ Verified (2026-08-08):**
  - Build: PASS
  - Dev server: RUNNING on http://localhost:3000
  - MySQL via Docker: CONNECTED
  - `POST /api/v1/auth/register`: OK
  - `POST /api/v1/auth/login`: OK
  - `GET /api/v1/auth/me`: OK

### 2026-08-06

#### Added

- **Backend Prisma Setup v5.22.0**
  - By: AI Assistant
  - Via: Cursor
  - Files affected:
    - `backend/package.json` (new - Node.js project setup)
    - `backend/.env` (new - DATABASE_URL config)
    - `backend/prisma/schema.prisma` (updated - restored DATABASE_URL)
    - `backend/prisma/sql/v5.0/index_performance.sql` (new)
    - `backend/prisma/sql/v5.0/constraints_validation.sql` (new)
    - `backend/prisma/sql/v5.0/enum_validation.sql` (new)
    - `backend/prisma/sql/v5.0/cascade_delete_validation.sql` (new)
    - `backend/prisma/sql/v5.0/edge_cases_validation.sql` (new)
    - `backend/src/test/api-integration.test.ts` (new)
    - `backend/prisma/sql/v5.0/README_VALIDATION.md` (new)

  **Prisma Version Decision:**
  - Attempted: Prisma 7.x (breaking changes, `@prisma/adapter-mysql` not available)
  - Solution: Downgraded to Prisma 5.22.0 (stable, production-ready)
  - `datasource url` kept in schema.prisma (required for v5.x)

  **Validation Files Created (6 checks):**
  1. `index_performance.sql` - EXPLAIN queries, verify index usage
  2. `constraints_validation.sql` - NOT NULL, UNIQUE, FK constraints
  3. `enum_validation.sql` - All enum values validation
  4. `cascade_delete_validation.sql` - Cascade behavior testing
  5. `edge_cases_validation.sql` - Boundary conditions, NULL handling
  6. `api-integration.test.ts` - Prisma client CRUD operations

---

### 2026-08-11 - Implementation Phase Completion

**Type:** milestone
**Author:** Tuấn Anh
**Source:** Tuấn Anh action plan (`plans/tuan-anh-action-plan.md`)

**Change:** Completed implementation of:

1. **EAS Build/Submit config** (Phase 1)
   - `eas.json` with 4 profiles (development, development:device, preview, production)
   - `docs/EAS_BUILD_GUIDE.md` documentation
2. **CHANGELOG_SPEC.md** (Phase 1)
3. **ADR-002 Discover Map** + geo utilities (Phase 2)
   - `backend/src/shared/utils/geo.utils.ts` with Haversine + bounding box
   - Geospatial indexes added to Restaurant
   - Refactored restaurants controller for real queries
4. **ADR-001 AI Moderation** + ModerationQueue schema + service (Phase 3)
   - Moderation service with adapter pattern
   - OpenAI + NSFW.js adapters (stub)
   - Moderation module (routes + controller)
5. **Moderation Dashboard UI** (Phase 4)
   - 3 pages: queue, item detail, stats
   - React Query hooks
6. **ADR-003 AI Suggestion** + **ADR-004 WebSocket** (Phase 5)
7. **Gamification + Chat schemas** (Phase 6)
   - 6 new tables: UserStreak, Achievement, UserAchievement, UserXP, ChatRoom, ChatRoomParticipant, ChatMessage
8. **City schema + AI Advisor ADR + Pre-launch checklist** (Phase 7)
   - 2 new tables: City, CityDistrict
   - ADR-005 AI Food Advisor
   - `docs/PRE_LAUNCH_CHECKLIST.md`

**Impact:** Cross-cutting
- 5 new ADR documents
- 12 new DB tables (16 → 22 entities, total now 22)
- 1 new web feature: Moderation
- 8 new backend modules/utilities
- Multiple doc updates

---

### 2026-08-11 - Schema v5.1 → v5.2 (Planning)

**Type:** enhancement
**Author:** Tuấn Anh
**Source:** Internal planning session

**Change:**
- Added AI Moderation feature planning (v1.2 scope)
- Added Multi-city support planning (v2.0 scope)
- Added AI Food Advisor planning (v2.0 scope)
- Added Gamification (Streak + XP + Achievements) planning (v2.0 scope)
- Added In-app Chat planning (v2.0 scope)
- Added Discover Map planning (v1.1 scope)

**Impact:**
- `brand/FOOD-ROULETTE-SITEMAP.md` - New feature sections
- `CLAUDE.md` - Updated roadmap
- `PROGRESS.md` - New status tracker

**Migration:** None (additive)

---

### 2026-08-11 - Schema v5.0 → v5.1 (Planning)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-3-ai-moderation.md`

**Change:**
- Added `ModerationQueue` table for AI moderation workflow
- Added indexes for queue queries (status+createdAt, contentType+contentId)

**Impact:**
- `backend/prisma/schema.prisma`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.1
- `docs/ERD_MIGRATION_NOTES.md`

**Migration:** Run `npx prisma migrate dev --name add_moderation_queue`

---

### 2026-08-11 - Schema v5.1 → v5.2 (Planning)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-2-discover-map.md`

**Change:**
- Added geospatial indexes to `Restaurant` table
- Compound index `(latitude, longitude)`
- Single column index on `cuisineType`
- Compound index `(status, source)`

**Impact:**
- `backend/prisma/schema.prisma`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.2

**Migration:** Run `npx prisma migrate dev --name add_geo_indexes`

---

### 2026-08-11 - Schema v5.2 → v5.3 (Planning)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-5-v2-gamification.md`

**Change:**
- Added gamification tables: `UserStreak`, `Achievement`, `UserAchievement`, `UserXP`
- Added 10 default achievements in seed data
- Added User relations to gamification tables

**Impact:**
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.3

**Migration:** Run `npx prisma migrate dev --name add_gamification_tables`

---

### 2026-08-11 - Schema v5.3 → v5.4 (Planning)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-5-v2-gamification.md`

**Change:**
- Added chat tables: `ChatRoom`, `ChatRoomParticipant`, `ChatMessage`
- Added `Group` relation to ChatRoom (groupId unique)
- Added retention policy: messages older than 90 days auto-deleted

**Impact:**
- `backend/prisma/schema.prisma`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.4

**Migration:** Run `npx prisma migrate dev --name add_chat_tables`

---

### 2026-08-11 - Schema v5.4 → v5.5 (Planning)

**Type:** feature
**Author:** Tuấn Anh
**Source:** `plans/sprint-6-launch.md`

**Change:**
- Added `City` table with city-level configuration
- Added `CityDistrict` table for sub-regions
- Added `User.preferredCityId` and `Restaurant.cityId/cityDistrictId` foreign keys
- Seed 5 default cities: HCMC, Hanoi, Danang, Cantho, Haiphong

**Impact:**
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `docs/food_roulette_erd_v5.0_reviewed.xml` → v5.5

**Migration:** Run `npx prisma migrate dev --name add_city_tables`

---

## Spec Change Convention

### Khi nào cần log vào file này?

- **Thay đổi schema DB:** Schema version mới
- **Thêm/xóa feature:** Sitemap version mới
- **Đổi API contract:** API_SPEC.md version mới
- **Đổi design tokens:** Brand tokens version mới
- **Đổi scope của sprint:** Plan file version mới

### Ai chịu trách nhiệm?

- **PM (Tuấn Anh):** Approve và log mọi spec change
- **AI tools:** Check file này mỗi session để sync context
- **Developers:** Reference version number khi code

### Rule khi update

1. **KHÔNG xóa entry cũ** - Chỉ append mới
2. **Mỗi entry 1 version bump** - Không gộp nhiều change
3. **Migration rõ ràng** - Code path cần làm gì
4. **Reference source** - PR number, discussion, plan file

---

## Spec Versions Reference

| Version | Date | Major Changes |
|---------|------|---------------|
| v2.4 | 2026-08-06 | Onboarding, Discover Map, Steward Dashboard added |
| v2.5 | 2026-08-11 | AI Moderation, Multi-city, AI Advisor, Gamification, Chat planning |
| v2.6 | TBD | Post-launch improvements |

| Schema Version | Date | Tables Changed | Total Entities |
|----------------|------|----------------|----------------|
| v5.0 | 2026-08-06 | Initial schema (15 tables) | 15 |
| v5.1 | 2026-08-11 (planned) | +1 (ModerationQueue) + geo indexes | 16 |
| v5.2 | 2026-08-11 (planned) | +6 (Gamification x4 + Chat x3) | 22 |
| v5.3 | 2026-08-11 (planned) | +2 (City, CityDistrict) | 24 |

---

*Last updated: 2026-08-11 · Maintainer: Tuấn Anh (PM)*