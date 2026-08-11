# Feature Plan: Voice Group Spin

## Overview
Cho phép user trong group bật mic, nói "tôi muốn ăn X" và món đó được tự động thêm vào vòng quay.

## User Stories
- US-032: Quay chung 1 lần (realtime)
- US-033: Vote với voice input

## Architecture Decisions
- **Speech-to-Text:** OpenAI Whisper API (best Vietnamese support)
- **Real-time:** Socket.io (đã có infrastructure)
- **Audio format:** WebM (web) / AAC (mobile)
- **Intent extraction:** Custom regex + keyword matching

---

## Task List

### Phase 1: Database Schema

#### Task 1: Voice Tables
**Description:** Thêm bảng cho voice functionality

**Acceptance criteria:**
- [ ] `VoiceCandidate` table với text, parsedFood, audioUrl
- [ ] `GroupVoiceSettings` table với settings per group
- [ ] Migration chạy thành công

**Verification:**
- [ ] Migration applies cleanly
- [ ] Tables created correctly

**Dependencies:** None

**Files likely touched:**
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`

**Estimated scope:** Small (2 files)

---

### Phase 2: Backend API

#### Task 2: Voice Enable/Disable API
**Description:** API để enable/disable voice mode trong group

**Acceptance criteria:**
- [ ] `POST /api/groups/:id/voice/enable` enable voice
- [ ] `POST /api/groups/:id/voice/disable` disable voice
- [ ] Update GroupVoiceSettings
- [ ] Notify all members via socket

**Verification:**
- [ ] Toggle works
- [ ] Members notified

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/groups/groups.controller.ts`
- `backend/src/modules/groups/groups.service.ts`

**Estimated scope:** Small (2 files)

---

#### Task 3: Speech-to-Text Integration
**Description:** Tích hợp Whisper API để transcribe audio

**Acceptance criteria:**
- [ ] `POST /api/groups/:id/voice/transcribe` nhận audio
- [ ] Call Whisper API
- [ ] Return transcribed text
- [ ] Support Vietnamese language

**Verification:**
- [ ] Transcription accurate for Vietnamese
- [ ] Error handling works

**Dependencies:** Task 2

**Files likely touched:**
- `backend/src/shared/speech.service.ts`
- `backend/src/modules/groups/groups.service.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 4: Intent Extraction
**Description:** Extract food intent từ transcribed text

**Acceptance criteria:**
- [ ] Detect intent: "muốn ăn", "thích", "gợi ý"
- [ ] Extract food name từ text
- [ ] Return confidence score
- [ ] Search database for matching food

**Verification:**
- [ ] Extracts food names correctly
- [ ] Confidence scores reasonable

**Dependencies:** Task 3

**Files likely touched:**
- `backend/src/shared/intentExtractor.service.ts`

**Estimated scope:** Medium (2 files)

---

#### Task 5: Voice Candidate API
**Description:** API để add/remove voice candidates

**Acceptance criteria:**
- [ ] `POST /api/groups/:id/voice/candidates` add candidate
- [ ] `DELETE /api/groups/:id/voice/candidates/:id` remove
- [ ] `GET /api/groups/:id/voice/candidates` list
- [ ] Broadcast to all members via socket

**Verification:**
- [ ] Candidates added/removed correctly
- [ ] All members see updates

**Dependencies:** Task 4

**Files likely touched:**
- `backend/src/modules/groups/groups.controller.ts`
- `backend/src/modules/groups/groups.service.ts`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-5
- [ ] Database migration passes
- [ ] Voice APIs work
- [ ] Whisper integration works
- [ ] Intent extraction accurate

---

### Phase 3: Mobile UI

#### Task 6: Voice Mic Button
**Description:** Mic button trong group lobby

**Acceptance criteria:**
- [ ] Mic icon button
- [ ] Toggle state (on/off)
- [ ] Visual indicator khi active
- [ ] Permission request

**Verification:**
- [ ] Button displays correctly
- [ ] Toggle works

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/src/components/VoiceMicButton.tsx`
- `apps/mobile/app/group-spin/lobby.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 7: Voice Recording Screen
**Description:** Screen hiển thị khi đang recording

**Acceptance criteria:**
- [ ] Audio visualization (waveform)
- [ ] Real-time transcription preview
- [ ] Detected food display
- [ ] Add/Edit/Skip actions
- [ ] Recording timer

**Verification:**
- [ ] Recording works
- [ ] Visualization smooth
- [ ] Actions work

**Dependencies:** Task 6

**Files likely touched:**
- `apps/mobile/app/group-spin/voice-recording.tsx`
- `apps/mobile/src/components/AudioWaveform.tsx`

**Estimated scope:** Medium (3 files)

---

#### Task 8: Real-time Candidate List
**Description:** Hiển thị candidates từ all members

**Acceptance criteria:**
- [ ] List updates in real-time via socket
- [ ] Show who added each item
- [ ] Remove button per item
- [ ] "AI suggested" indicator

**Verification:**
- [ ] Real-time updates work
- [ ] List accurate

**Dependencies:** Task 5

**Files likely touched:**
- `apps/mobile/src/components/VoiceCandidateList.tsx`
- `apps/mobile/src/hooks/useVoiceCandidates.ts`

**Estimated scope:** Medium (3 files)

---

### Checkpoint: After Tasks 6-8
- [ ] Mobile voice UI works
- [ ] Real-time sync works
- [ ] Recording and transcription accurate

---

### Phase 4: Web UI

#### Task 9: Web Voice Controls
**Description:** Voice controls cho web

**Acceptance criteria:**
- [ ] Mic button component
- [ ] Browser mic permission
- [ ] Recording state UI
- [ ] Transcription display

**Verification:**
- [ ] WebAudio API works
- [ ] Browser permissions handled

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/groups/VoiceMic.tsx`
- `apps/web/src/components/groups/VoiceCandidates.tsx`

**Estimated scope:** Medium (3 files)

---

### Checkpoint: Complete
- [ ] Backend complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] Real-time sync works
- [ ] Integration tests pass

---

## Total Effort
- Database: 2h
- Backend API: 10h
- Mobile UI: 12h
- Web UI: 6h
- **Total: ~30h**

---

## Open Questions
- Max recording time? (recommend 10-15 seconds)
- Max candidates per session? (recommend 20)
- Fallback khi offline? (text input only)
- Có cần transcribe cho all members hay chỉ người nói?
