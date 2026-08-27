---
name: food-roulette-local-stack
description: Set up, run, and diagnose the Food Roulette MySQL, Express, and Expo stack on an iOS Simulator or physical device. Use for local runtime, environment, port, database, Supabase Storage credential placement, or cross-device visibility questions; do not use for deployment.
---

# Food Roulette Local Stack

Run the repository's real local stack and prove which layer is working. Do not substitute mock data for a failing API or database.

## 1. Read current runtime truth

Before acting, read:

- `docs/RUN_APP.md`
- `scripts/setup-app.sh` for first-run setup
- `scripts/run-app.sh` for simulator/device behavior
- `backend/.env.example` and the config reader relevant to any requested credential

Trust these current files over stale architecture prose. Never print, copy into chat, stage, or commit values from `backend/.env`.

## 2. Respect environment and credential boundaries

- Required local toolchain: Node `22.23.2`, npm `10.9.8`, Docker Desktop, and Xcode/iOS Simulator when applicable.
- `backend/.env` must exist before setup/run; the repository scripts intentionally do not create or overwrite it.
- Supabase Storage belongs only in `backend/.env` using the three keys documented in `backend/.env.example`: URL, service-role key, and the `lockets` bucket.
- Never place a service-role key in Expo/mobile variables, source files, logs, screenshots, or Git.
- In development, absent or placeholder Supabase configuration selects the documented in-memory media storage. This makes media local to the backend process; it does not justify fake database records or a mock API mode.

When the user asks where to place credentials, explain the location and key names without reading their secret values. Let the user create or edit `.env`; do not generate credentials.

## 3. Choose the supported workflow

### First setup

After the user has prepared `backend/.env`:

```bash
./scripts/setup-app.sh
```

This installs dependencies, starts MySQL, generates Prisma Client, applies migrations, seeds real data, and installs mobile dependencies.

### iOS Simulator

```bash
./scripts/run-app.sh simulator
```

If port 3000 is occupied, identify the listener or use the supported override:

```bash
API_PORT=3001 ./scripts/run-app.sh simulator
```

### Physical device

Use the Mac's LAN IPv4 address, not the phone's MAC address and not `localhost`:

```bash
./scripts/run-app.sh device <MAC_LAN_IPV4>
```

Both modes must use `EXPO_PUBLIC_USE_MOCK_REPOSITORIES=false` and point Expo to the real `/api/v1` backend.

## 4. Operate long-running processes visibly

- Run the official script in a PTY/session so it can stay attached and receive `Ctrl+C`.
- Report startup milestones and errors while it runs; do not leave the user without status during Expo startup.
- Track which processes the script started. Stop only those processes when asked or when the task finishes.
- `Ctrl+C` stops Expo and the backend created by the run script; MySQL intentionally remains running.
- Never use `docker compose down -v` unless the user explicitly requests deletion of local database data.

## 5. Diagnose by layer

Preserve the first error and localize it in this order:

1. Toolchain: `node --version`, `npm --version`, required commands.
2. Configuration: confirm `backend/.env` exists without displaying it.
3. Database: container health, port 3306, Prisma validation/migration status.
4. API: port ownership and exact `/health` payload.
5. Seed/data: approved restaurants and demo accounts from the official seed.
6. Expo transport: simulator uses `localhost`; a physical device uses the Mac LAN IPv4 and must reach `/health` over Wi-Fi.
7. Feature flow: authenticate, make the API mutation, then verify persistence from a second request/device where relevant.

Docker socket and localhost checks can be blocked by the execution sandbox. If a diagnostic returns `Operation not permitted` or socket permission errors, rerun that exact diagnostic with the required approval before classifying it as an application failure.

## 6. Verify observable behavior

Do not call the stack complete merely because processes started. Confirm:

- MySQL is healthy and migrations are up to date.
- `/health` returns the Food Roulette backend payload on the chosen port.
- Expo shows the same API base URL appropriate for simulator or device.
- Login and at least one requested feature path use real API data.
- For cross-device Locket visibility, both devices must reach the same backend and its MySQL metadata; that backend must still be able to serve the media. Supabase or another shared persistent store is required for media to survive backend restarts or work across backend instances, while in-memory media is tied to one process.

Report what is running, the API URL, whether storage is Supabase or in-memory without exposing secrets, the manual scenario verified, and every skipped or failed check.
