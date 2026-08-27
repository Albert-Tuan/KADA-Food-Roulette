# AGENTS.md

> Vai trò, quyền hạn & ràng buộc của AI agent khi làm việc trong repo này.
> Đọc `CLAUDE.md` trước (entry point), rồi `brand/prompts.md` §0 trước khi code.

## 1. Checklist trước mỗi task

- [ ] Đã đọc `CLAUDE.md` (entry point) + `brand/prompts.md` §0 (master prompt) — hoặc user đã paste.
- [ ] Task design/UI → đọc `brand/brand.md` (tokens, tone tiếng Việt).
- [ ] Task feature flow / data model → đọc `brand/FOOD-ROULETTE-SITEMAP.md` §19.
- [ ] Task marketing copy → đọc `Content/source/*.docx`.
- [ ] Task trạng thái / bàn giao → đọc `docs/SESSION_HANDOFF.md` + progress/walkthrough tương ứng.
- [ ] Quyết định chưa rõ → check `brand/prompts.md` §9 (Open questions) → **hỏi, không đoán**.
- [ ] Feature work → load skill `food-roulette-feature-workflow` (xem §10).

## 2. Sự thật về repo (docs cũ có chỗ sai — tin code, không tin prose)

- **Không có** root `package.json`, `packages/`, `services/`. Mọi lệnh phải chạy **trong từng package**.
- `apps/web/`: React 18 + Vite 6 + react-router-dom 6 + lint bằng **oxlint** (CLAUDE.md/README ghi React 19/Router 7 là sai). Web không có test.
- `apps/mobile/`: Expo SDK 52, Expo Router (file-based `app/`), NativeWind, Reanimated 3. Test bằng jest.
- `backend/`: Express 5 + Prisma 5 + MySQL, module pattern `backend/src/modules/<feature>/`. API mount tại `/api/v1/*`, health tại `/health`. Test bằng vitest.
- Thư mục bỏ qua (không thuộc app): `Food Roulette-web/` (chỉ node_modules), `stitch_soft_red_gamified_system/` (rỗng).
- Working tree thường có sẵn thay đổi/untracked (handoff docs, scripts, skills) — **không xoá, không gộp vào diff của mình**. Giữ diff chỉ gồm file liên quan task.

## 3. Chạy app & môi trường

Cách chính thức (chi tiết: `docs/RUN_APP.md`):

- `./scripts/setup-app.sh` — setup lần đầu: npm ci, MySQL, Prisma migrate, seed.
- `./scripts/run-app.sh simulator` — MySQL + seed + backend `npm run dev` + Expo API mode trên iOS Simulator.
- `./scripts/run-app.sh device <MAC_LAN_IPV4>` — full stack trên thiết bị thật (IP LAN của Mac, không phải MAC điện thoại).
- `API_PORT=3001 ./scripts/run-app.sh simulator` khi cổng 3000 bị chiếm.
- **Không có mock mode.** App luôn chạy thật (MySQL + backend + API).

Gotchas:

- Node **22.23.2** (`backend/.nvmrc`), npm 10.9.8. Script chặn Node khác 22. CI mobile/web chạy Node 20.
- Backend cần `cp backend/.env.example backend/.env` trước (scripts không tự tạo `.env`).
- Không đưa Supabase credentials vào mobile. Chưa có credentials → để trống, backend tự dùng `InMemoryMediaStorage` ở dev.
- Seed: `cd backend && npm run seed` (idempotent upsert). Tài khoản demo: `locket-test@foodroulette.app` / `friend@foodroulette.app`, mật khẩu `password123`.

## 4. Quality gates (chạy từng package, không có root script)

| Package | Lệnh |
|---------|------|
| `backend/` | `npm run lint` · `npm run typecheck` · `npm run build` · `npm run test:run` · `npm run db:validate` |
| `apps/mobile/` | `npm run typecheck` · `npm run lint` · `npm run test` |
| `apps/web/` | `npm run lint` · `npx tsc -b --noEmit` · `npm run build` |

- CI dùng `npm ci --legacy-peer-deps` (bắt buộc `--legacy-peer-deps`, có peer conflict).
- Sửa `schema.prisma` → `npx prisma generate` + migration/db push. Đừng chỉ sửa schema.
- Test bắt buộc phải **chạy được thật** mới tính là pass; phân biệt pass/fail/skip.

## 5. Quy tắc vàng (conventions)

