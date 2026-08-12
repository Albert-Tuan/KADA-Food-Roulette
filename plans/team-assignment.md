# Team Work Assignment

> **Phân công công việc chi tiết cho mỗi thành viên trong team**
> **Updated:** 2026-08-11
> **Goal:** Hoàn thành tất cả features từ v1.0 đến Landing Page

---

## Team Roles Overview

| Role | Người | Strength | Assigned Features |
|------|-------|----------|------------------|
| **PM + Architect** | Tuấn Anh | Architecture, Database, DevOps | Project setup, DB, CI/CD, AI Moderation backend |
| **Backend Lead** | Trường | Node.js, Prisma, AI/ML | Backend APIs, Voice/Speech, AI services |
| **Frontend Lead** | Hoàng Hiếu | React Native, Expo, Reanimated | Mobile screens, Web components, Animations |
| **Content + Frontend** | Gia Bình | UI/UX, Copy, Mobile | UI polish, Screens, Copywriting |
| **DevOps** | Thành Nam | CI/CD, Docker, Cloud | CI/CD, EAS Build, Deployment |

---

## Feature-to-Team Assignment Matrix

### v1.0 MVP Remaining

| Feature | Backend | Mobile | Web | Effort | Assignee |
|---------|---------|--------|-----|--------|----------|
| **Onboarding Flow** | Preference API | 5 screens | Web flow | 22h | Hoàng Hiếu (lead), Gia Bình (screens), Trường (API) |
| **Steward Dashboard** | Enhance API | Mobile dashboard | Web dashboard | 16h | Trường (API), Hoàng Hiếu (web), Gia Bình (mobile) |
| **Spin Filter UI** | Already done | Filter modal | Filter component | 8h | Hoàng Hiếu |
| **Review UI (full)** | Photo upload | Write review, List | Write modal | 14h | Hoàng Hiếu (mobile), Gia Bình (web) |
| **Landing Page** | N/A | N/A | Full landing | 18h | Hoàng Hiếu (web), Gia Bình (copy) |
| **Privacy Policy** | N/A | N/A | Page | 4h | Gia Bình (content), Hoàng Hiếu (page) |
| **Terms of Service** | N/A | N/A | Page | 4h | Gia Bình (content), Hoàng Hiếu (page) |

### v1.1: Onboarding + Discover + Steward

| Feature | Backend | Mobile | Web | Effort | Assignee |
|---------|---------|--------|-----|--------|----------|
| **Discover Map** | Geo API | Map screen | Map component | 18h | Trường (API), Hoàng Hiếu (web), Gia Bình (mobile) |

### v1.2: Menu Scan + Voice + AI

| Feature | Backend | Mobile | Web | Effort | Assignee |
|---------|---------|--------|-----|--------|----------|
| **Menu Scan + Taste Filter** | Taste matching | Scan screen | Scanner | 22h | Trường (API + algorithm), Hoàng Hiếu (web), Gia Bình (mobile) |
| **Voice Group Spin** | Whisper, Intent | Voice UI | Voice controls | 30h | Trường (backend + Whisper), Hoàng Hiếu (web), Gia Bình (mobile) |
| **AI Moderation** | Moderation API | N/A | Dashboard | 16h | Tuấn Anh (architecture), Trường (service) |
| **AI Suggestion Engine** | Taste radar | Radar chart | Radar chart | 12h | Trường (backend), Hoàng Hiếu (charts) |

### v2.0: Gamification + Social + Expansion

| Feature | Backend | Mobile | Web | Effort | Assignee |
|---------|---------|--------|-----|--------|----------|
| **Gamification** | Streak + XP | Streak UI | Gamification | 24h | Trường (backend), Hoàng Hiếu (UI) |
| **In-app Chat** | Socket.io | Chat screen | Chat panel | 22h | Trường (Socket), Hoàng Hiếu (web), Gia Bình (mobile) |
| **Multi-city Support** | City API | City selector | City filter | 16h | Trường (API), Gia Bình (mobile), Hoàng Hiếu (web) |
| **AI Food Advisor** | LLM integration | Chat UI | Advisor panel | 20h | Trường (LLM), Hoàng Hiếu (UI) |

---

## Detailed Work Breakdown by Person

### 🏗️ Tuấn Anh (PM + Architect)

**Current workload:** ~20h remaining

| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Review + merge PRs | All | ongoing | In Progress |
| AI Moderation architecture | AI Moderation | 4h | Pending |
| Database migrations review | All | 4h | As needed |
| CI/CD fixes | CI/CD | 4h | As needed |
| Technical decisions | All | ongoing | As needed |

**Next action:** Continue reviewing PRs, handle architecture decisions

---

### 💻 Trường (Backend Lead)

**Current workload:** ~100h remaining

#### v1.0 Remaining (Backend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Preference endpoints | Onboarding | 4h | Pending |
| Review photo upload API | Review UI | 2h | Pending |
| Steward API enhancement | Steward | 4h | Pending |

