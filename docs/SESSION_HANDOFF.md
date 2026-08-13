# Session handoff — Food Roulette

> Cập nhật: 2026-08-13
> Branch: `feature/locket-profile`
> Snapshot: sau commit code `824643f`; đã chứa `origin/main` tại `0078c42`; chưa push các commit mới.

## 1. Bắt đầu session mới

Đọc theo thứ tự:

1. `CLAUDE.md`
2. `AGENTS.md`
3. `brand/prompts.md` §0
4. File này
5. `docs/LOCKET_PROFILE_PROGRESS.md` §9 và `docs/LOCKET_PROFILE_CODE_WALKTHROUGH.md` nếu làm Taste Board/Profile

Luôn chạy lại:

```bash
git status --short --branch
git log -8 --oneline
```

Không stage, ghi đè hoặc xóa thay đổi chưa commit. Không push nếu chưa có xác nhận riêng.

## 2. Trạng thái Git

- Các checkpoint local cho Taste Board, backend/schema, network, Profile routes và spec đã được tạo.
- Merge commit `708f888` đã tích hợp 16 commit từ `origin/main` bằng `--no-commit` rồi review trước khi commit.
- Commit hòa giải `0b9b4f7` đưa Auth, Menu, Preferences, personalization và UI ngoài ownership về đúng `origin/main`; PR không thay đổi contract các module này.
- Conflict tại capture giữ Spin handoff; CORS giữ production allowlist và custom upload headers để upload từ Expo/LAN.
- `backend/.env` vẫn còn trên máy nhưng đã ngừng track và được ignore. Credential từng tồn tại trong lịch sử Git cần được rotate nếu đã dùng ngoài local.
- Hai thay đổi Expo-generated của người dùng được giữ ngoài PR trong stash `user-expo-generated-changes-before-merge-cleanup`; phải khôi phục sau quality gate/push.
- Seed development idempotent nằm ở commit `a60f244`; hỗ trợ `API_PORT` nằm ở commit `824643f`.

## 3. Contract Taste Board đã chốt

- Tên UI: **Taste Board**; technical naming vẫn là `Locket`/`lockets` và route `/locket`.
- Post mới chỉ cần ảnh camera-only, review `note` tùy chọn và `PRIVATE`/`FRIENDS`/`PUBLIC`.
- UI không còn món, nhà hàng, rating hoặc tags; backend vẫn nhận/lưu metadata legacy.
- `restaurantId` chỉ truyền ngầm từ Spin check-in để xác minh flow.
- Capture giữ GPS, timestamp, device hash và JPEG re-encode; backend Sharp re-encode và strip EXIF lần nữa.
- `dish_name` nullable qua migration `20260811_simplify_taste_board`; không xóa cột hoặc dữ liệu cũ.

## 4. Luồng Spin handoff

```text
/spin/check-in
  → /locket/capture?restaurantId=...&returnTo=spin-check-in
  → useCreateLocket / LocketRepository
  → /spin/check-in?tasteBoardId=...
  → chỉ mở lucky spin khi có tasteBoardId
```

API mode yêu cầu `restaurantId` UUID; mock mode vẫn nhận fixture ID để test UI.

## 5. Network và security

- Mobile Axios luôn dùng `EXPO_PUBLIC_API_URL`; `localhost` chỉ là fallback trong constants.
- Transport failure được đổi sang hướng dẫn tiếng Việt thay vì hiển thị `Network Error` thô.
- Development CORS nhận localhost/private LAN trên các port Expo đã biết.
- Production CORS chỉ nhận `CLIENT_URLS` hoặc `CLIENT_URL`; cho phép `X-Device-ID` và `X-Captured-At`.
- `run-app.sh` chỉ chấp nhận `/health` có đúng payload Food Roulette và dừng nếu cổng đã chọn thuộc service khác.
- Có thể dùng `API_PORT=3001 ./scripts/run-app.sh simulator` khi cổng `3000` thuộc project khác.
- Auth giữ nguyên theo `origin/main` vì ngoài ownership của Locket/Profile.
- Profile routes `/profile/edit`, `/profile/settings` và `/locket/[id]` đã được khôi phục/đăng ký.

## 6. Verification gần nhất

- Backend lint/build/typecheck: pass.
- Backend unit/DB integration sau merge: 15 files, 69 tests pass.
- Prisma validate: pass; MySQL có 5 migrations.
- Mobile typecheck: pass.
- Mobile lint: 0 error, 23 warning legacy.
- Web lint: 5 warning legacy; production build pass, có cảnh báo chunk >500 kB.
- Backend audit: 0 vulnerability.
- Mobile audit: 25 advisory trong Expo SDK 52; chưa dùng `npm audit fix --force` vì fix tổng thể yêu cầu major upgrade.
- API E2E sau merge: register 201 → create 201 → public media 200 → đổi private 200 → public proxy cũ 403 → delete 204; test user đã cleanup.
- Seed chạy lặp hai lần thành công: đúng 2 user, 1 friendship và 3 restaurant; production guard từ chối trước khi ghi DB.
- API health và đăng nhập tài khoản seed trên cổng `3001`: 200; iOS bundle thành công.

## 7. Còn lại

- Manual E2E trên Simulator vẫn cần hoàn tất bằng session mới: capture, visibility, delete và Spin handoff. Không xử lý redirect `401` trong PR này.
- Supabase staging smoke test là follow-up sau merge: private bucket `lockets`, original/thumbnail, signed URL 1 giờ, public proxy, visibility transition, delete và rollback cleanup; owner Thành Nam + Trường.
- Test iPhone thật là follow-up do Expo SDK/Developer Mode; Simulator + API E2E là gate hiện tại.
- Chưa có Supabase project/credential trong môi trường hiện tại. Không đưa service-role key vào mobile, Git, log hoặc tài liệu.
- Review B2B owner authorization trước khi coi toàn repo production-ready.
- Chưa push; phải xin xác nhận riêng trước khi push.

## 8. Chạy app

```bash
./scripts/setup-app.sh mock
./scripts/run-app.sh mock

./scripts/setup-app.sh api
./scripts/run-app.sh simulator
API_PORT=3001 ./scripts/run-app.sh simulator

./scripts/run-app.sh device <MAC_LAN_IPV4>
```

Chi tiết: `docs/RUN_APP.md`.