- **Ngôn ngữ:** code + commit tiếng Anh (Conventional Commits, **không emoji**); UI text tiếng Việt; README/docs tiếng Việt. Comment code tối thiểu, chỉ giải thích intent.
- **Design:** Earthy/nâu-vàng, warm-light-first, **không** dark mode default, **không** cam đỏ. Tokens ở `brand/brand.md`.
- **Spec priority:** `brand/prompts.md` > `brand/brand.md` > `brand/FOOD-ROULETTE-SITEMAP.md` > `Content/source/*.docx`.
- **File mới:** Feature Module Pattern — frontend `apps/web/src/features/<f>/` hoặc `apps/mobile/src/features/<f>/`, backend `backend/src/modules/<f>/`. Hỏi trước khi tạo file/đặt tên lạ.
- **Sửa code cũ:** đọc file đó + ≥1 file liên quan trước; grep usage trước khi xoá bất kỳ symbol nào.
- **Bất biến cốt lõi** (chi tiết: CLAUDE.md §7): group ≤ 20 members; locket upload cần `device_hash` + `captured_at` trong 60s server time; restaurant user-submitted chỉ xuất hiện sau `approved`; friendship mutual opt-in; `User.public_id` immutable; EXIF strip trước khi lưu.

## 6. Quyền hạn

✅ **Được phép:** đọc mọi file; sửa code trong `apps/`, `backend/`; tạo file mới trong `apps/*/src/features/`, `backend/src/modules/`, `Content/explore/`; refactor nhỏ trong 1 file (không đổi API public); đề xuất cấu trúc mới.

⚠️ **Phải báo trước:** thêm dependency mới (kèm lý do + so sánh ≥ 2 option); đổi cấu trúc folder/file có sẵn; refactor lớn (>1 file); sửa `brand/*.md`.

🚫 **Không được:** sửa `brand/*.md` mà không hỏi; commit/push trừ khi user yêu cầu; tạo credential/`.env`; sửa `package.json` version thủ công; thêm emoji vào code/commit; chạy command side-effect (rm, push, publish) không hỏi; commit file binary > 500KB.

Role mặc định: **Coder**. Phát hiện bug trong code cũ → mô tả (file/line) + đề xuất + hỏi, **không tự sửa** khi chưa được đồng ý.

## 7. Spec change & cross-file consistency

- Đổi spec → PM approve, sửa `brand/prompts.md` (single source of truth), log `CHANGELOG_SPEC.md`. AI **không** tự ý sửa spec.
- Đổi schema → đồng bộ `backend/prisma/schema.prisma` + `docs/food_roulette_erd*.xml` + `backend/prisma/migrations/` + `docs/ERD_MIGRATION_NOTES.md`.
- Đổi brand/spec → đồng bộ `PROMPT_TEMPLATES/`, sitemap.
- Chi tiết: `VIBE_RULES.md` §8.

## 8. Báo cáo sau khi xong (bắt buộc)

1. **Đã làm** — bullet, kèm file/line.
2. **Còn lại / chưa làm** — nếu có.
3. **Câu hỏi / đề xuất** — nếu có.
4. **Test đã chạy** — kết quả thật, phân biệt pass/fail/skip, kèm môi trường.

Sau mỗi thay đổi code → chạy skill `post-code-double-check`: audit catch-block nuốt lỗi + fallback fabricate data (BANNED), xoá import chết, chạy gates, báo cáo trung thực.

## 9. Feature ownership (ai quyết định gì)

| Feature | Owner | Stack |
|---------|-------|-------|
| SPIN (Personal + Group) | Hoàng Hiếu | RN + Expo + NativeWind + Reanimated |
| AUTH + ONBOARDING | Trường | Express + Prisma + MySQL + JWT |
| LOCKET + PROFILE | Gia Bình | RN + Expo + Supabase Storage |
| REVIEW + DISCOVER + DevOps | Thành Nam | Express + Prisma + MySQL + GitHub Actions + EAS |
| PM + B2B | Tuấn Anh | Architecture + Scope Control |

Thay đổi cross-feature → phối hợp với owner. Spec/architecture conflict → hỏi PM (Tuấn Anh).

## 10. Skills trong repo

- `food-roulette-feature-workflow` — route mọi feature work. Bắt đầu bằng context snapshot:
  `bash "$(git rev-parse --show-toplevel)/.agents/skills/food-roulette-feature-workflow/scripts/context-snapshot.sh"`
- `food-roulette-git-integration` — đồng bộ `main`, giải quyết conflict, verify và push đúng ref được user cho phép; có hướng dẫn xử lý remote ref xung đột hoa/thường trên macOS.
- `food-roulette-local-stack` — setup/chạy/chẩn đoán MySQL + Express + Expo trên simulator hoặc thiết bị thật; giữ Supabase service-role credential ở backend.
- `post-code-double-check` — bắt buộc sau mỗi code change (error-swallowing audit + gates).
- Khác: `code-review-and-quality`, `security-and-hardening`, `observability-and-instrumentation`, `debugging-and-error-recovery`.

---

*Phiên bản: 2.0 · Cập nhật: 2026-08-18 · Thu gọn so với 1.2 (bỏ dataset reference lạc đề, thêm run scripts + quality gates + skills)*
