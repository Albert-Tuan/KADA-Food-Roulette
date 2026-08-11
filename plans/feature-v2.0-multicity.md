# Feature Plan: Multi-city Support

## Overview
Mở rộng app để hỗ trợ nhiều thành phố, phục vụ mở rộng kinh doanh.

## User Stories
- US-160: Multi-city support

## Architecture Decisions
- **City data:** City table với regions
- **Content:** City-specific restaurants và content
- **Discovery:** Auto-detect city hoặc manual select

---

## Task List

### Phase 1: Database Schema

#### Task 1: City Tables
**Description:** Thêm bảng cho city data

**Acceptance criteria:**
- [ ] `City` table (HCMC, Hanoi, Danang...)
- [ ] `Region` table (districts for each city)
- [ ] Add cityId to Restaurant
- [ ] Migration chạy thành công

**Verification:**
- [ ] Migration applies cleanly
- [ ] Data model correct

**Dependencies:** None

**Files likely touched:**
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

**Estimated scope:** Small (2 files)

---

### Phase 2: Backend API

#### Task 2: City Endpoints
**Description:** API cho city data

**Acceptance criteria:**
- [ ] `GET /api/cities` get all cities
- [ ] `GET /api/cities/:id/regions` get regions
- [ ] `GET /api/cities/:id/restaurants` get restaurants in city
- [ ] Auto-detect city from IP

**Verification:**
- [ ] APIs return correct data
- [ ] Auto-detect works

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/cities/cities.controller.ts`
- `backend/src/modules/cities/cities.service.ts`

**Estimated scope:** Small (3 files)

---

#### Task 3: User City Preference
**Description:** Lưu city preference của user

**Acceptance criteria:**
- [ ] Add preferredCityId to User
- [ ] `GET /api/users/:id/preferred-city` get preference
- [ ] `PUT /api/users/:id/preferred-city` update
- [ ] Use preferred city for restaurant queries

**Verification:**
- [ ] Preference saves correctly
- [ ] Used in queries

**Dependencies:** Task 2

**Files likely touched:**
- `backend/prisma/schema.prisma`
- `backend/src/modules/users/users.service.ts`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-3
- [ ] Database migration passes
- [ ] City APIs work
- [ ] User preference works

---

### Phase 3: Mobile UI

#### Task 4: City Selector
**Description:** Component để chọn thành phố

**Acceptance criteria:**
- [ ] Dropdown/Picker cho cities
- [ ] Current city display
- [ ] Search cities
- [ ] Auto-detect option

**Verification:**
- [ ] Selector works correctly
- [ ] Search filters cities

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/src/components/CitySelector.tsx`
- `apps/mobile/app/(tabs)/index.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 5: City-specific Content
**Description:** Hiển thị content theo city

**Acceptance criteria:**
- [ ] Filter restaurants by city
- [ ] Filter reviews by city
- [ ] "Nearby" respects city context
- [ ] Empty state cho cities without data

**Verification:**
- [ ] Filters work correctly
- [ ] Empty state displays

**Dependencies:** Task 3

**Files likely touched:**
- `apps/mobile/app/(tabs)/spin.tsx`
- `apps/mobile/app/(tabs)/lockets.tsx`

**Estimated scope:** Small (2-3 files)

---

### Checkpoint: After Tasks 4-5
- [ ] City selector works
- [ ] Content filters by city

---

### Phase 4: Web + Admin

#### Task 6: Web City Filter
**Description:** City filter cho web

**Acceptance criteria:**
- [ ] City dropdown
- [ ] Filter restaurants
- [ ] URL param for SEO (e.g., /restaurants/hcmc)

**Verification:**
- [ ] Filter works
- [ ] URL updates correctly

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/RestaurantFilters.tsx`

**Estimated scope:** Small (1-2 files)

---

#### Task 7: Admin City Management
**Description:** Admin để manage cities

**Acceptance criteria:**
- [ ] Add/edit cities
- [ ] Add/edit regions
- [ ] Assign restaurants to cities
- [ ] View city stats

**Verification:**
- [ ] CRUD works
- [ ] Stats calculate correctly

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/admin/cities/`

**Estimated scope:** Medium (3-4 files)

---

### Checkpoint: Complete
- [ ] Backend complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] Admin panel complete

---

## Total Effort
- Database: 2h
- Backend API: 4h
- Mobile UI: 4h
- Web + Admin: 6h
- **Total: ~16h**

---

## City Data (Initial)

| City | Vietnamese | Code |
|------|------------|------|
| TP. Hồ Chí Minh | Hồ Chí Minh | HCMC |
| Hà Nội | Hà Nội | HANOI |
| Đà Nẵng | Đà Nẵng | DANANG |
| Cần Thơ | Cần Thơ | CANTHO |
| Hải Phòng | Hải Phòng | HAIPHONG |

---

## Open Questions
- Có cần city-specific onboarding không?
- Content có cần translate không?
- Multi-city search (search across cities)?
