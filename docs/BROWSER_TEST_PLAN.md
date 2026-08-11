# Browser Test Plan - Manual Verification

> **Date:** 2026-08-11
> **Status:** Code passes `tsc -b && vite build` + `oxlint` + Vite dev server module resolution
> **Tested by:** Cursor session (without Chrome DevTools MCP)

---

## 1. Static Verification (Already Passed)

### Build Pipeline
- [x] `npm run build` exits 0 (1741 modules, 557KB JS, 89KB CSS)
- [x] `npm run lint` exits 0 (only unused-import warnings, no errors)
- [x] `npm run dev` starts on port 5173

### Module Resolution (Vite Dev Server)
- [x] `/src/main.tsx` → 3599 bytes
- [x] `/src/App.tsx` → 35995 bytes
- [x] `/src/pages/steward/moderation/queue.tsx` → 52449 bytes
- [x] `/src/pages/steward/moderation/item/[id].tsx` → 47846 bytes
- [x] `/src/pages/steward/moderation/stats.tsx` → 38625 bytes
- [x] `/src/pages/steward/moderation/_layout.tsx` → 8950 bytes
- [x] All 21 critical files return valid JS (no "Failed to resolve")

### Route Resolution
- [x] `GET /` → HTTP 200
- [x] `GET /steward/moderation/queue` → HTTP 200 (SPA fallback)
- [x] All other routes → SPA fallback

---

## 2. Manual Browser Test (User must run)

### Setup
1. **Start dev server:**
   ```bash
   cd apps/web
   npm run dev
   ```
2. **Open Chrome** at `http://localhost:5173/`
3. **Open DevTools** (F12) → Console tab

### Test 2.1: Clean Console on Load

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1 | Navigate to `http://localhost:5173/` | Home page renders | [ ] |
| 2 | Check Console | 0 errors, 0 warnings | [ ] |
| 3 | Check Network tab | All 200s, no 404s | [ ] |

### Test 2.2: Auth Routes

| Step | Action | Expected | Pass? |
|------|--------|----------|-------|
| 1 | Navigate to `/login` | Login form renders | [ ] |
| 2 | Navigate to `/register` | Register form renders | [ ] |
| 3 | Console | Clean | [ ] |

### Test 2.3: Main App Routes

| Step | Route | Expected | Pass? |
|------|-------|----------|-------|
| 1 | `/` | HomeSpinRewards renders | [ ] |
| 2 | `/spin` | LuckySpinWheel renders | [ ] |
| 3 | `/locket` | LocketFeed renders | [ ] |
| 4 | `/profile` | ProfileTasteProfile renders | [ ] |
| 5 | `/check-in` | CheckInVerification renders | [ ] |
| 6 | `/garden` | SeasonGarden renders | [ ] |
| 7 | `/leaderboard/map` | NearbyRestaurantsMapView renders | [ ] |
| 8 | `/spin/menu-capture` | MenuCaptureScreen renders | [ ] |

### Test 2.4: Moderation Routes (NEW)

| Step | Route | Expected | Pass? |
|------|-------|----------|-------|
| 1 | `/steward/moderation` | Queue page renders | [ ] |
| 2 | `/steward/moderation/queue` | Queue page renders | [ ] |
| 3 | `/steward/moderation/stats` | Stats page renders | [ ] |
| 4 | `/steward/moderation/queue/abc-123` | Item detail page renders | [ ] |
| 5 | Sidebar visible | "Moderation" header, Queue & Stats links | [ ] |
| 6 | Queue API expected error | Network shows POST/GET to `/api/moderation/queue` with 401 (auth required) | [ ] |
| 7 | Console | Clean (no "Failed to resolve" errors) | [ ] |

### Test 2.5: Accessibility (Keyboard)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Tab through `/` | All interactive elements focusable |
| 2 | Tab through moderation queue | Sidebar links receive focus, table rows accessible |
| 3 | Press Enter on Queue link | URL changes to `/steward/moderation/queue` |
| 4 | Screen reader | "Moderation Queue" announced as main heading |

### Test 2.6: Responsive Design

| Viewport | Route | Expected |
|----------|-------|----------|
| 320px (mobile) | `/` | Layout stacks correctly |
| 768px (tablet) | `/steward/moderation/queue` | Table scrolls horizontally |
| 1024px (desktop) | `/` | Full layout |
| 1440px (large) | `/leaderboard/map` | Map + sidebar |

---

## 3. Known Issues / Caveats

### Backend Not Running
- API calls to `/api/moderation/queue` will return 401/500 (expected - no backend)
- This is a UI verification only; backend integration tested separately

### Unused Imports (Pre-existing, Not New)
- `useQuery` in `useSpin.ts` and `useAuth.ts` (warnings only)
- `AlertTriangle`, `User`, `AlertCircle` in various profile components
- `Check`, `Edit3`, `DollarSign` in menu components
- These are warnings, not errors - safe to clean up later

### Chunk Size Warning
- Production bundle is 557KB (147KB gzipped)
- Consider code-splitting for v2 (out of scope for v1)

---

## 4. Next Steps

1. **Start backend** (`cd backend && npm run dev`)
2. **Connect to MySQL** (Docker)
3. **Seed database** (`npx prisma db seed`)
4. **Test full auth flow** in browser
5. **Test moderation actions** (approve/reject) end-to-end
6. **Run E2E tests** when ready (Playwright/Cypress)

---

## 5. How to Run This Test Plan

```bash
# Terminal 1
cd apps/web
npm run dev

# Terminal 2 (optional)
cd backend
npm run dev

# Browser
# Open Chrome → http://localhost:5173/
# Open DevTools → Console (must be clean)
# Walk through Test 2.1 - 2.6
```

---

*Generated: 2026-08-11 by Cursor session*
