# Feature Plan: In-app Chat

## Overview
Chat trong nhóm để thành viên có thể trao đổi trước/sau khi spin.

## User Stories
- US-140: In-app chat trong nhóm

## Architecture Decisions
- **Protocol:** Socket.io cho real-time messaging
- **Storage:** Store messages in database for history
- **Notifications:** Push notification khi có message mới

---

## Task List

### Phase 1: Database Schema

#### Task 1: Chat Tables
**Description:** Thêm bảng cho chat functionality

**Acceptance criteria:**
- [ ] `ChatRoom` table (group chat per group)
- [ ] `ChatMessage` table với sender, content, timestamp
- [ ] `ChatRead` table để track read status
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

### Phase 2: Backend Socket.io

#### Task 2: Chat Socket Events
**Description:** Socket.io events cho chat

**Acceptance criteria:**
- [ ] `join_room(groupId)` - join group chat
- [ ] `leave_room(groupId)` - leave chat
- [ ] `send_message(groupId, content)` - send message
- [ ] `new_message` event - broadcast to room
- [ ] `typing` event - typing indicator

**Verification:**
- [ ] Messages delivered in real-time
- [ ] Typing indicator works

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/socket/chat.handler.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 3: Chat REST API
**Description:** REST endpoints cho chat history

**Acceptance criteria:**
- [ ] `GET /api/groups/:id/messages` get chat history
- [ ] Pagination support
- [ ] Return read status
- [ ] Mark as read endpoint

**Verification:**
- [ ] History loads correctly
- [ ] Pagination works

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/modules/chat/chat.controller.ts`
- `backend/src/modules/chat/chat.service.ts`

**Estimated scope:** Small (2-3 files)

---

#### Task 4: Message Moderation
**Description:** Basic moderation cho messages

**Acceptance criteria:**
- [ ] Auto-check messages for profanity
- [ ] Block inappropriate content
- [ ] Report message feature
- [ ] Admin can delete messages

**Verification:**
- [ ] Profanity filter works
- [ ] Report feature works

**Dependencies:** Task 2

**Files likely touched:**
- `backend/src/modules/chat/chat.service.ts`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-4
- [ ] Database migration passes
- [ ] Real-time messaging works
- [ ] History loads correctly
- [ ] Basic moderation works

---

### Phase 3: Mobile UI

#### Task 5: Chat Screen
**Description:** Screen hiển thị chat

**Acceptance criteria:**
- [ ] Message list (reversed, newest at bottom)
- [ ] Auto-scroll to new messages
- [ ] Sender avatar + name
- [ ] Timestamp display
- [ ] Pull to load older messages

**Verification:**
- [ ] Messages display correctly
- [ ] Auto-scroll works

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/group/[id]/chat.tsx`
- `apps/mobile/src/components/ChatMessage.tsx`

**Estimated scope:** Medium (3 files)

---

#### Task 6: Chat Input
**Description:** Input component cho sending messages

**Acceptance criteria:**
- [ ] Text input field
- [ ] Send button
- [ ] Emoji support
- [ ] Keyboard handling
- [ ] Typing indicator (send "typing" event)

**Verification:**
- [ ] Input works correctly
- [ ] Keyboard doesn't obscure input

**Dependencies:** Task 5

**Files likely touched:**
- `apps/mobile/src/components/ChatInput.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 7: Real-time Updates
**Description:** Socket integration cho real-time

**Acceptance criteria:**
- [ ] Connect to socket on chat open
- [ ] Disconnect on chat close
- [ ] Handle reconnection
- [ ] Show typing indicators
- [ ] Unread count badge

**Verification:**
- [ ] Real-time updates work
- [ ] Reconnection handles gracefully

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/src/hooks/useChatSocket.ts`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 5-7
- [ ] Chat screen works
- [ ] Real-time updates work
- [ ] Typing indicators work
- [ ] Unread badges work

---

### Phase 4: Web UI

#### Task 8: Web Chat Component
**Description:** Chat component cho web

**Acceptance criteria:**
- [ ] Message list sidebar
- [ ] Chat panel
- [ ] Input area
- [ ] Typing indicators

**Verification:**
- [ ] Chat works on web
- [ ] Responsive layout

**Dependencies:** Task 2

**Files likely touched:**
- `apps/web/src/components/chat/ChatPanel.tsx`
- `apps/web/src/components/chat/ChatMessage.tsx`

**Estimated scope:** Medium (3-4 files)

---

### Checkpoint: Complete
- [ ] Backend complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] Real-time messaging works
- [ ] Integration tests pass

---

## Total Effort
- Database: 2h
- Backend Socket.io: 6h
- Backend REST: 2h
- Mobile UI: 8h
- Web UI: 4h
- **Total: ~22h**

---

## Open Questions
- Message expiration (delete sau bao lâu)?
- Max message length?
- Có cần reactions không?
- Có cần voice/video call không (future)?
