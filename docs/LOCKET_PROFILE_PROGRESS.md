# Ghi nhớ tiến độ — Locket + Profile

> Owner: Trần Gia Bình
> Role: Locket + Profile Lead
> Cập nhật: 2026-08-13
> Branch: `feature/locket-profile`

Entry point cho model/session mới: [SESSION_HANDOFF.md](./SESSION_HANDOFF.md).

## 1. Mục tiêu

Hoàn thiện phần Locket + Profile trên mobile bằng React Native + Expo + TypeScript + NativeWind, sau đó kết nối với Express API và Supabase Storage.

## 2. Quyết định đã chốt

- Database: Prisma + MySQL.
- Media: Supabase Storage.
- Upload ảnh: mobile → Express Route → validate/strip EXIF → Supabase Storage → Prisma/MySQL.
- `device_hash`: hash dựa trên App Installation ID; không lưu App Installation ID gốc.
- Public profile: `/u/:public_id`.
- Taste Board mới có ảnh camera-only, `note` tùy chọn và `visibility`; `rating`, `tags` và metadata món/quán chỉ còn để tương thích dữ liệu/API cũ.
- Visibility: `PRIVATE`, `FRIENDS`, `PUBLIC`.
- Public profile không được expose `display_name_private`.
- Friendship chỉ là bạn khi mutual opt-in đã hoàn tất.

### Naming contract

- Tên hiển thị với người dùng: **Taste Board**.
- Tên kỹ thuật nội bộ: **Locket**.
- Giữ nguyên route `/locket/...`, API `/lockets`, Prisma model `Locket`, repository và type identifiers.
- Chỉ đổi UI copy, label, title, CTA, empty state, error message và tài liệu tiến độ.

### Trạng thái xác nhận

- Tuấn Anh: từ chối dùng JSON metadata cho structured data trong MVP; sử dụng các field rõ ràng trong Prisma.
- Trường: đã đồng ý toàn bộ thay đổi schema/API.
- Hoàng Hiếu: đã đồng ý toàn bộ thay đổi flow/navigation liên quan.
- Thành Nam: đã chốt contract Supabase Storage, bucket/policy và image pipeline.

### Storage contract đã chốt

