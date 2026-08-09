# CHANGELOG_SPEC.md

> **Track tất cả thay đổi spec** — ai, khi nào, thay đổi gì
> **Version:** 1.0 · **Date:** 2026-08-06

---

## Mục đích

- Team biết spec thay đổi ở đâu, khi nào
- AI tools đang có context cũ có thể sync lại
- PM theo dõi spec evolution

---

## Format

```markdown
## YYYY-MM-DD

### Added
- [Mô tả feature/tính năng mới]
  - By: [Tên người] - [Role]
  - Via: [AI Tool]
  - Spec: [File và section]
  - Files affected: [Danh sách files]

### Changed
- [Mô tả thay đổi]
  - By: [Tên người] - [Role]
  - Via: [AI Tool]
  - Spec: [File và section]
  - Reason: [Tại sao thay đổi]

### Deprecated
- [Tính năng bị loại bỏ]
  - By: [Tên người] - [Role]
  - Spec: [File và section]
  - Reason: [Tại sao]

### Fixed
- [Fix bug/sai sót trong spec]
  - By: [Tên người] - [Role]
  - Spec: [File và section]
  - Original: [Nội dung cũ]
  - Fixed: [Nội dung mới]
```

---

## Changelog

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

---

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
    - `backend/prisma/migrations/v5.0/index_performance.sql` (new)
    - `backend/prisma/migrations/v5.0/constraints_validation.sql` (new)
    - `backend/prisma/migrations/v5.0/enum_validation.sql` (new)
    - `backend/prisma/migrations/v5.0/cascade_delete_validation.sql` (new)
    - `backend/prisma/migrations/v5.0/edge_cases_validation.sql` (new)
    - `backend/src/test/api-integration.test.ts` (new)
    - `backend/prisma/migrations/v5.0/README_VALIDATION.md` (new)

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

### 2026-08-06

#### Added

- **ERD v2.6 - SQL Architecture Review Fixes**
  - By: AI Assistant
  - Via: Cursor
  - Spec: `docs/food_roulette_erd_v2.6.drawio.xml`
  - Files affected:
    - `docs/food_roulette_erd_v2.6.drawio.xml` (new file - complete rewrite)
    - `docs/ERD_MIGRATION_NOTES.md` (new file - SQL migration scripts)

  **P0 - Critical (MVP):**
  - SpinLog: Replaced polymorphic FK (`referenceType` + `referenceId`) with separate nullable FK columns (`purchaseId`, `adWatchLogId`, `giftId`, `referralId`)
  - RestaurantVisit: Made `partnerId` nullable to fix corporate partner paradox
  - Group: Added note for host membership enforcement via app layer
  - SpinWallet: Added trigger requirement for `balance >= 0` enforcement
  - Added missing audit fields: `updatedAt` on Friendship, GroupMember, Vote, Review; `createdAt`/`updatedAt` on CheckIn; `updatedAt`/`completedAt`/`brokenAt` on Commitment

  **P1 - Before Production:**
  - Added missing indexes: CheckIn `[userId, createdAt]`, Review `[userId, createdAt]`, Locket `[userId, capturedAt]`, Restaurant `[status, category]`, GroupMember `[groupId, status]`, SpinSession `[initiatorId]`
  - CheckIn: Added `verifiedAt` and `verificationMethod` (GPS_ONLY, GPS_PLUS_LOCKET, MANUAL)
  - AdWatchLog: Added `watchDate` field for daily cap queries
  - User: Renamed `password` to `passwordHash` with bcrypt/argon2 requirement
  - TasteBoardItem: Added app-layer locket ownership validation note

  **P2 - Technical Debt:**
  - SpinSessionCandidate: Optional junction table design (currently keeping JSON)
  - RestaurantRatingSummary: Optional denormalized table design
  - Partitioning strategy documented for Locket, CheckIn, Review, SpinLog, AdWatchLog
  - CorporateMember: Added `status` ENUM(ACTIVE, INACTIVE) field

---

### 2026-08-06

#### Added

- **Menu Capture Feature**
  - By: PM - AI Assistant
  - Via: Cursor
  - Spec: `brand/prompts.md` §13, `brand/FOOD-ROULETTE-SITEMAP.md` §19.15-16
  - Files affected:
    - `docs/food_roulette_erd.drawio.xml` (Menu, MenuItem entities)
    - `brand/prompts.md` (new §13)
    - `brand/FOOD-ROULETTE-SITEMAP.md` (new §19.15-16)
    - `content/explore/menu-ai-strategy.md` (new file)

