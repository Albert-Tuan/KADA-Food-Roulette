# Kế hoạch đưa Food Roulette lên beta cho khoảng 100 người dùng

> Loại tài liệu: Đánh giá readiness và kế hoạch thực thi, không phải thay đổi product spec.
>
> Ngày đánh giá: 2026-08-23
>
> Baseline local: branch `main`, commit `0437ba4d7549`
>
> GitHub `main` tại thời điểm kiểm tra: `d91d4581822f` — commit này chỉ thay đổi UI Spin, không làm thay đổi các blocker backend được nêu bên dưới.

## 1. Kết luận

Food Roulette hiện phù hợp với mức **internal alpha/demo**, chưa nên mở beta cho 100 người dùng thật.

Với khoảng 100 tài khoản và 10–20 người hoạt động đồng thời, một Render instance kết hợp managed MySQL và Supabase Storage là đủ. Blocker hiện tại không nằm ở khả năng scale mà nằm ở:

- Auth còn đường cấp token cho tài khoản demo hoặc tài khoản không tồn tại.
- Một số dữ liệu quan trọng còn được lưu trong RAM hoặc file local.
- Backend còn trả dữ liệu giả khi database hoặc storage lỗi.
- Group Spin chưa có persistence an toàn qua restart hoặc nhiều instance.
- Test mobile và E2E chưa đủ bao phủ luồng sử dụng thật.
- Monitoring và quy trình vận hành beta còn thiếu.

## 2. Blocker bắt buộc trước beta

| Ưu tiên | Vấn đề hiện tại | Hành động cần làm | Điều kiện hoàn tất |
|---|---|---|---|
| P0 | Auth có thể cấp token cho tài khoản không tồn tại hoặc tài khoản admin demo | Xóa toàn bộ demo/in-memory fallback khỏi production; bắt buộc cấu hình `JWT_SECRET`; thêm rate limit | Email không tồn tại hoặc sai mật khẩu luôn trả `401`; không có cách lấy role `ADMIN` từ tài khoản demo |
| P0 | Google login chưa xác minh token Google | Tích hợp xác minh `idToken` thật hoặc ẩn Google login khỏi beta | Token giả hoặc thiếu token bị từ chối |
| P0 | Group Spin lưu phòng trong RAM | Dùng MySQL hoặc Redis làm source of truth cho room, member, vote và result | Restart backend không làm mất phòng đang hoạt động |
| P0 | Supabase lỗi có thể fallback sang memory và vẫn báo thành công | Production phải fail closed; chỉ cho phép memory adapter trong development/test | Upload lỗi trả `5xx`; không tạo metadata trỏ tới ảnh không bền vững |
| P0 | Profile và friendship còn fabricated fallback | Xóa dữ liệu giả và local persistence khỏi production | Database lỗi được trả rõ ràng; không xuất hiện user, stats hoặc friendship giả |
| P0 | Có deployment path dùng `prisma db push --accept-data-loss` | Chỉ dùng migration đã review với `prisma migrate deploy` | Production deploy không chạy schema push phá dữ liệu |
| P1 | Thiếu E2E và cross-device test | Bổ sung integration test, Maestro flow và test hai thiết bị | Các luồng beta chính pass trên Android và iOS |
| P1 | Thiếu crash/error monitoring | Thêm structured logs, Sentry, uptime alert và RED metrics tối thiểu | Lỗi staging có thể tìm bằng request ID và phát cảnh báo |
| P1 | Một số màn hình vẫn dùng mock | Kết nối API thật hoặc ẩn bằng feature flag | Người dùng beta không nhìn thấy dữ liệu giả |

## 3. Bằng chứng kỹ thuật chính

### 3.1 Auth và session

- `backend/src/modules/auth/auth.controller.ts:167` có built-in test users, trong đó email admin nhận role `ADMIN` mà không kiểm tra mật khẩu.
- `backend/src/modules/auth/auth.controller.ts:201` tạo demo user và JWT khi email không tồn tại.
- `backend/src/modules/auth/auth.controller.ts:289` tạo Google user giả mà chưa xác minh `idToken`.
- `backend/src/modules/auth/auth.controller.ts:427` ghi password reset token vào log.
- `backend/src/shared/middleware/auth.middleware.ts:4` có JWT secret mặc định trong source code.
- Mobile nhận refresh token nhưng không lưu hoặc tự refresh session; xem `apps/mobile/src/api/endpoints/auth.ts:43` và `apps/mobile/src/stores/authStore.ts:62`.
- Chưa có rate limiting cho login, register hoặc password reset.

### 3.2 Persistence và tính nhất quán dữ liệu

