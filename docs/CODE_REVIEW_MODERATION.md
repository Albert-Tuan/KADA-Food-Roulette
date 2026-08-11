# Code Review Report - Moderation Feature

> **Date:** 2026-08-11
> **Reviewer:** Cursor (claude-opus-5)
> **Code under review:** Moderation feature (steward dashboard)
> **Verdict:** **Approved with required fixes applied**

---

## Files Reviewed

### Backend
- `backend/src/modules/moderation/moderation.controller.ts`
- `backend/src/modules/moderation/moderation.routes.ts`
- `backend/src/shared/services/moderation.service.ts`
- `backend/src/shared/services/openai-moderation.adapter.ts`
- `backend/src/shared/services/nsfw-moderation.adapter.ts`
- `backend/src/shared/middleware/auth.middleware.ts` (used for role check)

### Frontend
- `apps/web/src/features/moderation/api/moderation.api.ts`
- `apps/web/src/features/moderation/hooks/useModeration.ts`
- `apps/web/src/features/moderation/types.ts`
- `apps/web/src/features/moderation/index.ts`
- `apps/web/src/pages/steward/moderation/_layout.tsx`
- `apps/web/src/pages/steward/moderation/queue.tsx`
- `apps/web/src/pages/steward/moderation/stats.tsx`
- `apps/web/src/pages/steward/moderation/item/[id].tsx`
- `apps/web/src/App.tsx` (route registration)
- `apps/web/src/main.tsx` (QueryClient setup)

### Schema
- `backend/prisma/schema.prisma` (`ModerationQueue` model)

---

## 5-Axis Review

### 1. Correctness ✅

**Findings:**
- **REQUIRED FIXED:** `apps/web/src/pages/steward/moderation/queue.tsx` had wrong import path (`../../features/...` instead of `../../../features/...`). Caused Vite "Failed to resolve" error. **Fixed.**
- **REQUIRED FIXED:** `apps/web/src/pages/steward/moderation/stats.tsx` had same issue. **Fixed.**
- **REQUIRED FIXED:** `apps/web/src/pages/steward/moderation/item/[id].tsx` had wrong path (`../../../features/...` instead of `../../../../features/...`). **Fixed.**
- **REQUIRED FIXED:** `apps/web/src/features/moderation/api/moderation.api.ts` initially imported `apiClient as api` but then was wrongly changed to default import. **Reverted to named import** (matches `client.ts` which uses `export const apiClient`).
- **REQUIRED FIXED:** `ModerationQueueFilters` was missing `limit` field, but `queue.tsx` passed it. **Added `limit?: number` to interface.**
- **REQUIRED FIXED:** `apps/web/src/App.tsx` had moderation routes nested inside `<MainLayout>`, which would cause double sidebar. **Moved out of MainLayout** for separate layout.

**Verdict:** All correctness issues resolved. Build passes.

### 2. Readability ✅

**Findings:**
- `ModerationQueuePage` is ~280 lines - acceptable for a single page with table + filters + sidebar
- `QueueRow` is well-isolated as a sub-component
- `useModeration.ts` cleanly separates mutations from queries
- **Nit:** Vietnamese diacritics display correctly in source (UTF-8 throughout)

**Verdict:** Readable. No fixes needed.

### 3. Architecture ✅

**Findings:**
- **Adapter pattern** correctly used for moderation providers (OpenAI, NSFW) - allows swapping without changing call sites
- **Service layer** (`ModerationService`) coordinates providers - good separation
- **Controller** is thin - delegates to service ✅
- **Frontend hook layer** uses TanStack Query for caching - standard pattern
- **Layout split**: Moderation uses `_layout.tsx` (separate from MainLayout) - correct for steward-only area

**Verdict:** Sound architecture. No fixes needed.

### 4. Security ✅

**Findings:**
- **Auth required:** All moderation endpoints use `authenticateJWT` middleware ✅
- **Role check:** Controller checks `STEWARD` or `ADMIN` role before allowing actions ✅
- **No hardcoded secrets:** API keys read from `process.env.OPENAI_API_KEY` ✅
- **Input validation:** Confidence thresholds checked (0-1 range) ✅
- **SQL injection:** Uses Prisma (parameterized queries) ✅

**Recommendations (optional, defer to v2):**
- Add rate limiting to moderation endpoints (currently only on `/restaurants/nearby`)
- Add audit log for who approved/rejected what (currently stored in `reviewedBy`)

**Verdict:** Security baseline met. No blockers.

### 5. Performance ✅

**Findings:**
- **N+1 query check:** `getQueue` uses cursor pagination + `take: limit` (good) ✅
- **Stats endpoint:** Uses Prisma `groupBy` for aggregations (efficient) ✅
- **Bundle size:** 557KB JS (148KB gzipped) - acceptable for v1, optimize later
- **HMR works:** Vite dev server reloads modules correctly

**Verdict:** Performance is fine for v1.

---

## Additional Issues Found & Fixed

| # | Issue | File | Severity |
|---|-------|------|----------|
| 1 | Wrong relative import path | `queue.tsx`, `stats.tsx`, `item/[id].tsx` | Critical (blocked app) |
| 2 | Wrong API import (default vs named) | `moderation.api.ts` | Critical (blocked app) |
| 3 | Missing `limit` field in `ModerationQueueFilters` | `moderation.api.ts` | Required (TS error) |
| 4 | Moderation routes nested in MainLayout | `App.tsx` | Required (UI issue) |

---

## Build/Test Status

| Check | Status |
|-------|--------|
| `tsc -b` | ✅ Pass |
| `vite build` | ✅ Pass (1741 modules, 557KB JS) |
| `npm run lint` | ✅ Pass (warnings only) |
| Vite dev server | ✅ Running on port 5173 |
| 21 critical files load via dev | ✅ All pass |
| Mock browser test (curl) | ✅ All routes return 200 |

---

## Final Verdict

**APPROVED** ✅

All critical issues fixed. App should now run in browser without errors. Manual visual verification via Chrome DevTools is recommended (see `docs/BROWSER_TEST_PLAN.md`).

---

*Generated: 2026-08-11 by Cursor session*