- **AI Personalization Feature**
  - By: PM - AI Assistant
  - Via: Cursor
  - Spec: `brand/prompts.md` §13.2, `brand/FOOD-ROULETTE-SITEMAP.md` §19.16
  - Files affected:
    - `docs/food_roulette_erd.drawio.xml` (UserPreference, CircleRecommendation entities)
    - `brand/prompts.md` (new §13.2)
    - `brand/FOOD-ROULETTE-SITEMAP.md` (new §19.16)

- **Vibe Coding Rules**
  - By: PM - AI Assistant
  - Via: Cursor
  - Spec: N/A (process document)
  - Files affected:
    - `VIBE_RULES.md` (new file)
    - `CURSOR_RULES.md` (new file)
    - `AGENTS.md` (updated §10-11)
    - `.cursorrules` (new file)
    - `PROMPT_TEMPLATES/` (new folder)

#### Changed

- **MVP Scope v1.1**
  - By: PM - AI Assistant
  - Via: Cursor
  - Spec: `brand/FOOD-ROULETTE-SITEMAP.md` §19.6
  - Change: Added Menu Capture + AI Personalization to MVP scope

---

### 2026-08-07

### Changed

- **Pricing §4 - Chi tiết đầy đủ (B2C + B2B)**
  - By: AI Assistant
  - Via: Cursor
  - Spec: `brand/prompts.md` §4
  - Files affected:
    - `brand/prompts.md` (updated §4)
  - Change:
    - Thêm 2 mô hình pricing: B2C (Subscription) và B2B (Fixed + PPV)
    - B2C: Free / Pro (59k/tháng hoặc 490k/năm)
    - B2C: Spin Packs (Starter 5/15k, Standard 20/59k, Premium 100/199k)
    - B2B: 4 tiers - Basic (free), Bronze (99k+5k PPV), Silver (199k+4k PPV), Gold (399k+3k PPV)
    - Thêm PPV verification mechanism và billing example
    - Thêm break-even analysis cho B2B
    - Thêm chính sách B2B (trial, guarantee, no per-seat)
  - Source: `content/explore/restaurant-partner-strategy.md`
  - Note: MVP v1.0 chỉ cần Free + Spin Packs + Basic Restaurant Partner

---

## Current Spec Versions

| File | Version | Date | Last Change |
|------|---------|------|-------------|
| `brand/prompts.md` | 2.6 | 2026-08-07 | Updated Pricing §4 with B2C + B2B model |
| `brand/brand.md` | - | - | - |
| `brand/FOOD-ROULETTE-SITEMAP.md` | 2.4 | 2026-08-06 | Added §19.15-16 |
| `backend/prisma/schema.prisma` | 6.0 | 2026-08-09 | Added B2B tables (RestaurantPartner, Corporate) |
| `backend/prisma/migrations/v5.0/complete_schema.sql` | 5.0 | 2026-08-06 | Complete schema (15 tables) |
| `backend/prisma/migrations/v5.0/seed_data.sql` | 5.0 | 2026-08-06 | Seed data for testing |
| `docs/food_roulette_erd.drawio.xml` | 2.5 | 2026-08-06 | Previous version (Menu + AI entities) |
| `docs/food_roulette_erd_v2.6.drawio.xml` | 2.6 | 2026-08-06 | SQL Architecture Review fixes (P0-P2) |
| `docs/food_roulette_erd_v3.0_normalized.xml` | 3.0 | 2026-08-06 | BCNF+4NF Normalized (26 entities) |
| `docs/food_roulette_erd_v4.0_lean_mvp.xml` | 4.0 | 2026-08-06 | LEAN MVP (12 entities) |
| `docs/food_roulette_erd_v4.1_hybrid_mvp.xml` | 4.1 | 2026-08-06 | HYBRID MVP (14 entities) |
| `docs/BCNF_ANALYSIS.md` | 1.1 | 2026-08-06 | BCNF + 4NF analysis |
| `docs/ERD_MIGRATION_NOTES.md` | 1.1 | 2026-08-06 | Added v3.0 4NF migration |
| `VIBE_RULES.md` | 1.0 | 2026-08-06 | Initial version |
| `AGENTS.md` | 1.2 | 2026-08-06 | Added Role Templates |
| `CHANGELOG_SPEC.md` | 1.3 | 2026-08-06 | Added v5.0 migration docs |
| `README.md` | 1.2 | 2026-08-06 | Updated with DB setup |

---

## 2026-08-06

### Added

