# Verification and handoff

Read this reference when running quality gates, changing manifests/schema, updating progress, preparing commits, or reporting completion.

## Choose proportional gates

Inspect the affected `package.json`; do not assume scripts. Run commands from the owning package boundary.

Typical mobile gates:

```bash
npm run typecheck
npm run lint
```

Typical backend gates:

```bash
npm run lint
npm run build
npm run test:run
npm run db:validate
```

Audit when manifests or lockfiles change. Run database migration/integration tests only against an explicitly confirmed disposable database. Distinguish unit, mock-mode, API integration, simulator/device, and credentialed external-service tests.

If a gate fails, record the exact command, file, rule/test, and whether evidence shows it is pre-existing. Do not claim a manual flow, migration, physical-device check, or external-service smoke test passed unless it ran successfully.

## Update progress truthfully

Update `docs/SESSION_HANDOFF.md` or a feature progress file only when authorized and the technical result is confirmed. Record:

- What changed and why.
- Owner approvals and unresolved ownership questions.
- Exact commands and pass/fail/skip status.
- Environment used: mock, simulator, disposable database, staging, or production-like service.
- Remaining blockers, prerequisites, safe next commands, and material Git state.

Keep secrets and `.env` contents out of documents. Do not edit README files merely to record progress.

## Final report

Report files and dependencies changed; lint/build/typecheck/test/audit/migration/smoke results; skipped tests and prerequisites; external services tested or not; unrelated local changes preserved; and staged/committed/pushed status. List proposed commits/files only when requested.