- Bucket duy nhất: `lockets`.
- Object path: `lockets/{userId}/{locketId}/{original,thumbnail}.jpg`.
- `PRIVATE`/`FRIENDS`: signed URL, TTL 1 giờ.
- `PUBLIC`: đọc qua Express media proxy; bucket vẫn private, proxy có thể thêm cache/CDN.
- Upload flow: Express multipart → `sharp` → Supabase Storage → Prisma.
- Không dùng signed upload URL vì cần validate `device_hash` và timestamp trước.
- Backend env:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` — chỉ backend.
  - `SUPABASE_STORAGE_BUCKET=lockets`
- Mobile env được Nam cung cấp:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Image processing: `sharp@^0.35.3` để validate, re-encode, strip EXIF và resize.
- Supabase SDK: `@supabase/supabase-js`.

Hiện không còn blocker về quyết định schema, API, navigation hoặc Storage. Backend lint baseline, dependency audit và verification với MySQL disposable đã hoàn tất; còn cần smoke test với Supabase bucket thật.

## 3. Đã có trong code

- Camera-only capture prototype.
- Camera permission và GPS permission.
- Refresh GPS trước khi chụp.
- Re-encode ảnh phía mobile với `expo-image-manipulator`.
- App Installation ID-based hash utility.
- Preview form tối giản với ảnh, review `note` tùy chọn và visibility; không còn input món, nhà hàng, rating hoặc tags.
- Locket feed prototype với filter, loading, empty, error và retry state.
- Locket detail prototype.
- Public profile route `/u/[public_id]`.
- Profile edit/settings prototype.
- Mock Locket/Profile repositories và TanStack Query hooks.
- API repository adapters, response mappers và tests cho Locket/Profile.
- Cơ chế chọn mock/API repository theo môi trường đã được chuẩn bị.
- User-facing copy đã đổi từ “Locket” sang “Taste Board”; technical identifiers vẫn giữ nguyên.

### Backend đã triển khai bước đầu

- Prisma đã bổ sung `User.bio` và các field rõ ràng cho Locket: `dishName`, `restaurantName`, `note`, `rating`, `tags` cùng metadata media.
- Đã có migration SQL và cập nhật ERD/API contract tương ứng.
- Đã có Express multipart upload flow với kiểm tra file, `device_hash`, timestamp và giới hạn kích thước.
- Đã có Sharp pipeline re-encode JPEG, strip EXIF, resize original/thumbnail.
- Đã có Supabase client/storage adapter cho bucket private `lockets`, signed URL và Express media proxy.
- Đã có cleanup object khi lifecycle xử lý thất bại và các unit tests liên quan.

Các commit liên quan:

- `aa2aaae feat(mobile): add Locket and profile prototype flows`
- `d4270f8 fix(mobile): refresh GPS before Locket capture`
- `fae7fb3 feat(mobile): rename locket display to Taste Board`

## 4. Có thể làm một mình

### Mobile UI và flow

- Hoàn thiện copy/label tiếng Việt.
- Hoàn thiện capture → preview → submit → detail/feed.
- Đảm bảo không còn gallery picker.
- Hoàn thiện validation cho review tùy chọn và visibility; metadata legacy vẫn được backend validate khi client cũ gửi lên.
- Hoàn thiện loading/error/retry states.
- Hoàn thiện public/private profile UI.
- Cập nhật mock data để test đủ các visibility state.
- Test permission denied, chụp lại, retry và empty state.

### Mobile contract

- Cập nhật TypeScript types cho Locket/Profile.
- Giữ repository abstraction, không gọi Axios trực tiếp trong component.
- Chuẩn bị Express API adapter nhưng chưa cần kết nối production.
- Chuẩn bị test cases cho API response dự kiến.

## 5. Chưa làm hoặc đang bị chặn

| Hạng mục | Trạng thái | Người cần phối hợp |
|---|---|---|
| Prisma fields cho `bio` và Locket metadata | Hoàn tất; migration MySQL disposable pass | Trường đã duyệt |
| Prisma migration và ERD sync | Hoàn tất cho schema hiện hành | Trường đã duyệt |
| Express multipart upload route | Hoàn tất và có automated test | Trường đã duyệt |
| EXIF strip server-side bằng `sharp` | Hoàn tất và có image pipeline test | Trường đã duyệt |
| Supabase Storage integration | Đã có adapter, cần smoke test bucket private thật | Thành Nam + Trường |
| Bucket name/path/policy | Đã chốt | Thành Nam |
| API response contract chính thức | Đã chốt | Trường |
| Backend lint baseline | Đã hoàn tất controlled adoption; sau merge có 149 lỗi legacy được suppress có kiểm soát và phải trả dần theo module | Trường + owner từng module |
| Backend dependency audit | Đã xử lý; audit hiện có 0 vulnerability | Trường |
| Friendship backend và authorization | Đã nhận từ `origin/main`, có API/test; cần tiếp tục security review theo owner | Trường |
| Navigation Spin → Taste Board | Đã hợp nhất và typecheck pass | Hoàng Hiếu |

### Gate trước merge/deploy

- Backend lint pass với ESLint recommended ở severity error; 149 lỗi legacy của code cũ/incoming-main được suppress có kiểm soát, media pipeline Locket production không có lint error hoặc suppression.
- `npm audit --json` và `npm audit --audit-level=high` đều pass với 0 vulnerability; không dùng `npm audit fix --force`.
- Backend test sau merge đạt 69 pass, 0 fail khi bật `RUN_DB_INTEGRATION=true`; gồm 3 regression test CORS.
- Cần smoke test Supabase thật: bucket private, path original/thumbnail, signed URL 1 giờ, public qua Express, xóa object khi xóa Taste Board và cleanup khi Prisma lỗi.
- Hai thay đổi Expo-generated local đã được giữ ngoài merge commit: `apps/mobile/.gitignore` và `apps/mobile/package-lock.json`.

### Kết quả Giai đoạn 1 — controlled lint adoption

Trạng thái kiểm tra gần nhất:

- Node baseline backend đã chuyển sang `>=22.13.0 <23`; local dùng Node `22.23.2` và npm `10.9.8`.
- ESLint resolve thực tế: `eslint@10.8.1`, `@eslint/js@10.0.1`, `typescript-eslint@8.66.0`.
- `npm run build`: pass.
- `npm run test:run`: 35 pass, 1 DB integration skip, 0 fail.
- `npm run db:validate`: pass.
- `npm run lint`: pass; từ baseline 81 lỗi, 2 lỗi declaration merging được xử lý bằng `allowDeclarations: true`, 2 lỗi source được sửa tối thiểu và 77 lỗi legacy được suppress có kiểm soát.
- `apps/mobile` typecheck: còn 2 lỗi typed-route tại `/group/create` và `/restaurants`, ngoài phạm vi backend Locket/Profile.
- Chưa stage, commit hoặc push các thay đổi Giai đoạn 1.

Phân loại 81 lỗi:

| Rule | Số lỗi baseline | Xử lý thực tế |
|---|---:|---|
| `@typescript-eslint/no-explicit-any` | 38 | Suppression tạo bằng ESLint CLI; trả debt theo module |
| `@typescript-eslint/no-unused-vars` | 39 | Suppression tạo bằng ESLint CLI; trả debt theo module |
| `@typescript-eslint/no-namespace` | 2 | Đã cho phép declaration merging bằng `allowDeclarations: true` |
| `no-useless-assignment` | 1 | Đã sửa tối thiểu `circle.service.ts` |
| `no-case-declarations` | 1 | Đã sửa tối thiểu `preferenceLearner.service.ts` |

Phạm vi và quyền phê duyệt:

- `backend/eslint.config.mjs` là tooling dùng chung đã được duyệt để khôi phục lint.
- `backend/eslint-suppressions.json` đã được tạo bằng ESLint CLI sau khi Tuấn Anh/PM và Trường/backend owner duyệt; không chỉnh tay và không dùng `--suppress-all`.
- `backend/src/modules/circle/circle.service.ts` nằm ngoài phạm vi Locket/Profile.
- `backend/src/shared/services/preferenceLearner.service.ts` là shared cross-feature, không thuộc riêng Locket/Profile.
- Media pipeline Locket không có lint error và không có entry trong suppression file.

Controlled adoption đã triển khai:

1. Giữ preset `recommended` và severity `error`; không tắt rule hàng loạt.
2. Cho phép declaration merging hợp lệ bằng `allowDeclarations: true`.
3. Chỉ sửa hai lỗi source tối thiểu nêu trên sau khi owner duyệt.
4. Tạo suppression bằng ESLint CLI chỉ cho 38 lỗi `no-explicit-any` và 39 lỗi `no-unused-vars`; không dùng `--suppress-all` và không chỉnh file suppression thủ công.
5. Trả technical debt theo từng module/owner; khi sửa phải prune suppression tương ứng rồi chạy lại lint/build/test.

### Xác nhận policy lint — đã duyệt

- Tuấn Anh đã duyệt controlled adoption và bulk suppression có kiểm soát.
- Trường đã duyệt cấu hình ESLint, `allowDeclarations: true`, hai source fix tối thiểu và việc tạo suppression bằng ESLint CLI.
- Được phép sửa `circle.service.ts` và `preferenceLearner.service.ts` dù nằm ngoài phạm vi Locket/Profile.
- Technical debt phải được trả theo từng module/owner trong PR riêng; khi sửa phải prune suppression và chạy lại lint/build/test.
- Suppression đã được tạo bằng CLI, hai source fix tối thiểu đã hoàn tất; chưa stage, commit hoặc push.

Giai đoạn 1 đã hoàn tất: lint, build và Prisma validate pass; test đạt 35 pass, 1 DB integration skip, 0 fail. Các gate DB integration, Supabase smoke test và quality gate cuối vẫn còn mở.

### Kết quả Giai đoạn 2 — dependency audit

- Audit baseline: 1 critical, 1 high và 4 moderate; critical/high thuộc Vitest/Vite dev/test path, moderate còn lại gồm chuỗi Vitest/Vite và direct dependency `uuid@10.0.0`.
- Source backend không import package `uuid`; các điểm sinh ID dùng `node:crypto.randomUUID()`. Prisma/MySQL `uuid()` và regex kiểm tra UUID không phụ thuộc package npm này.
- Đã xóa `uuid` và `@types/uuid` bằng npm, không cần sửa source.
- Đã pin exact `vitest@4.1.10` và direct dev dependency `vite@7.3.6`. Cách pin này giữ Vite 7/Rollup + esbuild, không kéo Vite 8/Rolldown vào cùng lượt audit.
- Graph thực tế: `vitest@4.1.10` → `@vitest/mocker@4.1.10` → `vite@7.3.6`; `esbuild@0.28.1` được dedupe với `tsx`; `vite-node`, `rolldown`, `uuid` và `@types/uuid` đều absent.
- `backend/package-lock.json` được npm đồng bộ và khớp lockfile mô phỏng đã duyệt; quá trình cài dùng `--ignore-scripts`.
- `npm audit --json`: 0 vulnerability.
- `npm audit --audit-level=high`: pass, 0 vulnerability.
- `npm run lint`: pass.
- `npm run build`: pass.
- `npm run test:run`: 35 pass, 1 DB integration skip, 0 fail trên Vitest 4.1.10.
- `npm run db:validate`: pass.
- Không chạy `npm audit fix --force`; chưa stage, commit hoặc push.
- `npm run test:coverage` chưa chạy vì `@vitest/coverage-v8` chưa có trong dependency và không thuộc approval Giai đoạn 2.

Giai đoạn 2 đã hoàn tất; không còn advisory phải defer. Giai đoạn 3 chỉ được chạy trên MySQL test database dùng riêng và an toàn.

### Câu hỏi cần gửi để gỡ blocker lint

**Tuấn Anh — PM/Architecture — đã duyệt**

- Có duyệt controlled adoption và bulk suppression có kiểm soát không?
- Có cho phép sửa `circle.service.ts` và `preferenceLearner.service.ts` ngoài phạm vi Locket/Profile không?
- Có chấp nhận trả technical debt theo từng PR/module thay vì chặn toàn bộ change set hiện tại không?

**Trường — Backend — đã duyệt**

- Có xác nhận cấu hình ESLint, `allowDeclarations: true` và cách tạo suppression bằng CLI không?
- Xác nhận owner xử lý technical debt của các module `auth`, `circle`, `groups`, `menu`, `restaurants`, `roulette`, `steward` và shared services.
- Có thể triển khai các thay đổi lint sau khi Tuấn Anh duyệt policy không?

**Owner từng module**

- Xác nhận phạm vi lỗi thuộc module và thời điểm trả technical debt.
- Khi sửa lỗi, phải xóa suppression tương ứng và chạy lại lint/build/test.

### Đổi tên hiển thị — đã hoàn thành

- Mobile user-facing copy đã đổi từ “Locket” sang “Taste Board”.
- Technical identifiers, route, API, Prisma model và repository vẫn giữ tên Locket.
- Thay đổi đã được commit và push tại `fae7fb3`.

Không tự ý giải quyết các mục trên bằng cách đổi schema, thêm dependency hoặc sửa spec nếu chưa có approval phù hợp.

## 6. Prompt thực thi cho AI model tiếp theo

> Đây là prompt handoff đang có hiệu lực. Model tiếp theo phải làm tuần tự từng giai đoạn, không nhảy thẳng đến commit hoặc push. Có thể tìm nhanh bằng `rg -n "GIAI ĐOẠN ([0-7]|6\\.5)" docs/LOCKET_PROFILE_PROGRESS.md`.

### Vai trò và mục tiêu

Bạn là AI coding assistant hỗ trợ Trần Gia Bình, Locket + Profile Lead của Food Roulette. Tiếp tục hoàn thiện change set backend media pipeline đang có trên branch hiện tại, không viết lại implementation và không làm mất thay đổi chưa commit.

Thứ tự bắt buộc:

```text
sửa lint → xử lý audit → migration/integration test → cập nhật tiến độ
→ chia commit → review staged diff → đồng bộ origin/main vào feature
→ chạy lại quality gates → xin xác nhận và push
```

### Ràng buộc xuyên suốt

- Không sửa thêm `README.md` hoặc `brand/*.md`; ngoại lệ đổi runtime README sang Node 22 đã được duyệt và thực hiện trong Giai đoạn 1.
- Không đổi Prisma + MySQL sang hệ khác.
- Không đổi technical identifiers `Locket`, `locket`, `lockets`, route và API hiện tại.
- Không đưa Supabase service-role key vào mobile, log hoặc Git.
- Không dùng `npm audit fix --force`.
- Không dùng `git add .`, `git add -A`, force-push hoặc merge vào `main`.
- Không stage các file Expo ngoài phạm vi: `apps/mobile/.expo/types/`, `apps/mobile/tsconfig.json`, `apps/mobile/.gitignore`.
- Không xóa/revert thay đổi của người dùng nếu chưa được phép.
- Trước khi sửa file có sẵn, đọc file đó và ít nhất một file liên quan.
- Nếu thêm/nâng dependency, tuân thủ quy trình approval trong `AGENTS.md` và giải thích lựa chọn.

### GIAI ĐOẠN 0 — Baseline và bảo toàn working tree

Đọc đầy đủ:

- `CLAUDE.md`
- `AGENTS.md`
- `brand/prompts.md` §0
- `brand/FOOD-ROULETTE-SITEMAP.md` §19
- `docs/LOCKET_PROFILE_PROGRESS.md`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/.env.example`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `backend/src/lib/supabase.ts`
- `backend/src/modules/lockets/`
- `backend/src/test/api-integration.test.ts`
- `docs/API_SPEC.md`
- `docs/ERD_MIGRATION_NOTES.md`

Chạy kiểm tra chỉ đọc:

```bash
git branch --show-current
git remote -v
git status --short
git diff --stat
git log -5 --oneline --decorate
```

Điều kiện hoàn thành:

- Xác nhận branch dự kiến là `feature/locket-profile` và remote dự kiến là `origin`.
- Phân loại rõ backend media pipeline, database/docs và file Expo ngoài phạm vi.
- Báo cáo phạm vi trước khi sửa; chưa stage, commit hoặc push.

### GIAI ĐOẠN 1 — Khôi phục backend lint

Hiện trạng: Giai đoạn 1 đã hoàn tất controlled adoption; lint tooling chạy với recommended rules ở severity error và 77 lỗi legacy được quản lý bằng suppression theo policy đã duyệt. Media pipeline Locket không có lint error hoặc suppression.

Việc cần làm:

1. Kiểm tra installation boundary, lockfile và cấu hình lint hiện có.
2. Đề xuất cấu hình ESLint TypeScript tối thiểu, so sánh phương án nếu cần thêm dependency.
3. Xin approval theo `AGENTS.md` trước khi thêm dependency.
4. Thêm cấu hình có chủ đích; không tắt hàng loạt rule và không sửa nghiệp vụ chỉ để né lint.
5. Chạy trong `backend/`:

```bash
npm run lint
npm run build
npm run test:run
```

Điều kiện hoàn thành:

- Lint, build và test đều pass.
- Lockfile chỉ thay đổi theo dependency đã duyệt.

### GIAI ĐOẠN 2 — Xử lý dependency audit

Hiện trạng: Giai đoạn 2 đã hoàn tất. `vitest@4.1.10` và `vite@7.3.6` được pin exact; `uuid` và `@types/uuid` đã bị loại vì không được source sử dụng; `sharp@^0.35.3` được giữ. Audit hiện có 0 vulnerability và lint/build/test/Prisma validate đều pass.

Việc cần làm:

1. Chạy `npm audit --json` và phân loại direct/transitive, runtime/dev-only, reachability.
2. Nâng Vitest theo phiên bản đã vá có kiểm soát; đọc breaking changes trước khi sửa.
3. Dùng `rg` xác nhận `uuid` không được sử dụng. Nếu đúng, đề xuất loại dependency và type package liên quan thay vì nâng major không cần thiết.
4. Không chạy `npm audit fix --force`.
5. Chạy lại:

```bash
npm audit --audit-level=high
npm run lint
npm run build
npm run test:run
```

Điều kiện hoàn thành:

- Không còn critical/high chưa xử lý.
- Nếu defer advisory, phải ghi package, reachability, lý do và thời hạn review; không tự coi audit fail là pass.
- Build, lint và test vẫn pass sau khi thay dependency.

### GIAI ĐOẠN 3 — Migration và database integration

Không chạy migration trên production hoặc database không rõ mục đích. Chỉ dùng MySQL test database dùng một lần.

Kết quả thực tế — đã hoàn tất:

- Trường/backend owner đã duyệt canonical baseline, migration lock, mở rộng integration test và database test disposable.
- Tạo `20260808_baseline/migration.sql` từ schema hiện hành nhưng loại trừ các field do hai incremental migration quản lý.
- Tạo `migration_lock.toml` khóa provider `mysql`.
- Chuyển bộ SQL bootstrap/validation v5.0 sang `backend/prisma/sql/v5.0/`; thư mục này không còn bị Prisma hiểu nhầm là migration.
- `api-integration.test.ts` đã ghi/đọc/assert đủ `thumbnail_url`, `image_width`, `image_height`, `image_bytes`, `thumbnail_bytes` và cleanup trong `try/finally`.
- `npm run db:generate`: pass.
- `npm run db:migrate`: pass trên MySQL 8 disposable `food_roulette_locket_test`; cả baseline, media pipeline và profile migration đều được áp dụng.
- DB integration: pass, không bị skip; năm media columns tồn tại và dữ liệu test còn lại sau cleanup bằng 0.
- Database/container test không dùng volume và được xóa sau kiểm thử; không chạm database development `food_roulette`.

Việc cần làm:

1. Kiểm tra `DATABASE_URL` trỏ đúng database test mà không in credential ra log.
2. Đối chiếu đồng bộ:
   - `backend/prisma/schema.prisma`
   - `backend/prisma/migrations/20260809_add_locket_media_pipeline/migration.sql`
   - `backend/prisma/sql/v5.0/complete_schema.sql`
   - `docs/food_roulette_erd_v5.0_reviewed.xml`
   - `docs/ERD_MIGRATION_NOTES.md`
3. Chạy trong `backend/`:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate
RUN_DB_INTEGRATION=true npm run test:run
```

4. Xác nhận migration tạo đủ `thumbnail_url`, `image_width`, `image_height`, `image_bytes`, `thumbnail_bytes` và integration test cleanup dữ liệu test.

Điều kiện hoàn thành:

- Prisma validate/generate/migrate pass trên DB test.
- Database integration không còn bị skip và pass.
- Nếu không có DB test an toàn, dừng và báo blocker; không dùng database thật để thử.

### GIAI ĐOẠN 4 — Supabase/media verification

Nếu có credential và bucket test thật:

- Xác nhận bucket `lockets` tồn tại và private.
- Test upload đúng hai path original/thumbnail.
- Test Sharp re-encode JPEG, strip EXIF và metadata output.
- Test `PRIVATE`/`FRIENDS` nhận signed URL TTL 1 giờ.
- Test `PUBLIC` chỉ đọc qua Express media endpoint và visibility được kiểm tra lại từ Prisma.
- Test response private/friends không bị public cache.
- Test xóa object khi xóa Taste Board.
- Test cleanup object nếu Prisma persistence thất bại.

Nếu không có credential:

- Dùng mock `MediaStorage` cho automated tests.
- Không tạo, đoán hoặc yêu cầu ghi credential vào repo.
- Ghi rõ Supabase smoke test thật chưa chạy và phần phụ thuộc bucket/CDN thực tế.

Điều kiện hoàn thành:

- Automated storage/image/authorization/lifecycle tests pass.
- Trạng thái kiểm thử Supabase thật được báo cáo trung thực.

### GIAI ĐOẠN 5 — Cập nhật file tiến độ

Cập nhật chính file này sau khi có kết quả thực tế:

- Lint/audit đã xử lý thế nào.
- Migration và DB integration đã chạy hay còn bị chặn.
- Supabase thật đã smoke test hay mới dùng mock.
- Tổng số test pass/skip/fail.
- Phần còn phụ thuộc credential, bucket hoặc CDN.
- Giữ naming contract: Taste Board là user-facing, Locket là technical identifier.

Không sửa README hoặc brand spec.

### GIAI ĐOẠN 6 — Chia commit và review staged diff

Chia change set theo logic, ưu tiên:

```text
chore(backend): configure lint and secure dependencies
feat(database): add locket media metadata
feat(backend): implement locket media pipeline
docs(locket-profile): update implementation progress
```

Có thể điều chỉnh ranh giới nếu lockfile không thể tách sạch, nhưng phải giải thích. Chỉ stage bằng đường dẫn cụ thể.

Trước mỗi commit:

```bash
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Review theo correctness, readability, architecture, security và performance. Không commit nếu staged diff có credential, `.env` thật, file Expo ngoài phạm vi, README, brand spec hoặc thay đổi không liên quan.

Quality gate cuối trong `backend/`:

```bash
npm run lint
npm run build
npm run test:run
npm run db:validate
npm audit --audit-level=high
```

Nếu có DB test an toàn, chạy thêm:

```bash
RUN_DB_INTEGRATION=true npm run test:run
```

Điều kiện hoàn thành:

- Mỗi commit có Conventional Commit message và staged diff đúng phạm vi.
- Mọi quality gate bắt buộc pass hoặc blocker được báo trước khi commit.

### GIAI ĐOẠN 6.5 — Đồng bộ `origin/main` vào feature branch

Mục tiêu: đưa thay đổi mới nhất từ `origin/main` vào `feature/locket-profile` trước khi push/PR, nhưng không merge feature trực tiếp vào `main`, không rebase branch đã publish và không force-push.

Điều kiện trước khi bắt đầu:

- Giai đoạn 6 đã hoàn tất thành các commit local đúng phạm vi.
- `git status --short` sạch; không merge khi còn modified/untracked file chưa được xử lý.
- Không còn staged diff hoặc credential chưa kiểm tra.
- Quality gates trước merge đã pass theo phạm vi đã thống nhất.

Fetch và đánh giá chỉ đọc:

```bash
git fetch origin --prune
git branch --show-current
git status --short
git rev-list --left-right --count HEAD...origin/main
git log --oneline --decorate --graph --max-count=20 HEAD origin/main
git merge-base HEAD origin/main
```

Trước khi merge thật, dùng `git merge-tree` hoặc cách read-only tương đương để dự báo conflict. Báo cáo file xung đột và dừng xin người dùng xác nhận trước khi chạy. Dùng `--no-commit` để luôn review kết quả trước khi tạo merge commit:

```bash
git merge --no-commit origin/main
```

Snapshot ngày 2026-08-10: feature branch đang 7 commit ahead và 48 commit behind `origin/main`. Mô phỏng từ commit hiện tại phát hiện conflict ở:

- `apps/mobile/app/(tabs)/index.tsx`
- `apps/mobile/app/(tabs)/lockets.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/auth/login.tsx`
- `apps/mobile/app/auth/register.tsx`
- `apps/mobile/app/locket/capture.tsx`
- `apps/mobile/babel.config.js`
- `apps/mobile/package.json`
- `apps/mobile/package-lock.json`
- `apps/mobile/src/api/endpoints/auth.ts`
- `backend/prisma/schema.prisma`
- `backend/src/shared/utils/responseHelper.ts`

Các file working tree từng bị thay đổi đồng thời với `origin/main` và phải được review kỹ sau khi đã commit sạch:

- `apps/mobile/.gitignore`
- `apps/mobile/tsconfig.json`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/prisma/schema.prisma`

Quy tắc xử lý conflict:

- Giữ implementation Taste Board/Locket/Profile đã hoàn thiện, đồng thời nhận navigation, Spin và CI/toolchain mới từ `origin/main`.
- Không chọn nguyên `ours` hoặc `theirs` cho `package.json`, lockfile, Prisma schema, navigation hoặc màn hình mobile cốt lõi.
- Với lockfile: giải quyết manifest trước rồi regenerate bằng đúng package manager trong installation boundary; không chỉnh lockfile thủ công.
- Với Prisma: hợp nhất schema theo model cuối cùng, sau đó đối chiếu migration, complete schema SQL, ERD và migration notes.
- Không xóa route, repository, tests hoặc thay đổi của module khác chỉ để hết conflict.
- Sau khi xử lý, dùng `rg` xác nhận không còn marker `<<<<<<<`, `=======`, `>>>>>>>` và chạy `git diff --check`.

Quality gates bắt buộc sau merge:

```bash
# backend
cd backend
npm run lint
npm run build
npm run test:run
npm run db:validate
npm audit --audit-level=high

# mobile
cd ../apps/mobile
npm run typecheck
npm run lint
```

Chạy thêm DB integration và Supabase smoke test nếu có môi trường an toàn như Giai đoạn 3–4. Review merge diff theo correctness, architecture, security và performance trước khi tạo merge commit.

Điều kiện hoàn thành:

- Branch hiện tại vẫn là `feature/locket-profile`.
- `origin/main` đã được tích hợp bằng merge, không rebase/force-push.
- Không còn conflict marker hoặc file unmerged.
- Quality gates sau merge pass, hoặc blocker mới được báo và chưa push.
- Merge commit chưa được push cho tới khi hoàn thành Giai đoạn 7 và có xác nhận người dùng.

### GIAI ĐOẠN 7 — Báo cáo và xin xác nhận push

Trước push, chạy:

```bash
git branch --show-current
git remote -v
git status --short
git log -5 --oneline --decorate
```

Báo cáo:

1. File đã sửa.
2. Dependency đã thêm/xóa/nâng.
3. Advisory đã xử lý hoặc defer.
4. Migration/integration test đã chạy.
5. Supabase thật đã test hay chưa.
6. Commit đã tạo.
7. Kết quả đồng bộ `origin/main`, conflict đã xử lý và quality gates sau merge.
8. File còn lại ngoài commit.
9. Remote và branch dự kiến push.

Sau đó dừng và xin người dùng xác nhận trước khi chạy:

```bash
git push origin feature/locket-profile
```

Không force-push và không merge vào `main`.

## 7. Checklist sau mỗi task

- [x] Camera-only vẫn được đảm bảo cho Taste Board; image picker chỉ dùng đổi avatar Profile.
- [x] Không lưu App Installation ID gốc.
- [x] Public profile không lộ `display_name_private` theo repository/API contract.
- [x] Component Taste Board/Profile đi qua repository và hooks, không gọi API trực tiếp.
- [x] UI có loading/error/empty/retry state.
- [x] Mobile typecheck pass.
- [x] Lint pass.
- [x] Backend build/typecheck pass.
- [x] Backend test suite pass: 66 pass, 0 fail khi bật DB integration.
- [x] Không sửa brand spec.
- [x] Đã tạo commit local theo xác nhận của người dùng; chưa push change set mới.

## 8. Đồng bộ `origin/main` cho bản demo (2026-08-10)

- Đã merge `origin/main`, giải quyết toàn bộ conflict theo contract Taste Board hiện tại và tạo merge commit `da1cd95`.
- Giữ luồng Taste Board camera-only, API multipart/Sharp/Supabase và technical identifiers `Locket`/`lockets`.
- Nhận các module mới từ `main`: Spin, Friends, Notifications, Profile và B2B Partner.
- Đồng bộ backend về Node 22 trong CI/Docker; CI dùng Prisma migrations và `test:run`, không dùng `db push --accept-data-loss`.
- Di chuyển ba SQL thủ công từ `main` sang `backend/prisma/sql/main-merge/` để tham chiếu; tạo migration Prisma chuẩn `20260810131814_add_main_modules` cho Notifications/B2B.
- Migration đã apply thành công trên MySQL 8 disposable: 4/4 migrations.
- Backend DB integration: 13 test files, 62 tests pass, 0 fail.
- Backend lint/build/Prisma validate pass; npm audit: 0 vulnerability.
- Mobile typecheck và lint pass; lint hiện còn 28 warning legacy/incoming-main, không có error.
- Mobile dependency audit hiện báo 25 advisory trong graph Expo; chưa chạy `npm audit fix --force` vì có thể gây breaking change trước demo.
- Supabase bucket thật chưa smoke test vì chưa có credential/bucket local.
- Đã push thành công lên `origin/feature/locket-profile`; local và remote đồng bộ tại `da1cd95`.

## 9. Recap toàn bộ quá trình — snapshot hiện hành

Phần này là bản tổng hợp mới nhất và được ưu tiên khi các ghi chú lịch sử phía trên còn chứa số liệu của một giai đoạn cũ.

Tài liệu giải thích code và vị trí dòng hiện tại: [LOCKET_PROFILE_CODE_WALKTHROUGH.md](./LOCKET_PROFILE_CODE_WALKTHROUGH.md).

### 9.1. Prototype mobile ban đầu

- Xây dựng luồng Taste Board bằng technical module `Locket`: camera-only capture, permission camera/GPS, preview và đăng lên feed.
- Capture lưu thời điểm, GPS đã refresh trước khi chụp và `device_hash` dựa trên App Installation ID đã hash; không lưu installation ID gốc.
- Prototype ban đầu từng có tên món, tên quán, rating và tags; UI hiện hành đã bỏ các input này, chỉ giữ review tối đa 280 ký tự và visibility `PRIVATE`/`FRIENDS`/`PUBLIC`.
- Hoàn thiện feed, detail, xóa Taste Board, public profile `/u/:public_id`, profile edit và settings prototype.
- Thêm loading, empty, error và retry states cho các màn chính.
- Trong quá trình test iOS Simulator đã xác nhận City Run/Freeway Drive làm GPS thay đổi. Quyết định giữ vị trí hiện tại trong cùng phiên capture khi người dùng reload/chụp lại, không reset state không cần thiết.

Các commit nền:

- `aa2aaae feat(mobile): add Locket and profile prototype flows`
- `d4270f8 fix(mobile): refresh GPS before Locket capture`

### 9.2. Repository boundary và kết nối mobile/API

- Giữ `LocketRepository` và `ProfileRepository` làm boundary; component không gọi Axios hoặc mock data trực tiếp.
- Thêm Express API adapters, response mappers và cơ chế chọn API/mock repository bằng `EXPO_PUBLIC_USE_MOCK_REPOSITORIES`.
- Bổ sung TanStack Query hooks và invalidate feed sau create/delete.
- Đồng bộ auth flow để mobile có thể đăng nhập, tải profile và đăng Taste Board bằng API thật khi backend sẵn sàng.
- Thêm unit tests cho mapper, mock repository và mobile flow.

Các commit chính:

- `01491a8 feat(mobile): connect locket and profile repositories`
- `772dda1 test(locket-profile): add schema API and mobile flow coverage`

### 9.3. Naming ở lớp hiển thị

- Đổi toàn bộ user-facing copy chính từ “Locket” sang “Taste Board”: tab, header, CTA, form submit, loading/error/empty state và profile.
- Giữ nguyên technical identifiers `Locket`, `locket`, `lockets`, route `/locket/...`, API `/api/v1/lockets`, Prisma model, repository và storage path.
- Commit: `fae7fb3 feat(mobile): rename locket display to Taste Board`.

### 9.4. Prisma, schema và migration

- Thêm `User.bio` và structured fields cho Locket: `dishName`, `restaurantName`, `note`, `rating`, `tags`.
- Thêm media metadata: `thumbnailUrl`, `imageWidth`, `imageHeight`, `imageBytes`, `thumbnailBytes`.
- Tạo canonical baseline `20260808_baseline`, migration media/profile và `migration_lock.toml` cho MySQL.
- Chuyển SQL bootstrap/validation cũ khỏi Prisma migration history sang `backend/prisma/sql/v5.0/`.
- Đồng bộ Prisma schema, complete schema SQL, ERD, migration notes và schema contract tests.
- Khi merge `origin/main`, giữ contract Taste Board hiện hành, nhận Notifications/B2B schema và tạo migration Prisma chuẩn `20260810131814_add_main_modules`.
- Ba SQL thủ công từ `main` được giữ làm tài liệu tại `backend/prisma/sql/main-merge/`, không để Prisma hiểu nhầm là executable migration.
- Đã apply thành công 4/4 migrations trên MySQL 8 disposable; database/container test đã được xóa sau khi chạy.

Commit chính: `cc566a8 feat(database): add locket media metadata`.

### 9.5. Backend API và media pipeline

- Hoàn thiện Express routes cho feed/detail/create/update/delete và public media proxy.
- Upload bắt buộc qua Express multipart; validate JWT, file MIME/size, `device_hash`, `captured_at`, GPS và metadata.
- Dùng `sharp@^0.35.3` để decode/re-encode JPEG, strip EXIF, chuẩn hóa original và tạo thumbnail.
- Thêm Supabase server client bằng `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` và bucket `lockets`; service role key chỉ tồn tại ở backend.
- Bucket contract là private với path:
  - `lockets/{userId}/{locketId}/original.jpg`
  - `lockets/{userId}/{locketId}/thumbnail.jpg`
- `PRIVATE`/`FRIENDS` dùng signed URL TTL 1 giờ; `PUBLIC` đi qua Express endpoint và chỉ trả media khi visibility trong Prisma vẫn là `PUBLIC`.
- Xóa Storage objects khi xóa Taste Board; cleanup objects nếu Prisma persistence thất bại.
- Có mock `MediaStorage` cho unit/integration test khi local chưa có Supabase credential.

Commit chính: `7b6d32e feat(backend): implement locket media pipeline`.

### 9.6. Toolchain, lint và dependency security

- Nâng backend baseline lên Node `>=22.13.0 <23`; thêm `.nvmrc`, đồng bộ CI và hai backend Dockerfile sang Node 22.
- Dùng ESLint 10 flat config và controlled adoption. Hai lỗi source thật đã sửa tối thiểu; legacy violations được bulk-suppress bằng ESLint CLI để vi phạm mới vẫn bị chặn.
- Sau merge, suppression hiện ghi nhận 149 legacy violations trên các module cũ/incoming-main; phần media pipeline production không cần suppression. Technical debt phải được trả theo module và prune suppression tương ứng.
- Pin `vitest@4.1.10`, `vite@7.3.6`; xóa package `uuid` và `@types/uuid` không được sử dụng.
- Backend `npm audit --audit-level=high`: 0 vulnerability; không dùng `npm audit fix --force`.

Commit chính: `242e537 chore(backend): configure lint and secure dependencies`.

### 9.7. Merge `origin/main` và trạng thái Git

- Đã fetch và merge `origin/main` vào `feature/locket-profile`, không rebase/force-push.
- Giữ implementation Taste Board camera-only và media pipeline đã test; nhận Spin/Group Spin, Friends, Notifications, Profile, B2B, CI và web changes từ `main`.
- Lockfiles được regenerate từ manifest đã hợp nhất; không chỉnh lockfile thủ công.
- CI backend dùng Node 22, `prisma migrate deploy` và DB integration tests; không dùng `db push --accept-data-loss`.
- Merge commit: `da1cd95 merge: integrate origin/main into feature/locket-profile`.
- Đã push tới `origin/feature/locket-profile`; tại thời điểm push, remote và local commit history đồng bộ.
- Hai file Expo-generated local không nằm trong commit/push: `apps/mobile/.gitignore` và `apps/mobile/tsconfig.json`. Hai stash dự phòng vẫn được giữ.

### 9.8. Kết quả test gần nhất

- Backend lint: pass.
- Backend build/typecheck: pass.
- Prisma validate/generate: pass.
- MySQL migration: 4/4 pass trên database disposable.
- Backend tests với DB integration: 14 test files, 66 tests pass, 0 fail.
- Backend audit: 0 vulnerability.
- Mobile typecheck: pass.
- Mobile lint: pass với 28 warning legacy/incoming-main, 0 error.
- Web lint: pass với warning legacy; web production build: pass.
- iOS Simulator: Expo bundle thành công trên iPhone 17 Pro, không có runtime error lúc khởi động.
- Phiên test Simulator hiện dùng `EXPO_PUBLIC_USE_MOCK_REPOSITORIES=true`, vì vậy Taste Board/Profile dùng dữ liệu mock và không ghi vào API/Supabase thật.

### 9.8.1. Spin → Taste Board handoff — đã triển khai

- `spin/check-in.tsx` không còn giữ ảnh Unsplash/review local giả.
- Check-in chuyển sang `locket/capture` với `restaurantId`, `restaurantName` và `returnTo`.
- Taste Board capture đi qua `useCreateLocket` → `LocketRepository`, truyền `restaurantId` vào payload domain.
- Submit thành công trả `tasteBoardId` về check-in; chỉ khi có ID này người dùng mới tiếp tục lucky spin.
- Capture chặn restaurant ID không phải UUID khi chạy API mode; mock mode vẫn hỗ trợ fixture hiện tại để test UI.
- Taste Board đã được tối giản: UI mới chỉ có ảnh camera-only, review chữ tùy chọn và visibility. `restaurantId` từ Spin vẫn truyền ngầm; tên món, tên quán, rating và tags chỉ giữ ở API/database để tương thích dữ liệu cũ và không còn hiển thị.
- Mobile typecheck pass; mobile lint pass với 23 warning legacy, 0 error.
- Chưa có mobile test runner riêng trong `apps/mobile`; cần manual test hoặc bổ sung test harness cho route handoff.

### 9.9. Phần còn lại trước production/merge vào `main`

- Smoke test Supabase thật: private bucket, upload original/thumbnail, signed URL TTL, public Express proxy, deletion và rollback cleanup.
- Cấu hình credential/bucket thật ngoài repo; tuyệt đối không commit service role key.
- Mobile dependency graph hiện còn 25 npm advisories (4 moderate, 20 high, 1 critical) trong Expo ecosystem; cần phân tích reachability và upgrade có kiểm soát sau demo, không chạy `audit fix --force`.
- Review và bổ sung owner authorization cho B2B Partner endpoints trước khi coi module này production-ready; model hiện chưa thể hiện đầy đủ quan hệ giữa tài khoản đăng nhập và partner record.
- Trả dần ESLint technical debt và 15 mobile lint warnings theo owner/module.
- Chạy manual end-to-end bằng API thật: đăng nhập → capture → GPS → upload → feed/detail → visibility → xóa → kiểm tra Storage cleanup.
- Chạy manual end-to-end Spin → check-in → Taste Board capture → LocketRepository/API → quay lại check-in → lucky spin.

### 9.9.1. Verification ngày 2026-08-13

- Sửa API URL web để tôn trọng `EXPO_PUBLIC_API_URL`; lỗi transport không còn hiển thị thẳng `Network Error`.
- CORS development hỗ trợ Expo trên private LAN; production dùng `CLIENT_URLS`/`CLIENT_URL` allowlist và cho phép hai upload header `X-Device-ID`, `X-Captured-At`.
- `run-app.sh` đã phát hiện đúng service dự án khác chiếm cổng `3000` và dừng an toàn.
- Khôi phục hai route Profile edit/settings bị xóa nhầm tại commit `0e442f2`; mobile typecheck pass.
- MySQL local có đủ 5 migrations; DB integration trước merge đạt 66/66, backend suite sau merge đạt 69/69.
- API E2E với in-memory media pass: register `201`, create `201`, public media `200`, private proxy `403`, delete `204`; dữ liệu test được cleanup.
- Backend audit: 0 vulnerability. Mobile audit vẫn có 25 advisory trong Expo SDK 52; bản vá tổng thể yêu cầu Expo major upgrade nên chưa tự động áp dụng.
- Đã tích hợp 16 commit từ `origin/main` tại `0078c42` bằng merge commit local `708f888`; không còn commit main chưa merge tại thời điểm kiểm tra.
- Merge review đã loại auth bypass, anonymous menu access, fake database persistence fallback và route casts `as any`; production bắt buộc `JWT_SECRET`.
- Production JWT fail-closed check pass khi khởi động module không có `JWT_SECRET`; Google mock login cũng bị chặn trong production.
- Verification sau merge: MySQL DB integration đạt 15 files/69 tests; API E2E lặp lại đạt register `201`, create `201`, public media `200`, đổi private `200`, public proxy cũ `403`, delete `204`; test user đã được xóa.
- Supabase staging chưa smoke test vì chưa có project/credential trong môi trường hiện tại.

### 9.10. Trạng thái tổng kết

- Taste Board + Profile MVP: hoàn thiện tốt ở mức prototype tích hợp và automated test. Taste Board mới là post ảnh + review tùy chọn + visibility.
- Backend media/storage boundary: đã implement đầy đủ, còn phụ thuộc smoke test Supabase thật.
- Database/migrations: đã xác minh trên MySQL disposable.
- Branch hiện tại: đã merge `origin/main` và tạo commit local; chưa push các commit mới.
- Spec `brand/prompts.md` và sitemap đã được đồng bộ theo Taste Board tối giản sau khi người dùng duyệt.