- **ERD v4.0 Lean MVP**
  - By: AI Assistant
  - Via: Cursor
  - Spec: `docs/food_roulette_erd_v4.0_lean_mvp.xml`
  - Files affected:
    - `docs/food_roulette_erd_v4.0_lean_mvp.xml` (new file - 12 entities)
    - `docs/BCNF_ANALYSIS.md` (updated v1.1)

  **Rationale:**
  - v3.0 had 26 entities (full BCNF+4NF normalization)
  - MVP只需要 10-12 core entities
  - 50% reduction, scale later

  **P0 Core (10 tables):**
  - User, Restaurant, RestaurantHours, RestaurantPhoto
  - Group, GroupMember, SpinSession, Vote
  - SpinWallet, SpinLog

  **P1 Important (2 tables):**
  - Locket, CheckIn

  **P2 Deferred (JSON initially):**
  - Friendship, Menu/MenuItem, UserPreference, Corporate*, TasteBoard, Review

---

### 2026-08-06

### Added

- **ERD v4.1 Hybrid MVP** (Recommended for Production)
  - By: Senior SQL Architect (AI)
  - Via: Cursor
  - Spec: `docs/food_roulette_erd_v4.1_hybrid_mvp.xml`
  - Files affected:
    - `docs/food_roulette_erd_v4.1_hybrid_mvp.xml` (new file - 14 entities)
    - `CHANGELOG_SPEC.md` (updated)

  **Rationale:**
  - v4.0 (12 entities) quá lean, thiếu revenue-critical và security features
  - v3.0 (26 entities) over-engineered cho MVP
  - v4.1 là sweet spot: 14 entities, BCNF compliant, MVP ready

  **v4.1 Changes from v4.0:**
  - ✅ Added: `passwordVersion` on User (security: session invalidation)
  - ✅ Added: `Restaurant.source` ENUM (Google Places vs User Submitted)
  - ✅ Added: `RestaurantPhoto.uploadedBy` + `uploadedAt` (audit trail)
  - ✅ Added: `SpinPack` (revenue-critical: Spin Packs model)
  - ✅ Fixed: `SpinPack → SpinLog` relationship (purchaseId FK → SpinPack)
  - ✅ Added: `Friendship` (social foundation: mutual opt-in)
  - ✅ Added: `SpinSession.initiatorId` (track who started spin)
  - ✅ Fixed: Removed `Group.hostId` redundancy (host via `GroupMember.role = HOST`)
  - ✅ Fixed: `SpinLog` separate FKs instead of polymorphic

  **P0 Core (12 tables):**
  - User (with passwordVersion), Friendship, Restaurant (with source)
  - RestaurantHours (4NF), RestaurantPhoto (4NF)
  - Group (no hostId), GroupMember (with HOST role)
  - SpinSession, Vote, SpinWallet, SpinLog, SpinPack

  **P1 Important (2 tables):**
  - Locket, CheckIn

  **P2 Deferred to v1.2+ (JSON initially):**
  - TasteBoard/TasteBoardItem, Menu/MenuItem, UserPreference, CircleRecommendation
  - B2B: RestaurantPartner, CorporateAccount, CorporateMember, RestaurantVisit

---

### 2026-08-06

### Changed

- **ERD v4.1 Hybrid MVP - Recommended over v3.0 and v4.0**
  - By: Senior SQL Architect (AI)
  - Via: Cursor
  - Reason: v3.0 over-engineered (26 entities), v4.0 underspecified (missing revenue/security)
  - v4.1 is the recommended baseline for Food Roulette MVP

---

### 2026-08-06

### Added

