# Feature Plan: Steward Dashboard

## Overview
Dashboard cho steward (admin) để duyệt các nhà hàng được user-submitted.

## User Stories
- US-062: Steward dashboard duyệt quán

## Architecture Decisions
- **Access control:** Chỉ user có role `steward` hoặc `admin` mới được truy cập
- **List type:** Pending → Approved/Rejected
- **Batch actions:** Approve/reject multiple items cùng lúc

---

## Task List

### Phase 1: Backend

#### Task 1: Steward API Enhancement
**Description:** Mở rộng steward API để support CRUD operations

**Acceptance criteria:**
- [ ] `GET /api/steward/restaurants?status=pending` trả về danh sách pending
- [ ] `PUT /api/steward/restaurants/:id/approve` approve một quán
- [ ] `PUT /api/steward/restaurants/:id/reject` reject với lý do
- [ ] `GET /api/steward/stats` trả về thống kê
- [ ] Authorization check (chỉ steward/admin)

**Verification:**
- [ ] Unauthorized users nhận 403
- [ ] Approve/Reject cập nhật đúng status

**Dependencies:** None

**Files likely touched:**
- `backend/src/modules/steward/steward.controller.ts`
- `backend/src/modules/steward/steward.service.ts`
- `backend/src/modules/steward/steward.routes.ts`

**Estimated scope:** Medium (3 files)

---

### Phase 2: Web Dashboard

#### Task 2: Steward Layout
**Description:** Layout cho steward dashboard (sidebar + content)

**Acceptance criteria:**
- [ ] Sidebar navigation
- [ ] Header với user info
- [ ] Protected route (redirect nếu không có quyền)

**Verification:**
- [ ] Layout responsive
- [ ] Auth guard hoạt động

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/steward/_layout.tsx`
- `apps/web/src/components/steward/Sidebar.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 3: Pending Restaurants List
**Description:** List view của các restaurants đang chờ duyệt

**Acceptance criteria:**
- [ ] Card hiển thị restaurant info
- [ ] Image preview
- [ ] Submitter info
- [ ] Submission date
- [ ] Quick actions (approve/reject)

**Verification:**
- [ ] List renders correctly
- [ ] Pagination works

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/pages/steward/restaurants/index.tsx`
- `apps/web/src/components/steward/RestaurantCard.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 4: Restaurant Detail View
**Description:** Chi tiết restaurant để review

**Acceptance criteria:**
- [ ] Full restaurant info
- [ ] Photos gallery
- [ ] Location on map
- [ ] Approve/Reject buttons
- [ ] Reject reason input (modal)

**Verification:**
- [ ] All info displays correctly
- [ ] Actions work

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/src/pages/steward/restaurants/[id].tsx`

**Estimated scope:** Small (2 files)

---

#### Task 5: Dashboard Stats
**Description:** Stats overview cho steward

**Acceptance criteria:**
- [ ] Total pending count
- [ ] Approved today/week/month
- [ ] Rejected today/week/month
- [ ] Simple chart visualization

**Verification:**
- [ ] Stats calculate correctly
- [ ] Chart renders

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/pages/steward/index.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-5
- [ ] Backend API works correctly
- [ ] Web dashboard functional
- [ ] Auth guard prevents unauthorized access
- [ ] Actions update database correctly

---

### Phase 3: Mobile Dashboard (Optional for v1.1)

#### Task 6: Mobile Steward App
**Description:** Simplified steward dashboard cho mobile

**Acceptance criteria:**
- [ ] Simple list view
- [ ] Pull to refresh
- [ ] Swipe to approve/reject
- [ ] Notification khi có new submissions

**Verification:**
- [ ] Mobile-optimized UI
- [ ] Touch gestures work

**Dependencies:** Task 1

**Files likely touched:**
- `apps/mobile/app/steward/index.tsx`

**Estimated scope:** Medium (3-4 files)

---

### Checkpoint: Complete
- [ ] Web dashboard production-ready
- [ ] Mobile dashboard (if implemented)
- [ ] Tests pass
- [ ] Ready for review

---

## Total Effort
- Backend: 4h
- Web Dashboard: 8h
- Mobile Dashboard: 4h
- **Total: ~16h**

---

## Open Questions
- Có cần mobile dashboard không? (có thể dùng web trên mobile)
- Steward có thể edit restaurant info không?
- Có cần notification cho steward khi có submission mới không?
