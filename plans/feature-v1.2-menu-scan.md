# Feature Plan: Menu Scan + Taste Filter

## Overview
Cho phép user quét menu của nhà hàng, AI phân tích và lọc các món ăn theo khẩu vị cá nhân.

## User Stories
- US-100: Chụp menu (AI OCR)
- US-101: Parse menu items
- US-102: Spin với món từ menu

## Architecture Decisions
- **OCR Engine:** Tesseract (đã có trong codebase)
- **Parser:** Custom Vietnamese menu parser (đã có)
- **Taste Matching:** Custom algorithm (weighted tag matching)
- **Storage:** ScannedMenu table để cache results

---

## Task List

### Phase 1: Database Schema

#### Task 1: ScannedMenu Tables
**Description:** Thêm bảng để lưu scanned menu data

**Acceptance criteria:**
- [ ] `ScannedMenu` table với userId, restaurantId, imageUrl
- [ ] `ScannedMenuItem` table với parsed items
- [ ] `UserPreferenceTag` table để lưu taste tags
- [ ] Migration chạy thành công

**Verification:**
- [ ] Migration applies cleanly
- [ ] Tables created with correct indexes

**Dependencies:** None

**Files likely touched:**
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

**Estimated scope:** Medium (2 files)

---

### Phase 2: Backend API

#### Task 2: Menu Scan Endpoint
**Description:** API để scan menu image

**Acceptance criteria:**
- [ ] `POST /api/menu/scan` nhận image, OCR, parse
- [ ] Store results in ScannedMenu
- [ ] Return parsed items
- [ ] Calculate taste match scores

**Verification:**
- [ ] OCR extracts text correctly
- [ ] Parser identifies dishes
- [ ] Items saved to database

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/menu/menu.controller.ts`
- `backend/src/modules/menu/menu.service.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 3: Taste Filter API
**Description:** API để filter scanned menu items by taste

**Acceptance criteria:**
- [ ] `GET /api/menu/scan/:id/filter` nhận taste preferences
- [ ] Return items sorted by match score
- [ ] Include matched/missing tags

**Verification:**
- [ ] Filter returns relevant items
- [ ] Scores calculate correctly

**Dependencies:** Task 2

**Files likely touched:**
- `backend/src/modules/menu/menu.service.ts`

**Estimated scope:** Small (1-2 files)

---

#### Task 4: Preference Tags API
**Description:** API để manage user taste tags

**Acceptance criteria:**
- [ ] `GET /api/preferences/tags` get user's tags
- [ ] `POST /api/preferences/tags` update tags
- [ ] Tags có weight (0-1)

**Verification:**
- [ ] CRUD operations work
- [ ] Tags persist across sessions

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/preferences/preferences.controller.ts`
- `backend/src/modules/preferences/preferences.service.ts`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-4
- [ ] Database migration passes
- [ ] API endpoints work
- [ ] OCR + parsing accurate

---

### Phase 3: Mobile UI

#### Task 5: Menu Capture Screen
**Description:** Screen để chụp menu

**Acceptance criteria:**
- [ ] Camera view cho chụp menu
- [ ] Option chọn từ gallery
- [ ] Preview image before submit
- [ ] Loading state during OCR

**Verification:**
- [ ] Camera works
- [ ] Image submits correctly

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/menu/scan.tsx`
- `apps/mobile/src/components/MenuCapture.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 6: Scan Result Screen
**Description:** Screen hiển thị kết quả scan

**Acceptance criteria:**
- [ ] List of parsed items
- [ ] Match score display
- [ ] Filter/sort options
- [ ] Add item to spin candidates

**Verification:**
- [ ] Items display correctly
- [ ] Scores visible

**Dependencies:** Task 3

**Files likely touched:**
- `apps/mobile/app/menu/result.tsx`
- `apps/mobile/src/components/MenuItemCard.tsx`

**Estimated scope:** Medium (2-3 files)

---

#### Task 7: Taste Preferences Editor
**Description:** Screen để edit taste preferences

**Acceptance criteria:**
- [ ] List of available tags
- [ ] Select/deselect tags
- [ ] Weight slider per tag
- [ ] Save preferences

**Verification:**
- [ ] Tags save correctly
- [ ] Updates reflect in filter results

**Dependencies:** Task 4

**Files likely touched:**
- `apps/mobile/app/profile/taste-preferences.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 8: Spin from Menu
**Description:** Integration để spin với menu items

**Acceptance criteria:**
- [ ] Add menu items to spin candidates
- [ ] Spin only those items
- [ ] Filter by taste before spin

**Verification:**
- [ ] Items appear in spin wheel
- [ ] Spin works correctly

**Dependencies:** Task 5, 6

**Files likely touched:**
- `apps/mobile/app/spin/from-menu.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 5-8
- [ ] Menu capture works
- [ ] Scan results display
- [ ] Taste filter works
- [ ] Spin from menu works

---

### Phase 4: Web UI

#### Task 9: Web Menu Scanner
**Description:** Web component để scan menu

**Acceptance criteria:**
- [ ] File upload for menu image
- [ ] Preview and submit
- [ ] Results display

**Verification:**
- [ ] Upload works
- [ ] Results display correctly

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/menu/MenuScanner.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: Complete
- [ ] Backend API complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] Integration tests pass

---

## Total Effort
- Database Schema: 2h
- Backend API: 6h
- Mobile UI: 10h
- Web UI: 4h
- **Total: ~22h**

---

## Open Questions
- Có nên lưu scanned menu indefinitely hay có expiration?
- AI suggestion để gợi ý items không có trong menu?
- Có cần option để manual edit parsed items không?
