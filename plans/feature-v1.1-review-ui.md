# Feature Plan: Review UI

## Overview
Hoàn thiện UI để viết và xem reviews cho nhà hàng.

## User Stories
- US-050: Viết review cho quán
- US-051: Đánh giá chi tiết (vị/phục vụ/giá)
- US-052: Upload ảnh đi kèm
- US-053: Filter review + Recommend feed

## Architecture Decisions
- **Photo upload:** Sử dụng existing locket upload infrastructure
- **Rating breakdown:** 3 sub-ratings (food, service, price) + overall
- **Feed algorithm:** Sort by: newest, highest rated, most helpful

---

## Task List

### Phase 1: Backend Enhancement

#### Task 1: Review Photo Upload
**Description:** Thêm endpoint upload ảnh cho review

**Acceptance criteria:**
- [ ] `POST /api/reviews/:id/photos` upload ảnh
- [ ] Support multiple photos (max 5)
- [ ] Return photo URLs
- [ ] Compress/resize ảnh

**Verification:**
- [ ] Upload works
- [ ] Photos display in review

**Dependencies:** None

**Files likely touched:**
- `backend/src/modules/reviews/reviews.controller.ts`
- `backend/src/modules/reviews/reviews.service.ts`

**Estimated scope:** Small (2-3 files)

---

### Phase 2: Mobile Review Screens

#### Task 2: Write Review Screen
**Description:** Screen để viết review cho restaurant

**Acceptance criteria:**
- [ ] Restaurant info header
- [ ] Overall rating (1-5 stars)
- [ ] Rating breakdown (food, service, price)
- [ ] Text review input
- [ ] Photo upload (max 5)
- [ ] Submit button

**Verification:**
- [ ] All inputs work
- [ ] Validation before submit
- [ ] Success/error feedback

**Dependencies:** Task 1

**Files likely touched:**
- `apps/mobile/app/restaurant/[id]/review.tsx`
- `apps/mobile/src/components/StarRating.tsx`
- `apps/mobile/src/components/ReviewPhotoUpload.tsx`

**Estimated scope:** Medium (3-4 files)

---

#### Task 3: Review List Screen
**Description:** Screen hiển thị danh sách reviews

**Acceptance criteria:**
- [ ] List of review cards
- [ ] Sort options (newest, highest, most helpful)
- [ ] Filter by rating
- [ ] Pagination / infinite scroll
- [ ] Pull to refresh

**Verification:**
- [ ] List renders efficiently
- [ ] Filters work
- [ ] Pagination works

**Dependencies:** None (basic list)

**Files likely touched:**
- `apps/mobile/app/restaurant/[id]/reviews.tsx`
- `apps/mobile/src/components/ReviewCard.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 4: Review Card Component
**Description:** Reusable review card component

**Acceptance criteria:**
- [ ] User avatar + name
- [ ] Overall rating display
- [ ] Rating breakdown (small bars)
- [ ] Review text (truncated)
- [ ] Photos thumbnail grid
- [ ] Date posted
- [ ] Helpful button

**Verification:**
- [ ] Card displays correctly
- [ ] Photos expand on tap

**Dependencies:** None

**Files likely touched:**
- `apps/mobile/src/components/ReviewCard.tsx`

**Estimated scope:** Small (1-2 files)

---

### Checkpoint: After Tasks 1-4
- [ ] Review CRUD works
- [ ] Photo upload works
- [ ] List renders correctly
- [ ] Filters work

---

### Phase 3: Web Review Components

#### Task 5: Web Write Review Modal
**Description:** Modal để viết review trên web

**Acceptance criteria:**
- [ ] Modal overlay
- [ ] Form với all fields
- [ ] Photo preview
- [ ] Star rating component
- [ ] Submit/Cancel actions

**Verification:**
- [ ] Modal opens/closes correctly
- [ ] Form validation works

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/reviews/WriteReviewModal.tsx`
- `apps/web/src/components/reviews/StarRating.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 6: Web Review List
**Description:** Review list component cho web

**Acceptance criteria:**
- [ ] Sidebar filter panel
- [ ] Review list
- [ ] Pagination
- [ ] Expandable review text

**Verification:**
- [ ] Filters update list
- [ ] Responsive layout

**Dependencies:** None

**Files likely touched:**
- `apps/web/src/components/reviews/ReviewList.tsx`
- `apps/web/src/components/reviews/ReviewFilter.tsx`

**Estimated scope:** Small (2-3 files)

---

### Checkpoint: Complete
- [ ] Mobile review screens complete
- [ ] Web review components complete
- [ ] Tests pass
- [ ] Ready for review

---

## Total Effort
- Backend Photo Upload: 2h
- Mobile Review UI: 8h
- Web Review UI: 4h
- **Total: ~14h**

---

## Open Questions
- Review moderation (AI) có cần trước khi publish không?
- Có cần "report review" feature không?
- Recommend feed algorithm cụ thể là gì?
