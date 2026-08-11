# Feature Plan: Onboarding Flow

## Overview
Hoàn thiện onboarding flow để user có thể thiết lập profile đầy đủ khi lần đầu sử dụng app.

## User Stories
- US-010: Thiết lập vị trí (GPS)
- US-011: Chọn cuisine preferences
- US-012: Đặt display_name private & public
- US-013: Chọn avatar
- US-014: Chọn dietary preferences (chay/vegan/halal)

## Architecture Decisions
- **Flow type:** Linear step-by-step wizard (5 steps)
- **State management:** AsyncStorage để lưu tạm, sync lên server khi complete
- **Skip option:** User có thể skip nhưng bị nhắc lại sau

---

## Task List

### Phase 1: Backend API

#### Task 1: Preference Endpoints
**Description:** Thêm API để save/retrieve user preferences (cuisine, dietary, avatar)

**Acceptance criteria:**
- [ ] `GET /api/users/:id/preferences` trả về preferences của user
- [ ] `PUT /api/users/:id/preferences` cập nhật preferences
- [ ] Upload avatar endpoint hoạt động

**Verification:**
- [ ] API test pass với mock data

**Dependencies:** None

**Files likely touched:**
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`
- `backend/src/modules/users/users.routes.ts`

**Estimated scope:** Medium (3-5 files)

---

### Phase 2: Mobile Screens

#### Task 2: Onboarding Container
**Description:** Tạo onboarding navigation container với step tracking

**Acceptance criteria:**
- [ ] OnboardingContext để track current step
- [ ] Progress indicator (dots hoặc progress bar)
- [ ] Navigation: next, back, skip

**Verification:**
- [ ] Có thể navigate giữa các steps
- [ ] State được persist khi tạm thoát app

**Dependencies:** Task 1

**Files likely touched:**
- `apps/mobile/app/onboarding/_layout.tsx`
- `apps/mobile/app/onboarding/context.tsx`
- `apps/mobile/src/stores/onboardingStore.ts`

**Estimated scope:** Small (2-3 files)

---

#### Task 3: Step 1 - GPS Permission
**Description:** Screen yêu cầu GPS permission và lấy location

**Acceptance criteria:**
- [ ] Permission request dialog đẹp
- [ ] Handle permission denied gracefully
- [ ] Show current location sau khi được allow
- [ ] Continue button chỉ enable khi có location

**Verification:**
- [ ] Test với permission granted
- [ ] Test với permission denied

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/onboarding/01-location.tsx`
- `apps/mobile/src/hooks/useLocation.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 4: Step 2 - Cuisine Preferences
**Description:** Screen chọn cuisine preferences (multi-select)

**Acceptance criteria:**
- [ ] Grid/List các cuisine options (Việt, Nhật, Trung, Hàn, Ý, Mỹ, Ấn, Thái...)
- [ ] Multi-select với visual feedback
- [ ] Min 1 selection required
- [ ] "Không thích" options để exclude

**Verification:**
- [ ] Có thể chọn nhiều cuisines
- [ ] Data được save vào context

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/onboarding/02-cuisine.tsx`
- `apps/mobile/src/components/CuisineChip.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 5: Step 3 - Display Names
**Description:** Screen đặt display_name private và public

**Acceptance criteria:**
- [ ] Input cho display_name_private (chỉ bạn bè thấy)
- [ ] Input cho display_name_public (ai cũng thấy)
- [ ] Validation: 2-20 ký tự, không trùng
- [ ] Preview như profile card

**Verification:**
- [ ] Validation hoạt động đúng
- [ ] Preview hiển thị chính xác

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/onboarding/03-names.tsx`

**Estimated scope:** Small (1-2 files)

---

#### Task 6: Step 4 - Avatar Selection
**Description:** Screen chọn avatar

**Acceptance criteria:**
- [ ] Upload từ gallery
- [ ] Chụp từ camera
- [ ] Chọn từ preset avatars
- [ ] Crop/scale image
- [ ] Preview avatar đã chọn

**Verification:**
- [ ] Upload image hoạt động
- [ ] Preview hiển thị đúng

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/onboarding/04-avatar.tsx`
- `apps/mobile/src/components/AvatarPicker.tsx`

**Estimated scope:** Medium (2-3 files)

---

#### Task 7: Step 5 - Dietary Preferences
**Description:** Screen chọn dietary preferences

**Acceptance criteria:**
- [ ] Options: Chay, Vegan, Halal, Không gluten, Không đường...
- [ ] Multi-select
- [ ] Explanation text cho mỗi option
- [ ] Optional (có thể skip)

**Verification:**
- [ ] Có thể chọn nhiều dietary options
- [ ] Skip button hoạt động

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/onboarding/05-dietary.tsx`

**Estimated scope:** Small (1-2 files)

---

#### Task 8: Onboarding Complete Screen
**Description:** Celebration screen khi hoàn thành onboarding

**Acceptance criteria:**
- [ ] Animation/Confetti celebration
- [ ] Summary của preferences đã chọn
- [ ] "Bắt đầu" button để vào app
- [ ] Sync data lên server

**Verification:**
- [ ] Celebration animation smooth
- [ ] Data được sync thành công

**Dependencies:** Task 1, 3, 4, 5, 6, 7

**Files likely touched:**
- `apps/mobile/app/onboarding/complete.tsx`

**Estimated scope:** Small (1-2 files)

---

### Checkpoint: After Tasks 1-8
- [ ] Backend API tests pass
- [ ] All mobile screens render without errors
- [ ] Navigation flow works end-to-end
- [ ] Data persistence works across app restarts

---

### Phase 3: Web Onboarding

#### Task 9: Web Onboarding Flow
**Description:** Onboarding flow cho web version

**Acceptance criteria:**
- [ ] Similar steps như mobile nhưng responsive
- [ ] Desktop-optimized UI
- [ ] Step indicator navigation

**Verification:**
- [ ] Web page responsive
- [ ] All steps navigable

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/onboarding/`
- `apps/web/src/components/onboarding/`

**Estimated scope:** Medium (5-8 files)

---

### Checkpoint: Complete
- [ ] Mobile onboarding flow complete
- [ ] Web onboarding flow complete
- [ ] Integration test pass
- [ ] Ready for review

---

## Total Effort
- Backend API: 4h
- Mobile Screens: 12h
- Web Flow: 6h
- **Total: ~22h**

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| GPS permission deny | Med | Provide manual location input option |
| Image upload fail | Low | Retry mechanism + error message |
| Web camera not available | Low | Focus on file upload + preset avatars |

---

## Open Questions
- Nên cho phép skip hoàn toàn hay bắt buộc complete?
- Avatar preset list từ đâu? (cần design assets)
- Nên lưu preferences vào local trước hay call API ngay?