#### v1.1 (Backend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Restaurant geo endpoint | Discover Map | 4h | Pending |

#### v1.2 (Backend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| ScannedMenu tables | Menu Scan | 2h | Pending |
| Menu scan endpoint | Menu Scan | 4h | Pending |
| Taste filter API | Menu Scan | 2h | Pending |
| Preference tags API | Menu Scan | 2h | Pending |
| Voice tables | Voice Spin | 2h | Pending |
| Voice enable/disable API | Voice Spin | 2h | Pending |
| Whisper integration | Voice Spin | 4h | Pending |
| Intent extraction | Voice Spin | 4h | Pending |
| Voice candidate API | Voice Spin | 2h | Pending |
| Moderation service | AI Moderation | 6h | Pending |
| Moderation queue | AI Moderation | 4h | Pending |
| Spin history analysis | AI Suggestion | 3h | Pending |
| Contextual factors | AI Suggestion | 2h | Pending |
| Taste profile API | AI Suggestion | 2h | Pending |

#### v2.0 (Backend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Gamification tables | Gamification | 2h | Pending |
| Streak service | Gamification | 4h | Pending |
| Achievement service | Gamification | 4h | Pending |
| XP & Level service | Gamification | 3h | Pending |
| Gamification API | Gamification | 3h | Pending |
| Chat tables | Chat | 2h | Pending |
| Chat socket events | Chat | 6h | Pending |
| Chat REST API | Chat | 2h | Pending |
| City tables | Multi-city | 2h | Pending |
| City endpoints | Multi-city | 3h | Pending |
| Food advisor service | AI Advisor | 6h | Pending |
| Advisor API | AI Advisor | 2h | Pending |
| Conversation memory | AI Advisor | 3h | Pending |

**Total backend: ~98h**

---

### 📱 Hoàng Hiếu (Frontend Lead)

**Current workload:** ~120h remaining

#### v1.0 Remaining (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Onboarding context + container | Onboarding | 2h | Pending |
| Step 1: GPS Permission | Onboarding | 3h | Pending |
| Step 2: Cuisine Preferences | Onboarding | 2h | Pending |
| Step 3: Display Names | Onboarding | 2h | Pending |
| Step 4: Avatar Selection | Onboarding | 3h | Pending |
| Step 5: Dietary Preferences | Onboarding | 2h | Pending |
| Onboarding complete screen | Onboarding | 2h | Pending |
| Web onboarding flow | Onboarding | 6h | Pending |
| Steward Web Dashboard | Steward | 8h | Pending |
| Spin Filter Modal | Spin Filter | 4h | Pending |
| Write Review Screen | Review UI | 4h | Pending |
| Review List Screen | Review UI | 3h | Pending |
| Review Card Component | Review UI | 2h | Pending |
| Web Write Review Modal | Review UI | 3h | Pending |
| Web Review List | Review UI | 3h | Pending |
| Landing Page Layout | Landing | 4h | Pending |
| Hero Section | Landing | 4h | Pending |
| Features Section | Landing | 3h | Pending |
| How It Works Section | Landing | 3h | Pending |
| Social Proof Section | Landing | 3h | Pending |
| CTA Section | Landing | 3h | Pending |
| Privacy Policy Page | Legal | 2h | Pending |
| Terms of Service Page | Legal | 2h | Pending |

#### v1.1 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Map Screen | Discover Map | 4h | Pending |
| Filter Bottom Sheet | Discover Map | 3h | Pending |
| List View Toggle | Discover Map | 2h | Pending |
| Web Map Component | Discover Map | 4h | Pending |
| Web Sidebar | Discover Map | 3h | Pending |

#### v1.2 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Menu Capture Screen | Menu Scan | 3h | Pending |
| Scan Result Screen | Menu Scan | 4h | Pending |
| Web Menu Scanner | Menu Scan | 3h | Pending |
| Voice Mic Button | Voice Spin | 2h | Pending |
| Voice Recording Screen | Voice Spin | 4h | Pending |
| Real-time Candidate List | Voice Spin | 4h | Pending |
| Web Voice Controls | Voice Spin | 4h | Pending |
| Taste Radar Component (Web) | AI Suggestion | 2h | Pending |

#### v2.0 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Streak Display | Gamification | 2h | Pending |
| Achievements Screen | Gamification | 4h | Pending |
| Leaderboard Screen | Gamification | 3h | Pending |
| Level & XP Display | Gamification | 2h | Pending |
| Web Gamification Components | Gamification | 4h | Pending |
| Chat Screen | Chat | 4h | Pending |
| Chat Input | Chat | 2h | Pending |
| Web Chat Component | Chat | 4h | Pending |
| Web City Filter | Multi-city | 2h | Pending |
| Advisor Chat Screen | AI Advisor | 4h | Pending |
| Advisor Quick Actions | AI Advisor | 2h | Pending |
| Web Advisor Panel | AI Advisor | 4h | Pending |

