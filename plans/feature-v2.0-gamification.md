# Feature Plan: Gamification (Streaks + Badges)

## Overview
Thêm gamification elements để tăng engagement: streaks và achievement badges.

## User Stories
- US-130: Streaks (7 ngày liên tiếp)
- US-131: Achievement badges

## Architecture Decisions
- **Streak tracking:** Daily check-in based on spin/check-in activity
- **Badge types:** Activity badges, milestone badges, secret badges
- **Points system:** XP per action, levels

---

## Task List

### Phase 1: Database Schema

#### Task 1: Gamification Tables
**Description:** Thêm bảng cho streaks, achievements, XP

**Acceptance criteria:**
- [ ] `UserStreak` table với current/longest streak
- [ ] `Achievement` table (master data)
- [ ] `UserAchievement` table (earned achievements)
- [ ] `UserXP` table với level calculation
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

### Phase 2: Backend Services

#### Task 2: Streak Service
**Description:** Service để track và calculate streaks

**Acceptance criteria:**
- [ ] `checkIn(userId)` - called on spin/check-in
- [ ] Calculate current streak
- [ ] Update longest streak if needed
- [ ] Reset streak if gap > 1 day
- [ ] Return streak status

**Verification:**
- [ ] Streak increments correctly
- [ ] Streak resets after gap
- [ ] Longest streak updates

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/shared/streak.service.ts`
- `backend/src/modules/checkin/checkin.service.ts`

**Estimated scope:** Medium (2 files)

---

#### Task 3: Achievement Service
**Description:** Service để evaluate và award achievements

**Acceptance criteria:**
- [ ] `evaluateAchievements(userId, action)` - check after each action
- [ ] Achievement definitions (code, name, condition)
- [ ] Award achievement if condition met
- [ ] Return new achievements
- [ ] Support milestone achievements

**Verification:**
- [ ] Achievements awarded correctly
- [ ] No duplicate awards

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/shared/achievement.service.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 4: XP & Level Service
**Description:** Service để calculate XP và levels

**Acceptance criteria:**
- [ ] `awardXP(userId, amount, reason)` - award XP
- [ ] Level calculation (XP thresholds)
- [ ] `getLevelInfo(userId)` - current level, XP to next
- [ ] Level-up notification

**Verification:**
- [ ] XP calculates correctly
- [ ] Level thresholds work

**Dependencies:** Task 1

**Files likely touched:**
- `backend/src/shared/xp.service.ts`

**Estimated scope:** Small (2 files)

---

#### Task 5: Gamification API
**Description:** API endpoints cho gamification data

**Acceptance criteria:**
- [ ] `GET /api/users/:id/streak` get streak info
- [ ] `GET /api/users/:id/achievements` get achievements
- [ ] `GET /api/users/:id/leaderboard` get XP leaderboard
- [ ] `GET /api/achievements` get all achievements (for display)

**Verification:**
- [ ] APIs return correct data
- [ ] Leaderboard ranks correctly

**Dependencies:** Task 2, 3, 4

**Files likely touched:**
- `backend/src/modules/gamification/gamification.controller.ts`
- `backend/src/modules/gamification/gamification.routes.ts`

**Estimated scope:** Small (2-3 files)

---

### Checkpoint: After Tasks 1-5
- [ ] Database migration passes
- [ ] Streak tracking works
- [ ] Achievements awarded correctly
- [ ] XP and levels calculate correctly

---

### Phase 3: Mobile UI

#### Task 6: Streak Display
**Description:** Hiển thị streak trên home screen

**Acceptance criteria:**
- [ ] Streak indicator (fire icon + days)
- [ ] Animated on active streak
- [ ] "At risk" state khi approaching reset
- [ ] Tap to see details

**Verification:**
- [ ] Display updates in real-time
- [ ] Animation smooth

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/src/components/StreakIndicator.tsx`
- `apps/mobile/app/(tabs)/index.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 7: Achievements Screen
**Description:** Screen hiển thị achievements

**Acceptance criteria:**
- [ ] Grid of achievement badges
- [ ] Earned vs locked state
- [ ] Progress indicator for partial achievements
- [ ] Earned date display
- [ ] Filter: all, earned, locked

**Verification:**
- [ ] Badges display correctly
- [ ] Progress accurate

**Dependencies:** Task 3

**Files likely touched:**
- `apps/mobile/app/profile/achievements.tsx`
- `apps/mobile/src/components/AchievementBadge.tsx`

**Estimated scope:** Medium (3 files)

---

#### Task 8: Leaderboard Screen
**Description:** Screen hiển thị leaderboard

**Acceptance criteria:**
- [ ] List of users sorted by XP
- [ ] Current user highlight
- [ ] Rank display
- [ ] Weekly/All-time toggle
- [ ] Pull to refresh

**Verification:**
- [ ] Rankings accurate
- [ ] Current user highlighted

**Dependencies:** Task 5

**Files likely touched:**
- `apps/mobile/app/profile/leaderboard.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 9: Level & XP Display
**Description:** Display user level và XP

**Acceptance criteria:**
- [ ] Level badge display
- [ ] XP progress bar
- [ ] XP to next level
- [ ] Recent XP gains notification

**Verification:**
- [ ] Level and XP display correctly
- [ ] Progress bar accurate

**Dependencies:** Task 4

**Files likely touched:**
- `apps/mobile/src/components/LevelBadge.tsx`
- `apps/mobile/app/profile/index.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 6-9
- [ ] Streak display works
- [ ] Achievements screen complete
- [ ] Leaderboard works
- [ ] Level/XP display correct

---

### Phase 4: Web UI

#### Task 10: Web Gamification Components
**Description:** Gamification components cho web

**Acceptance criteria:**
- [ ] Streak widget
- [ ] Achievement badges grid
- [ ] Leaderboard table
- [ ] Level progress bar

**Verification:**
- [ ] Components render correctly
- [ ] Data syncs with mobile

**Dependencies:** Task 2, 3, 4

**Files likely touched:**
- `apps/web/src/components/gamification/`
- `apps/web/src/pages/profile/`

**Estimated scope:** Medium (4-5 files)

---

### Checkpoint: Complete
- [ ] Backend complete
- [ ] Mobile UI complete
- [ ] Web UI complete
- [ ] Integration tests pass

---

## Total Effort
- Database: 2h
- Backend Services: 10h
- Mobile UI: 8h
- Web UI: 4h
- **Total: ~24h**

---

## Achievement Definitions

| Code | Name | Description | Condition |
|------|------|-------------|-----------|
| `first_spin` | Khởi đầu | First spin completed | 1 spin |
| `spinner_10` | Người quay | 10 spins | 10 spins |
| `spinner_100` | Master Spinner | 100 spins | 100 spins |
| `week_streak` | 1 Tuần | 7 day streak | 7 consecutive days |
| `month_streak` | 1 Tháng | 30 day streak | 30 consecutive days |
| `foodie_10` | Foodie | 10 unique restaurants | 10 check-ins |
| `social_butterfly` | Bướm xã hội | 5 group spins | 5 group spins |
| `night_owl` | Chim cú | Spin after 10pm | 10 night spins |
| `early_bird` | Chim sớm | Spin before 8am | 10 morning spins |

---

## Open Questions
- Streak reset time (midnight local hay fixed 24h)?
- Badge reveal animation cần design?
- Có cần seasonal/limited badges không?
