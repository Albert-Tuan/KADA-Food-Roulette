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