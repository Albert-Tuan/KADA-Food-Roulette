# Feature Plan: AI Moderation

## Overview
Tự động kiểm duyệt review và locket content bằng AI để detect inappropriate content.

## User Stories
- US-110: Kiểm duyệt review bằng AI
- US-111: Kiểm duyệt locket bằng AI

## Architecture Decisions
- **Text Moderation:** OpenAI Moderation API hoặc Perspective API
- **Image Moderation:** Google Cloud Vision API hoặc AWS Rekognition
- **Workflow:** Auto-flag → Human review queue → Action

---

## Task List

### Phase 1: Backend Infrastructure

#### Task 1: Moderation Service
**Description:** Service để check content với AI

**Acceptance criteria:**
- [ ] `checkTextModeration(text)` function
- [ ] `checkImageModeration(imageUrl)` function
- [ ] Return flags và confidence scores
- [ ] Handle API errors gracefully

**Verification:**
- [ ] Flags inappropriate content correctly
- [ ] No false positives on normal content

**Dependencies:** None

**Files likely touched:**
- `backend/src/shared/moderation.service.ts`
- `backend/src/lib/moderation.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 2: Moderation Queue
**Description:** Database và API cho moderation queue

**Acceptance criteria:**
- [ ] `ModerationQueue` table
- [ ] Auto-add flagged content to queue
- [ ] `GET /api/moderation/queue` list items
- [ ] `POST /api/moderation/:id/approve` approve
- [ ] `POST /api/moderation/:id/reject` reject

**Verification:**
- [ ] Items added to queue when flagged
- [ ] Actions work correctly

**Dependencies:** Task 1

**Files likely touched:**
- `backend/prisma/schema.prisma`
- `backend/src/modules/moderation/moderation.controller.ts`
- `backend/src/modules/moderation/moderation.service.ts`

**Estimated scope:** Medium (3-4 files)

---

#### Task 3: Hook into Review/Locket Flow
**Description:** Integrate moderation vào existing flows

**Acceptance criteria:**
- [ ] Review creation → auto-moderate
- [ ] Locket creation → auto-moderate
- [ ] Auto-hide content if confidence > 0.9
- [ ] Queue for human review if confidence < 0.9

**Verification:**
- [ ] New reviews checked automatically
- [ ] New lockets checked automatically

**Dependencies:** Task 2

**Files likely touched:**
- `backend/src/modules/reviews/reviews.service.ts`
- `backend/src/modules/lockets/lockets.service.ts`

**Estimated scope:** Small (2-3 files)

---

### Checkpoint: After Tasks 1-3
- [ ] Moderation service works
- [ ] Queue system works
- [ ] Integration with review/locket works

---

### Phase 2: Steward Moderation Dashboard

#### Task 4: Moderation Dashboard
**Description:** Dashboard để review flagged content

**Acceptance criteria:**
- [ ] List of flagged items
- [ ] Show flagged content + AI analysis
- [ ] Approve/Reject actions
- [ ] Reason input for rejection
- [ ] Filter by type (review/locket)

**Verification:**
- [ ] Dashboard displays correctly
- [ ] Actions update status

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/pages/steward/moderation/index.tsx`
- `apps/web/src/components/steward/ModerationItem.tsx`

**Estimated scope:** Medium (3-4 files)

---

#### Task 5: Moderation Stats
**Description:** Stats cho moderation overview

**Acceptance criteria:**
- [ ] Total flagged count
- [ ] Pending review count
- [ ] Approved/rejected counts
- [ ] Trend chart

**Verification:**
- [ ] Stats calculate correctly
- [ ] Chart displays

**Dependencies:** Task 4

**Files likely touched:**
- `apps/web/src/pages/steward/moderation/stats.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: Complete
- [ ] Backend moderation complete
- [ ] Dashboard complete
- [ ] Integration works
- [ ] Ready for review

---

## Total Effort
- Backend Moderation Service: 6h
- Queue System: 4h
- Dashboard: 6h
- **Total: ~16h**

---

## Open Questions
- Dùng service nào? (OpenAI Moderation API free, Google Vision có phí)
- Threshold để auto-hide là bao nhiêu?
- Có cần appeal process không?