- **ERD v5.0 REVIEWED & OPTIMIZED** (Recommended over v4.1)
  - By: Database Architect (AI)
  - Via: Cursor
  - Spec: `docs/food_roulette_erd_v5.0_reviewed.xml`, `docs/DB_SCHEMA_REVIEW_v5.0.md`
  - Files affected:
    - `docs/food_roulette_erd_v5.0_reviewed.xml` (new file - 15 entities)
    - `docs/DB_SCHEMA_REVIEW_v5.0.md` (new file - complete review report)
    - `backend/prisma/schema.prisma` (updated to v5.0)

  **Rationale:**
  - v4.1 (14 entities) có 4 critical issues cần fix trước MVP launch
  - v5.0 là bản đã review + optimize, production-ready

  **v5.0 Critical Fixes (4 issues):**
  1. 🔴 **SpinSessionCandidate** (NEW TABLE) - Replaces `candidateIds` JSON
     - FK integrity, queryable, proper N-N relationship
  2. 🔴 **CheckIn index fix** - Added `[userId, status, expiresAt]`
     - Critical query: `WHERE userId=? AND status='ACTIVE' AND expiresAt > NOW()`
  3. 🔴 **RestaurantHours DateTime** - Fixed to `VARCHAR(5)` format
     - MySQL không hỗ trợ `DateTime @db.Time`
  4. 🔴 **SpinWallet BigInt** - Changed from `Int` to `BigInt`
     - Overflow protection for large balance values

  **v5.0 Medium Priority Fixes:**
  - ✅ Restaurant lat/lng: Float → Decimal(10,8)/Decimal(11,8)
  - ✅ Locket visibility index: Added `[visibility, capturedAt]`
  - ✅ Vote tally index: Added `[spinSessionId, value]`
  - ✅ Friendship status index: Added `[status]`

  **v5.0 New Fields Added (10 fields):**
  - User: `phone`, `isOnboarded`, `lastActiveAt`
  - Restaurant: `googlePlaceId`, `rating`, `phone`
  - GroupMember: `invitedBy`
  - SpinSession: `categoryFilter`
  - SpinWallet: `version` (optimistic locking)
  - Locket: `exifStripped`
  - CheckIn: `verificationMethod`, `accuracy`

  **Required MySQL Triggers (4 triggers):**
  1. SpinWallet: `balance >= 0`
  2. GroupMember: `count <= 20`
  3. Locket: `capturedAt within 60s`
  4. CheckIn: auto-expiration EVENT

  **Entity Count:**
  - P0 CORE: 13 tables (+1 SpinSessionCandidate)
  - P1 IMPORTANT: 2 tables (Locket, CheckIn)
  - P2 DEFERRED: TasteBoard, Menu, AI, B2B...
  - **TOTAL v5.0: 15 tables (BCNF/4NF compliant)**

---

## 2026-08-06

### Added

- **Database v5.0 - Complete Schema & Seed Data**
  - By: AI Assistant
  - Via: Cursor
  - Files affected:
    - `backend/prisma/migrations/v5.0/000_create_database.sql` (new)
    - `backend/prisma/migrations/v5.0/complete_schema.sql` (new - 15 tables)
    - `backend/prisma/migrations/v5.0/seed_data.sql` (new - test data)
    - `backend/prisma/migrations/v5.0/csv_data/` (import scripts)
    - `backend/prisma/schema.prisma` (synced with v5.0)
    - `CHANGELOG_SPEC.md` (this update)
    - `README.md` (updated with DB setup)

  **Tables Created (15):**
  - P0 Core: users, restaurants, restaurant_hours, restaurant_photos
  - P0 Social: friendships
  - P0 Spin: spin_groups, group_members, spin_sessions, spin_session_candidates, votes, spin_wallets, spin_logs
  - P1 Feature: lockets, check_ins
  - P1 Purchase: spin_packs

  **Seed Data Verified:**
  - 5 users (1 steward, 4 test users)
  - 10 restaurants (9 approved, 1 pending)
  - 3 friendships (all accepted)
  - 1 spin group (3 members)
  - 4 spin wallets
  - 5 spin sessions (mix of personal/group, various statuses)
  - 5 votes (accept/reject)
  - 5 lockets (public/friends/private)
  - 3 check-ins (completed/pending)

  **Validation Queries (6 queries):**
  - Query 1: Group Spin Complete Workflow (session → candidates → votes → result)
  - Query 2: Locket Feed with Visibility Rules (PUBLIC/FRIENDS/PRIVATE)
  - Query 3: Check-in Verification Complex (GPS + Locket + Restaurant matching)
  - Query 4: Spin Wallet Audit Trail (running balance + integrity check)
  - Query 5: Restaurant Recommendation Engine (eligibility scoring)
  - Bonus: Friendship Network Analysis (mutual friends)

---

## Team Roles

| Role | Người | Trách nhiệm |
|------|-------|-------------|
| PM / Architecture Lead | Đặng Tuấn Anh | Spec, review, architecture, AI architecture, Circle Recommendation |
| Frontend Lead | Lê Văn Hoàng Hiếu | UI/UX design, animation, AI Suggestion UI |
| Content + AI Frontend | Trần Gia Bình | UI screens, copywriting, Menu Review UI, AI Feedback UX |
| Backend Lead + AI | Lê Huy Trường | API, database, AI OCR pipeline, AI Suggestion backend |
| DevOps + AI Support | Nguyễn Thành Nam | CI/CD, testing, AI pipeline deployment, User Preference learning |

*Lưu ý: Mỗi người tự chọn AI tool phù hợp với công việc của mình*

---

*Auto-generated · 2026-08-06*
