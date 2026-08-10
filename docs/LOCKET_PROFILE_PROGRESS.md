# Ghi nhớ tiến độ — Locket + Profile

> Owner: Trần Gia Bình
> Role: Locket + Profile Lead
> Cập nhật: 2026-08-10
> Branch: `feature/locket-profile`

## 1. Mục tiêu

Hoàn thiện phần Locket + Profile trên mobile bằng React Native + Expo + TypeScript + NativeWind, sau đó kết nối với Express API và Supabase Storage.

## 2. Quyết định đã chốt

- Database: Prisma + MySQL.
- Media: Supabase Storage.
- Upload ảnh: mobile → Express Route → validate/strip EXIF → Supabase Storage → Prisma/MySQL.
- `device_hash`: hash dựa trên App Installation ID; không lưu App Installation ID gốc.
- Public profile: `/u/:public_id`.
- Locket MVP có `note`, `rating`, `tags` và `visibility`.
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

Hiện không còn blocker về quyết định schema, API, navigation hoặc Storage. Backend lint baseline và dependency audit đã hoàn tất; còn cần verification với MySQL/Supabase thật.

## 3. Đã có trong code

- Camera-only capture prototype.
- Camera permission và GPS permission.
- Refresh GPS trước khi chụp.
- Re-encode ảnh phía mobile với `expo-image-manipulator`.
- App Installation ID-based hash utility.
- Preview form với tên món, nhà hàng, note, rating, tags và visibility.
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
- Bổ sung validation cho note, rating, tags và visibility.
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
| Prisma fields cho `bio` và Locket metadata | Đã triển khai bước đầu, cần test migration MySQL | Trường |
| Prisma migration và ERD sync | Đã triển khai, cần chạy trên DB test dùng một lần | Trường |
| Express multipart upload route | Đã triển khai bước đầu, cần integration/smoke test | Trường |
| EXIF strip server-side bằng `sharp` | Đã triển khai với `sharp@^0.35.3`, cần test thực tế | Trường |
| Supabase Storage integration | Đã có adapter, cần smoke test bucket private thật | Thành Nam + Trường |
| Bucket name/path/policy | Đã chốt | Thành Nam |
| API response contract chính thức | Đã chốt | Trường |
| Backend lint baseline | Đã hoàn tất controlled adoption; 77 lỗi legacy được suppress có kiểm soát và phải trả dần theo module | Trường + owner từng module |
| Backend dependency audit | Đã xử lý; audit hiện có 0 vulnerability | Trường |
| Friendship backend và authorization | Chưa làm | Trường |
| Navigation Spin → Locket | Đã chốt | Hoàng Hiếu |

### Gate trước merge/deploy

- Backend lint pass với ESLint recommended ở severity error; 77 lỗi legacy ngoài Locket/Profile được suppress có kiểm soát, media pipeline Locket không có lint error hoặc suppression.
- `npm audit --json` và `npm audit --audit-level=high` đều pass với 0 vulnerability; không dùng `npm audit fix --force`.
- Backend test hiện đạt 35 pass, 1 skip; cần chạy `RUN_DB_INTEGRATION=true` với MySQL test database.
- Cần smoke test Supabase thật: bucket private, path original/thumbnail, signed URL 1 giờ, public qua Express, xóa object khi xóa Taste Board và cleanup khi Prisma lỗi.
- Cần tách staged diff backend khỏi các file Expo phát sinh trước khi commit.

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

- [ ] Camera-only vẫn được đảm bảo.
- [ ] Không lưu App Installation ID gốc.
- [ ] Public profile không lộ `display_name_private`.
- [ ] Không gọi API trực tiếp trong component nếu đã có repository.
- [ ] UI có loading/error/empty/retry state.
- [ ] Mobile typecheck pass.
- [x] Lint pass.
- [x] Backend build/typecheck pass.
- [x] Backend Locket/Profile tests pass: 36 pass, 0 skip khi bật DB integration.
- [ ] Không sửa README.
- [ ] Không commit/push.