- `backend/src/modules/groups/groups.controller.ts:33` dùng `Map` trong process để lưu toàn bộ Group Spin room.
- `backend/src/modules/lockets/lockets.storage.ts:149` fallback upload sang `InMemoryMediaStorage` khi Supabase lỗi.
- `backend/src/modules/lockets/lockets.storage.ts:256` có thể chọn memory storage khi thiếu hoặc sai cấu hình.
- `backend/src/modules/users/users.service.ts:31` trả profile stats mặc định khi Prisma lỗi.
- `backend/src/modules/users/users.service.ts:52` có thể tạo profile giả cho user không tồn tại.
- `backend/src/modules/friends/friends.service.ts` kết hợp MySQL với in-memory/file persistence và nuốt một số lỗi database.
- `docker/backend.Dockerfile:26` còn dùng `prisma db push --accept-data-loss`.

### 3.3 Deploy và availability

- EAS đã trỏ các build profile tới Render API tại `apps/mobile/eas.json:10`.
- `/health` trong `backend/src/index.ts:56` chỉ xác nhận Express process còn chạy, chưa kiểm tra MySQL hoặc Supabase Storage.
- Lần kiểm tra Render đầu tiên timeout sau 30 giây; sau khi instance thức, `/health` trả `200` trong khoảng 0,175 giây và public Taste Board feed trả `200` trong khoảng 0,445 giây.
- Public Taste Board feed tại thời điểm kiểm tra trả danh sách rỗng.
- Axios mobile đang dùng timeout chung 120 giây cho mọi API tại `apps/mobile/src/lib/constants.ts:7`; timeout dài này có thể che cold start và làm UX khó hiểu.

### 3.4 Observability

- `backend/src/middleware/requestContext.ts` đã tạo `x-request-id`.
- `backend/src/shared/utils/logger.ts` đã có JSON logger tối giản.
- Request ID và structured logger mới được dùng tập trung ở Locket và Users; phần lớn controller/service còn dùng `console.log`, `console.warn` hoặc `console.error`.
- Chưa thấy metrics, tracing, mobile crash reporting hoặc alert dựa trên error rate/latency.

## 4. Phạm vi beta đề xuất

### 4.1 Chức năng đưa vào beta

1. Email auth thật.
2. Onboarding cơ bản.
3. Personal Spin từ dữ liệu nhà hàng đã approved.
4. Group Spin tối đa 20 người với room/vote/result bền vững.
5. Taste Board camera-only với `device_hash`, GPS và giới hạn 60 giây.
6. Feed `PUBLIC`, `FRIENDS` và `PRIVATE` đúng authorization.
7. Like/unlike và số like thật.
8. Profile và friendship thật.
9. Discover và filter cơ bản bằng dữ liệu thật.

### 4.2 Chức năng nên ẩn hoặc hoãn

- Google login cho đến khi backend xác minh token thật.
- Password reset cho đến khi có email provider và token không xuất hiện trong log.
- Menu Scan, Voice Spin và AI suggestion.
- Mock rewards và các phần gamification chưa hoàn chỉnh.
- Partner/B2B.
- Các màn hình home, review hoặc restaurant còn dùng `MOCK_*`.

## 5. Lộ trình thực thi

### Giai đoạn 1 — Security và persistence

Ước lượng: 6–10 engineering-days.

- Xóa auth bypass, tài khoản demo và JWT secret mặc định khỏi production.
- Tách rõ behavior giữa `development`, `test` và `production`; production luôn fail closed.
- Thêm rate limit cho login, register, refresh và reset password.
- Giảm JSON/body limit chung; giữ upload limit riêng cho ảnh.
- Đưa Group Spin room/member/vote/result vào persistent store.
- Loại fabricated profile, friendship và storage fallback khỏi production.
- Xác nhận Render dùng remote managed MySQL và Supabase private bucket.
- Chạy toàn bộ migration bằng `prisma migrate deploy`.
- Thiết lập backup database và thử restore ít nhất một lần.

### Giai đoạn 2 — Beta quality

Ước lượng: 5–8 engineering-days.

- Thêm test auth cho register, login, refresh, Google login và password reset.
- Thêm test Group Spin cho join, max 20, quyền host, vote đồng thời và restart.
- Thêm integration test cho restaurant approval, review và authorization.
- Viết Maestro E2E cho login, Spin, Group Spin và Taste Board.
- Test hai tài khoản trên hai thiết bị thật.
- Test permission denied, GPS timeout, ảnh quá 60 giây, network chậm và app resume.
- Load test khoảng 100 tài khoản và 10–20 concurrent users.
- Triage dependency advisories theo reachability; không dùng `npm audit fix --force`.

