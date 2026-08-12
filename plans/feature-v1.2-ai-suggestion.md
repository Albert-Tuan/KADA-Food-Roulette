# Feature Plan: AI Suggestion Engine

## Overview
Mở rộng AI suggestion để gợi ý món ăn dựa trên khẩu vị và context.

## User Stories
- US-090: AI gợi ý best match cho group
- US-092: Taste Radar (biểu đồ khẩu vị)

## Architecture Decisions
- **Learning:** Hybrid (real-time + batch)
- **Algorithm:** Weighted collaborative filtering + content-based
- **Context factors:** Time, weather, location, group size

---

## Task List

### Phase 1: Enhanced Preference Learning

#### Task 1: Spin History Analysis
**Description:** Phân tích spin history để learn preferences

**Acceptance criteria:**
- [ ] Analyze which restaurants user spins to
- [ ] Track rejected vs accepted spins
- [ ] Weight by recency
- [ ] Update preference scores

**Verification:**
- [ ] Preferences update after spins
- [ ] Scores reflect actual behavior

**Dependencies:** None

**Files likely touched:**
- `backend/src/shared/preferenceLearner.service.ts`

**Estimated scope:** Medium (2 files)

---

#### Task 2: Contextual Factors
**Description:** Thêm context factors vào suggestion

**Acceptance criteria:**
- [ ] Time of day (breakfast/lunch/dinner)
- [ ] Day of week (weekday/weekend)
- [ ] Weather (nếu có API)
- [ ] Group size và composition

**Verification:**
- [ ] Suggestions vary by context
- [ ] Context data available

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/circle/circle.service.ts`

**Estimated scope:** Small (1-2 files)

---

### Phase 2: Taste Radar

#### Task 3: Taste Profile API
**Description:** API để get taste profile visualization data

**Acceptance criteria:**
- [ ] `GET /api/users/:id/taste-profile` return radar data
- [ ] Categories: cuisine, flavor, diet, price
- [ ] 0-100 scale per dimension

**Verification:**
- [ ] API returns correct data structure
- [ ] Visualization data accurate

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`

**Estimated scope:** Small (2 files)

---

#### Task 4: Taste Radar Component (Mobile)
**Description:** Radar chart để hiển thị taste profile

**Acceptance criteria:**
- [ ] Radar chart component
- [ ] Animated on load
- [ ] Interactive (tap to see detail)
- [ ] Responsive sizing

**Verification:**
- [ ] Chart renders correctly
- [ ] Animation smooth

**Dependencies:** Task 3

**Files likely touched:**
- `apps/mobile/src/components/TasteRadar.tsx`
- `apps/mobile/app/profile/taste-radar.tsx`

**Estimated scope:** Medium (2-3 files)

---

#### Task 5: Taste Radar Component (Web)
**Description:** Radar chart cho web

**Acceptance criteria:**
- [ ] Chart.js hoặc D3.js radar chart
- [ ] Responsive
- [ ] Hover interactions

**Verification:**
- [ ] Chart renders correctly
- [ ] Hover works

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/src/components/profile/TasteRadar.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-5
- [ ] Preference learning enhanced
- [ ] Taste Radar displays correctly
- [ ] Suggestions improve over time

---

### Phase 3: Enhanced Group Suggestions

#### Task 6: Group Preference Merge
**Description:** Merge preferences của all group members

**Acceptance criteria:**
- [ ] Get preferences for all group members
- [ ] Find intersection (items everyone likes)
- [ ] Find union (items someone likes)
- [ ] Rank by combined score

**Verification:**
- [ ] Merged preferences make sense
- [ ] Fair suggestions for all members

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/circle/circle.service.ts`

**Estimated scope:** Small (1-2 files)

---

#### Task 7: Conflict Resolution
**Description:** Handle conflicts khi group can't agree

**Acceptance criteria:**
- [ ] Detect when no common preferences
- [ ] Suggest compromise options
- [ ] Voting mechanism suggestion

**Verification:**
- [ ] Conflicts detected correctly
- [ ] Suggestions fair

**Dependencies:** Task 6

**Files likely touched:**
- `backend/src/modules/circle/circle.service.ts`

**Estimated scope:** Small (1 file)

---

### Checkpoint: Complete
- [ ] AI suggestions improved
- [ ] Taste Radar implemented
- [ ] Group preferences merge works
- [ ] Tests pass

---

## Total Effort
- Backend Enhancement: 6h
- Mobile Taste Radar: 4h
- Web Taste Radar: 2h
- **Total: ~12h**

---

## Open Questions
- Có cần A/B testing cho suggestion algorithm không?
- User có thể manually override preferences không?
- Có cần "explore mode" để suggest outside preferences không?