**Total frontend: ~122h**

---

### 🎨 Gia Bình (Content + Frontend)

**Current workload:** ~80h remaining

#### v1.0 Remaining (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Onboarding UI polish | Onboarding | 4h | Pending |
| Copywriting for onboarding | Onboarding | 2h | Pending |
| Review Card Component | Review UI | 2h | Pending |
| Web Review List | Review UI | 2h | Pending |
| Copywriting for Landing | Landing | 4h | Pending |
| Privacy Policy content | Legal | 2h | Pending |
| Terms of Service content | Legal | 2h | Pending |

#### v1.1 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Mobile Map Screen | Discover Map | 4h | Pending |
| Mobile Steward Dashboard | Steward | 4h | Pending |

#### v1.2 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Taste Preferences Editor | Menu Scan | 2h | Pending |
| Spin from Menu | Menu Scan | 2h | Pending |
| Voice Recording UI | Voice Spin | 3h | Pending |
| Mobile Voice Recording | Voice Spin | 4h | Pending |

#### v2.0 (Frontend)
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| City Selector (Mobile) | Multi-city | 2h | Pending |
| City-specific Content | Multi-city | 2h | Pending |

**Total: ~43h**

---

### 🚀 Thành Nam (DevOps)

**Current workload:** ~40h remaining

#### CI/CD Tasks
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Android CI/CD | CI/CD | 8h | Pending |
| EAS Submit (store submission) | CI/CD | 4h | Pending |
| Automated testing workflow | CI/CD | 6h | Pending |
| Preview deployments | CI/CD | 4h | Pending |
| Locket upload pipeline monitoring | CI/CD | 2h | As needed |
| Review API pipeline monitoring | CI/CD | 2h | As needed |

#### DevOps Support
| Task | Feature | Effort | Status |
|------|---------|--------|--------|
| Backend Docker optimization | Backend | 4h | Pending |
| Database backup strategy | Database | 4h | Pending |
| Monitoring setup | Infrastructure | 4h | Pending |

**Total DevOps: ~40h**

---

## Timeline Estimate

### Sprint 1: v1.0 Completion (2-3 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | Preference API, Steward API, Review photo upload | 10h |
| Hoàng Hiếu | Onboarding (5 screens), Spin Filter, Landing (partial) | 30h |
| Gia Bình | Onboarding UI, Landing copy, Legal pages | 14h |
| Thành Nam | EAS Submit, Android CI | 12h |

### Sprint 2: v1.1 + v1.2 Start (3-4 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | Discover API, Menu Scan API, Voice backend | 20h |
| Hoàng Hiếu | Discover Map, Menu Scan UI, Landing (full) | 25h |
| Gia Bình | Mobile Map, Mobile Steward | 8h |

### Sprint 3: v1.2 Core (3-4 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | Voice Spin backend, Whisper, Intent extraction | 20h |
| Hoàng Hiếu | Voice UI, Taste Radar | 18h |
| Gia Bình | Voice UI polish | 7h |

### Sprint 4: v1.2 + AI (3-4 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | AI Moderation, AI Suggestion | 18h |
| Hoàng Hiếu | AI Moderation dashboard, Taste Radar Web | 12h |

### Sprint 5: v2.0 Start (4 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | Gamification backend, Chat backend | 20h |
| Hoàng Hiếu | Gamification UI, Chat UI | 16h |
| Gia Bình | UI polish, City selector | 6h |

### Sprint 6: v2.0 Complete (4 weeks)
| Person | Tasks | Hours |
|--------|-------|-------|
| Trường | Multi-city, AI Advisor | 16h |
| Hoàng Hiếu | Multi-city UI, AI Advisor UI | 14h |
| Thành Nam | Final CI/CD polish | 8h |

---

## Total Effort Summary

| Person | Total Hours | Sprints |
|--------|-------------|---------|
| Trường (Backend) | ~98h | 6 sprints |
| Hoàng Hiếu (Frontend) | ~122h | 6 sprints |
| Gia Bình (Content) | ~43h | 6 sprints |
| Thành Nam (DevOps) | ~40h | 6 sprints |
| Tuấn Anh (PM) | ~20h | Ongoing |

**Grand Total: ~323h** (≈ 16 weeks for 1 person, ≈ 4 weeks for 4 parallel people)

---

## Open Questions for Team

| # | Question | Who to Answer |
|---|----------|---------------|
| 1 | Priority order - v1.0 hay v1.1 trước? | Tuấn Anh |
| 2 | AI Moderation - dùng service nào? | Trường |
| 3 | Voice recording limit - 10s hay 15s? | Tuấn Anh |
| 4 | Gamification - badge design từ đâu? | Gia Bình |
| 5 | Landing page assets - ai chịu trách nhiệm? | Tuấn Anh |