### Giai đoạn 3 — Vận hành beta

Ước lượng: 3–5 engineering-days.

- Thêm Sentry hoặc công cụ tương đương cho mobile và backend.
- Chuẩn hóa structured logs và gắn request ID cho mọi endpoint.
- Theo dõi request rate, error rate và p50/p95/p99 latency.
- Thêm readiness check cho MySQL và Supabase Storage.
- Tạo alert cho downtime, error rate cao và upload failure.
- Chuẩn bị privacy policy, account deletion, report/block và support channel.
- Phân phối bằng EAS internal build, TestFlight hoặc Play Internal Testing; không dùng Expo Go làm kênh beta.
- Rollout theo từng đợt: 10 người, 30 người, sau đó 100 người.

## 6. Tiêu chí mở beta

Chỉ mở beta khi tất cả điều kiện sau đạt:

- [ ] Không còn auth bypass, demo account hoặc hardcoded production secret.
- [ ] Clean install chạy xanh lint, typecheck, build và test.
- [ ] Không còn high-severity dependency finding có khả năng bị khai thác trong runtime beta.
- [ ] Hai tài khoản trên hai thiết bị thấy cùng dữ liệu sau khi refresh app.
- [ ] Restart backend không làm mất user, Group Spin room, friendship hoặc Taste Board.
- [ ] `PRIVATE` và `FRIENDS` không thể bị truy cập trái phép.
- [ ] Taste Board upload/delete xử lý đồng bộ metadata, original và thumbnail.
- [ ] Restaurant user-submitted chưa approved không xuất hiện trong Spin.
- [ ] Group Spin không vượt quá 20 thành viên và vote được xử lý nhất quán.
- [ ] 100 tài khoản/20 concurrent users đạt error rate dưới 1%.
- [ ] API thông thường có p95 dưới 2 giây; upload ảnh có p95 dưới 10 giây.
- [ ] Có alert khi API, MySQL hoặc Supabase gặp lỗi.
- [ ] Có backup, rollback và support channel.
- [ ] Chạy soak test staging tối thiểu 24 giờ trước đợt 100 người.

## 7. Kết quả verification tại thời điểm đánh giá

Môi trường local: macOS, Node `v22.23.2`, npm `10.9.8`.

### Backend

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- `npm run build`: pass.
- `npm run db:validate`: pass.
- `npm run test:run`: pass — 16 test files, 80 tests.

### Mobile

- `npm run test -- --runInBand --no-watchman`: pass — 4 suites, 6 tests.
- `npm run typecheck`: fail local — không resolve được `react-native-webview` trong `node_modules`.
- `npm run lint`: fail local — cùng lỗi import `react-native-webview`, kèm 61 warnings.
- `package.json` và `package-lock.json` đã khai báo `react-native-webview`; GitHub Actions trên `main` đang pass, nên local dependencies có dấu hiệu chưa được đồng bộ bằng clean install.

### Dependency audit

- Backend: 2 high-severity findings qua dependency chain `localtunnel -> axios`.
- Mobile production tree (`npm audit --omit=dev`): 13 high và 2 moderate findings trong chuỗi Expo/Metro/XML/image parsing; không có critical finding.
- Mobile full tree gồm build/dev tooling: 1 critical, 20 high và 4 moderate; critical finding nằm trong chuỗi `@expo/cli -> cacache -> tar`.
- Không tự động chạy `npm audit fix --force`; cần đánh giá reachability và nâng version tương thích với Expo SDK.

### Production smoke check

- Request Render đầu tiên timeout sau 30 giây.
- Sau khi service thức, `/health` trả HTTP `200` trong khoảng 0,175 giây.
- Public Taste Board feed trả HTTP `200` trong khoảng 0,445 giây và danh sách rỗng.

## 8. Thứ tự bắt đầu đề xuất

Sprint đầu tiên nên thực hiện theo thứ tự:

1. Khóa phạm vi beta và ẩn các chức năng mock/chưa hoàn chỉnh.
2. Sửa toàn bộ auth P0.
3. Loại bỏ production fallback và fabricated data.
4. Hoàn thiện remote MySQL, Supabase Storage và migration deployment.
5. Chuyển Group Spin sang persistent store.
6. Chạy test hai thiết bị và bổ sung E2E.
7. Bổ sung monitoring trước khi mời nhóm 10 người đầu tiên.

Tổng ước lượng: 15–25 engineering-days. Với ba người làm song song và không thêm feature mới, mục tiêu beta hợp lý là khoảng 2–3 tuần; nếu chỉ một người thực hiện thì khoảng 4–6 tuần.
