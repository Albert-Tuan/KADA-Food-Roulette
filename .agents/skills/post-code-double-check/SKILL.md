---
name: post-code-double-check
description: Runs a mandatory double-check after every code change, before reporting done or committing. Catches silent error swallowing, fabricated fallback data, unused imports, and missing quality gates. Use after implementing, editing, refactoring, or fixing any code in this repository.
---

# Post-Code Double-Check

## Overview

After any code change — before reporting "done" or committing — run this double-check. It exists because this codebase once shipped an anti-pattern: `catch` blocks that swallowed real errors and fabricated demo data, making the UI report success while nothing was persisted. That pattern is banned. This skill makes the ban enforceable.

**The rule:** a change is not "done" until it passes the error-swallowing audit AND the quality gates below.

## When to Use

- After implementing, editing, refactoring, or fixing any code
- Before reporting a task complete
- Before staging or committing changes
- After resolving merge conflicts (re-run on every file you resolved)

## Step 1: Error-Swallowing Audit

For every file you touched, grep the `catch` blocks. Every silent swallow is a finding.

### What counts as swallowing (banned)

```ts
// BANNED: empty catch
try { await prisma.user.findFirst(...); } catch { /* nothing */ }

// BANNED: catch that fabricates a fake object / fake default
try { user = await prisma.user.findFirst(...); }
catch { user = { id: userId, email: 'fake@example.com' }; }

// BANNED: catch that returns a hardcoded result
catch { return { locket_count: 1, check_in_count: 3, group_count: 1 }; }

// BANNED: catch that swallows and only logs at info/debug level
catch { console.log('[X] DB notice, using fallback'); }

// BANNED: `as unknown as X` used to force a fabricated object through types
return { ...fake } as unknown as LocketRecord;
```

### What is allowed

```ts
// ALLOWED: rethrow the original error
catch (error) { await cleanup(...); throw error; }

// ALLOWED: controller that converts errors into an HTTP response
catch (error) { return sendError(res, error, req.requestId); }

// ALLOWED: genuinely optional parse (best-effort, return null)
try { return JSON.parse(m); } catch { return null; }
```

### The fallback rule

A fallback is only acceptable when ALL of these hold:

1. **Scoped to non-production** — guarded by `process.env.NODE_ENV !== 'production'`
2. **Logged loudly** — `console.error`/logger with the actual error, not `console.log`
3. **Visible to the client** — response carries a `mode`/`degraded` marker so UI never reports success as if persisted
4. **Tested** — a test covers the fallback path

If any condition is missing, the fallback is a swallowed error. Flag it.

### Grep commands

```bash
# From repo root
rg -n "catch \{" backend/src --glob "*.ts"
rg -n "as unknown as" backend/src --glob "*.ts"
rg -n "console\.log.*fallback|console\.log.*notice" backend/src --glob "*.ts"
rg -n "catch \(" backend/src --glob "*.ts"
```

## Step 2: Dead Import & Dead Code Check

For every file you touched:

```bash
# Find unused imports / variables (also caught by typecheck + lint, run them anyway)
npm run typecheck
npm run lint
```

- Remove imports that are no longer referenced after your edit (e.g. `inMemoryUserStore` after deleting a fallback).
- Remove now-dead branches, constants, or helper functions. Ask before deleting something you're unsure is used elsewhere: `rg -n "symbolName" .`

## Step 3: Quality Gates

Inspect the owning `package.json`; do not assume scripts. Run from the package boundary:

| Package | Gates |
|---------|-------|
| `backend/` | `npm run lint` · `npm run typecheck` · `npm run build` · `npm run test:run` |
| `apps/mobile/` | `npm run typecheck` · `npm run lint` · `npm run test` |
| `apps/web/` | per `apps/web/package.json` |

If a gate fails, record the exact command, file, rule/test, and whether the failure is pre-existing. Do not claim a gate passed unless it ran successfully.

## Step 4: Report Truthfully

In the completion report, state explicitly:

- Which files changed
- **Error-swallowing audit result** (0 findings, or list of findings)
- Gate results (typecheck / lint / build / test) with pass/fail
- Any leftover uncommitted/unstaged files
- Anything NOT done (so it is never silently assumed done)

## Known Legacy Swallowing Spots (do not copy these patterns)

These pre-date this skill and are **not** to be replicated. They are queued for cleanup:

- `backend/src/modules/auth/auth.controller.ts:96,197` — register/login fabricate a demo account when DB fails
- `backend/src/modules/users/users.service.ts:31,48,86` — profile/stats return hardcoded demo data on DB failure
- `backend/src/modules/lockets/lockets.service.ts` — `acceptedFriendIds` returns an empty `Set`, `getFeed`/`getById`/`getPublicForUser` fall back to an in-memory store
- `backend/src/modules/lockets/lockets.controller.ts` — optional auth falls back to `req.user?.id || 'usr_demo_1'`

If you touch one of these files, you may fix the pattern (per the fallback rule) — do not extend it.

## See Also

- `code-review-and-quality` — deeper multi-axis review before merge
- `observability-and-instrumentation` — logging/telemetry that makes errors visible
- `debugging-and-error-recovery` — when a gate or test actually fails