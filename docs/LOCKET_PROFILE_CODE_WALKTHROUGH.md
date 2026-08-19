# Code walkthrough — Taste Board (Locket) + Profile

> Owner: Trần Gia Bình
> Branch triển khai: `feature/locket-profile`
> Snapshot code: local merge commit `708f888` trên `feature/locket-profile`; chưa push
> Cập nhật: 2026-08-13

## 1. Mục đích tài liệu

Tài liệu này giải thích những phần code chính đã được thêm hoặc cập nhật từ lúc bắt đầu prototype Locket/Profile đến khi hoàn thiện Taste Board, backend media pipeline, migration, test và merge vào `main`.

Số dòng bên dưới dựa trên snapshot hiện tại. Nếu code tiếp tục thay đổi, dùng `rg` theo tên function/class được ghi kèm để tìm lại vị trí mới.

### Naming contract

- Tên hiển thị cho người dùng: **Taste Board**.
- Tên kỹ thuật: `Locket`, `locket`, `lockets`.
- Route mobile giữ `/locket/...`.
- API giữ `/api/v1/lockets`.
- Prisma model giữ `Locket`.
- Storage path giữ namespace `lockets`.

## 2. Luồng tổng thể

```text
CameraView
  → refresh GPS + capture timestamp + device hash
  → preview ảnh + review tùy chọn + visibility
  → LocketRepository
  → multipart request + JWT headers
  → Express multer route
  → validate file/auth/device_hash/captured_at/GPS
  → Sharp re-encode + strip EXIF + thumbnail
  → MediaStorage (Supabase hoặc in-memory dev)
  → Prisma/MySQL
  → normalized response
  → mapper + TanStack Query cache
  → feed/detail/public profile
```

## 3. Lịch sử triển khai chính

| Giai đoạn           | Commit    | Nội dung                                 |
|---------------------|-----------|------------------------------------------|
| Prototype           | `aa2aaae` | Camera, feed/detail và Profile prototype |
| GPS                 | `d4270f8` | Refresh GPS ngay trước khi capture |
| Mobile/API boundary | `01491a8` | Repository, API adapters, mappers và hooks |
| Tests               | `772dda1` | Schema/API/mobile flow tests |
| UI naming           | `fae7fb3` | Đổi user-facing copy thành Taste Board |
| Toolchain           | `242e537` | Node 22, ESLint 10 và dependency security |
| Database            | `cc566a8` | Canonical migrations và media metadata |
| Media pipeline      | `7b6d32e` | Sharp, Supabase Storage và media authorization |
| Đồng bộ main        | `da1cd95` | Giải quyết conflict và nhận Spin/Friends/Notifications/B2B/CI |
| Taste Board tối giản | `b7433df` / `c03d126` | Bỏ metadata cũ khỏi UI/request mới và cho `dish_name` nullable |
| Network/Profile      | `3f11b16` / `bc0dc96` | CORS/API URL/scripts và khôi phục Profile routes |
| Menu hotfix sync     | `708f888` | Nhận 16 commit main, giữ security/typed-route constraints |

## 4. Mobile capture flow

### 4.1. Màn camera và preview

File: `apps/mobile/app/locket/capture.tsx`

| Dòng | Thành phần | Giải thích |
|---:|---|---|
| 15–22 | Imports | Dùng `CameraView`, Expo Location, image manipulator, repository hook và installation identity. Không import gallery picker cho Taste Board. |
| 32–36 | `VISIBILITY_OPTIONS` | Ánh xạ `PRIVATE`, `FRIENDS`, `PUBLIC` sang copy tiếng Việt. |
| 69 | `CaptureLocketScreen` | Entry component của toàn bộ capture flow. |
| 92–110 | `requestLocation` | Xin quyền location và lấy vị trí mới; trạng thái permission/error được giữ riêng. |
| 114–154 | `handleCapture` | Refresh GPS trước khi chụp, gọi camera, re-encode JPEG phía mobile, tạo timestamp và lấy device hash. |
| 139–143 | Draft identity | Gắn `deviceHash`, `capturedAt`, latitude/longitude vào draft cùng ảnh. |
| `validateForm` | Validation | Kiểm tra ảnh, GPS, review, timestamp và Spin restaurant context trước submit. |
| `handleSubmit` | Submit | Tạo input tối giản; trả `tasteBoardId` về check-in khi đến từ Spin, nếu không mở detail. |
| 221–247 | Permission states | Loading, camera denied, location denied, mở Settings và retry. |
| Preview form | UI | Ảnh, review tùy chọn, visibility, GPS/time và submit state; không có món/quán/rating/tags. |
| 378–424 | Camera-only UI | Render `CameraView`, nút chụp/đổi camera và copy “Chỉ chụp trực tiếp từ camera”. |
| 436+ | `CenteredState` | Component dùng chung cho loading/permission/error UI. |

Quyết định quan trọng:

- Nút reload/chụp lại không reset vị trí vô ích trong cùng phiên sử dụng.
- City Run và Freeway Drive trên iOS Simulator đã được dùng để xác nhận GPS thay đổi.
- `expo-image-picker` vẫn tồn tại trong project nhưng chỉ phục vụ đổi avatar Profile, không tham gia Taste Board capture.

### 4.2. Installation identity và device hash

File: `apps/mobile/src/lib/installationIdentity.ts`

| Dòng | Logic |
|---:|---|
| 3 | Khóa SecureStore `locket-device-hash-v1`. |
| 17–85 | SHA-256 implementation/fallback để tạo hash 64 ký tự hexadecimal. |
| 88–103 | `createInstallationId`: tạo installation ID ngẫu nhiên và giải phóng buffer tạm sau khi hash. |
| 105–115 | `getInstallationDeviceHash`: đọc hash cũ hoặc tạo hash mới và chỉ lưu hash. |

Security boundary: App Installation ID gốc không được ghi vào SecureStore, API hay database.

### 4.3. Domain types

File: `apps/mobile/src/features/lockets/types.ts`

| Dòng | Type |
|---:|---|
| 1 | `LocketVisibility`. |
| 4–19 | Author, location và permission types. |
| 21–38 | Domain model `Locket` dùng trong UI. |
| 40–49 | `CreateLocketInput`, gồm ảnh local, `restaurantId` ngầm khi có, review, visibility, GPS/time và device hash. |

File DTO phía HTTP: `apps/mobile/src/api/endpoints/lockets.ts:3–55`.

## 5. Repository pattern và TanStack Query

### 5.1. Repository interface

File: `apps/mobile/src/features/lockets/repository.ts:8–14`

`LocketRepository` định nghĩa năm operation ổn định:

- `getFeed`
- `getById`
- `create`
- `update`
- `delete`

UI chỉ phụ thuộc interface này, không phụ thuộc Axios hoặc mock storage.

### 5.2. Chọn API hay mock

- `apps/mobile/src/features/lockets/repositories.ts:4–6`
- `apps/mobile/src/features/profile/repositories.ts:4–6`

Khi `EXPO_PUBLIC_USE_MOCK_REPOSITORIES=true`, app dùng mock repositories. Nếu không, app dùng API repositories.

API base URL nằm tại `apps/mobile/src/lib/constants.ts:7`:

```text
EXPO_PUBLIC_API_URL || http://localhost:3000/api/v1
```

### 5.3. API Locket adapter

File: `apps/mobile/src/features/lockets/apiLocketRepository.ts`

| Dòng | Method | Trách nhiệm |
|---:|---|---|
| 6–8 | `getTasteBoardErrorMessage` | Chuyển error kỹ thuật Locket thành copy Taste Board cho UI. |
| 11–17 | `getFeed` | Lấy DTO list và map sang domain. |
| 19–25 | `getById` | Lấy detail và normalize error. |
| 27–50 | `create` | Chuyển domain input sang multipart API request. |
| 52–66 | `update` | Chuyển camelCase domain input sang API fields. |
| 68–74 | `delete` | Xóa qua API và normalize error. |

Mapper nằm tại `apps/mobile/src/features/lockets/locketMapper.ts`; nó chuyển snake_case API DTO sang camelCase domain model và chuẩn hóa media URL.

### 5.4. Multipart request

File: `apps/mobile/src/api/endpoints/lockets.ts`

| Dòng | Logic |
|---:|---|
| 3–31 | `LocketDto` và normalized response contract. |
| 71–101 | Tạo `FormData`, append ảnh và metadata. |
| 90–92 | Gửi `X-Device-ID` và `X-Captured-At` headers. |
| 104–107 | Delete endpoint. |

JWT được Axios interceptor gắn từ SecureStore tại `apps/mobile/src/api/client.ts:12–23`.

### 5.5. Query hooks và cache invalidation

File: `apps/mobile/src/features/lockets/hooks.ts`

| Dòng | Hook | Cache behavior |
|---:|---|---|
| 5–10 | `useLocketFeed` | Query key theo feed filter. |
| 12–18 | `useLocket` | Chỉ chạy khi có ID. |
| 20–30 | `useCreateLocket` | Cache detail mới và invalidate feed/Profile. |
| 32–42 | `useDeleteLocket` | Xóa cache detail và invalidate feed/Profile. |

Root `QueryClientProvider` nằm tại `apps/mobile/app/_layout.tsx:4–21`.

## 6. Mobile screens đã cập nhật

| File và dòng bắt đầu | Trách nhiệm |
|---|---|
| `apps/mobile/app/(tabs)/lockets.tsx:22` | Feed Taste Board, filter, loading/error/empty/retry. |
| `apps/mobile/app/locket/[id].tsx:13` | Detail, permission-aware location và owner delete action. |
| `apps/mobile/app/(tabs)/profile.tsx:7` | Private profile tab và retry state. |
| `apps/mobile/app/u/[public_id].tsx:6` | Public profile route; chỉ dùng public fields/Taste Boards. |
| `apps/mobile/app/profile/edit.tsx:21` | Chỉnh display names, bio và avatar prototype. |
| `apps/mobile/app/profile/settings.tsx:5` | Profile settings và Taste Board preferences UI. |
| `apps/mobile/app/(tabs)/_layout.tsx:59–63` | Tab title hiển thị “Taste Board”. |
| `apps/mobile/app/_layout.tsx:36–40` | Capture/detail/Profile/public-profile stack routes. |
| `apps/mobile/app/(tabs)/index.tsx:82–114` | Taste Board CTA và empty state trên Home. |

## 7. Profile boundary

### 7.1. Mobile Profile repository

- Interface: `apps/mobile/src/features/profile/repository.ts:3–7`.
- API implementation: `apps/mobile/src/features/profile/apiProfileRepository.ts:6–39`.
- Query hooks: `apps/mobile/src/features/profile/hooks.ts:5–29`.
- DTO endpoints: `apps/mobile/src/api/endpoints/users.ts:4–50`.
- Public/private mapper: `apps/mobile/src/features/profile/profileMapper.ts`.

`apiProfileRepository` dùng canonical endpoints:

```text
GET   /api/v1/users/me
PATCH /api/v1/users/me
GET   /api/v1/users/:public_id
```

### 7.2. Backend Users/Profile service

Canonical service cho mobile nằm tại `backend/src/modules/users/users.service.ts`:

| Dòng | Logic |
|---:|---|
| 6–15 | Chọn profile fields từ Prisma. |
| 17–30 | Tính Taste Board/check-in/group stats. |
| 33–56 | Private profile có email và `display_name_private`. |
| 58–83 | Public profile không select email hoặc `display_name_private`. |
| 86–92 | Update private profile rồi trả normalized response. |

Routes: `backend/src/modules/users/users.routes.ts:7–9`.

Module `backend/src/modules/profile/` được nhận khi merge `origin/main` và đang phục vụ compatibility routes `/api/v1/profile` và `/api/v1/profiles`. Mobile Taste Board/Profile hiện dùng `/api/v1/users`; khi refactor nên chọn một canonical module và loại duplicate bằng PR riêng.

## 8. Express Locket API

### 8.1. Route boundary

File: `backend/src/modules/lockets/lockets.routes.ts`

| Dòng | Route |
|---:|---|
| 8–11 | Multer memory storage, 1 file, tối đa 10 MB và 12 metadata fields. |
| 13–24 | Normalize Multer/file-size errors. |
| 26–30 | Public/optional-auth media proxy. |
| 31 | `GET /me`. |
| 32 | `GET /` feed. |
| 33 | `POST /` multipart create. |
| 34 | `GET /:id` optional auth. |
| 35 | `PATCH /:id` owner auth. |
| 36 | `DELETE /:id` owner auth. |

Routes được mount tại `backend/src/index.ts:56–65`, trong đó Locket dùng `/api/v1/lockets` và Profile dùng `/api/v1/users` cùng compatibility routes.

### 8.2. Controller

File: `backend/src/modules/lockets/lockets.controller.ts`

| Dòng | Handler | Trách nhiệm |
|---:|---|---|
| 16–30 | `sendError` | Response lỗi nhất quán và structured logging. |
| 33–41 | `getFeed` | Parse feed type và gọi service. |
| 43–50 | `getMine` | Feed của owner. |
| 52–60 | `getById` | Optional auth detail. |
| 62–88 | `create` | Validate file/headers/body, gọi service và ghi metrics log. |
| 90–100 | `update` | Parse update và owner service. |
| 102–111 | `delete` | Delete lifecycle. |
| 113–142 | `getMedia` | Rebuild/validate path, verify capability signature, set cache headers và trả bytes. |

### 8.3. Validation

File: `backend/src/modules/lockets/lockets.validation.ts`

| Dòng | Logic |
|---:|---|
| 4 | `MAX_LOCKET_FILE_SIZE = 10 MB`. |
| 97–112 | `validateImageFile`: MIME, bytes và file signature validation. |
| 114+ | `parseCreateLocket`: device hash, timestamp, GPS, visibility và text lengths; metadata legacy là tùy chọn nhưng vẫn được validate nếu gửi. |

Validation chạy lại ở backend; mobile validation chỉ nhằm phản hồi UI sớm.

## 9. Business logic và authorization

File: `backend/src/modules/lockets/lockets.service.ts`

| Dòng | Function | Giải thích |
|---:|---|---|
| 14–28 | `locketInclude` | Chỉ select public author data và restaurant cần thiết. |
| 35–44 | `canViewLocket` | Public xem được; private chỉ owner; friends cần friendship accepted. |
| 52–99 | `serializeLocket` | Chuẩn hóa API response, media URL, metadata và owner permissions. |
| 90–95 | Location privacy | Chỉ owner nhận GPS; viewer khác nhận `null`. |
| 101–113 | `acceptedFriendIds` | Load quan hệ friendship hai chiều đã accepted. |
| 121–153 | `getFeed` | Tạo Prisma access filter theo viewer/feed type. |
| 156–167 | `getById` | Soft-delete filter và visibility authorization. |
| 170–223 | `create` | Validate user/restaurant, xử lý ảnh, upload, persist và rollback Storage khi Prisma lỗi. |
| 225–250 | `update` | Owner authorization và update metadata. |
| 253–267 | `delete` | Soft-delete, xóa Storage và hoàn tác soft-delete nếu Storage lỗi. |
| 270–290 | `getMedia` | Path validation, current visibility/friendship check và download bytes. |
| 292–300 | `getPublicForUser` | Chỉ public, chưa bị soft-delete cho public profile. |

## 10. Image processing

File: `backend/src/modules/lockets/lockets.imageProcessor.ts`

| Dòng | Logic |
|---:|---|
| 4–5 | Giới hạn 40 triệu input pixels và cạnh original tối đa 2048 px. |
| 26+ | `processLocketImage`. |
| 28–31 | Đọc metadata, reject format/animation không hỗ trợ. |
| 33–42 | Auto-rotate, resize và JPEG re-encode original. |
| 43–53 | Tạo thumbnail JPEG. |
| 55–68 | Trả dimensions/byte metadata hoặc normalized processing error. |

Việc re-encode qua Sharp loại bỏ metadata/EXIF gốc thay vì tin vào EXIF đã bị xóa phía mobile.

## 11. Storage và media URLs

### 11.1. Supabase config

- Env contract: `backend/.env.example:23–25`.
- Config validation/client: `backend/src/lib/supabase.ts:8–39`.
- Bucket bắt buộc tên `lockets`; production fail closed khi cấu hình thiếu hoặc không đồng bộ.

### 11.2. MediaStorage abstraction

File: `backend/src/modules/lockets/lockets.storage.ts`

| Dòng | Thành phần |
|---:|---|
| 13–32 | Storage path, upload input và stored object types. |
| 34–40 | `MediaStorage` interface. |
| 42–60 | Tạo/validate path `lockets/{userId}/{locketId}/...`. |
| 62–97 | `InMemoryMediaStorage` cho dev/test. |
| 99–182 | `SupabaseMediaStorage`: upload, URL, delete và download. |
| 184–199 | Adapter fail-closed khi Storage chưa được cấu hình. |
| 209–223 | Factory chọn Supabase hoặc dev adapter; production không âm thầm fallback. |

### 11.3. URL/caching authorization

File: `backend/src/modules/lockets/lockets.mediaAccess.ts`

- Dòng 4: TTL 60 phút.
- Dòng 6–10: cache policy; public được cache có kiểm soát, private/friends dùng `private, no-store`.
- Dòng 12–19: đọc signing secret và fail closed trong production nếu thiếu cấu hình.
- Dòng 21–48: tạo và xác minh capability URL HMAC cho dev/fallback.

Contract:

- `PRIVATE`/`FRIENDS`: signed URL TTL 1 giờ.
- `PUBLIC`: Express media URL; endpoint kiểm tra visibility hiện tại trong Prisma.
- Không dùng `getPublicUrl` vì bucket là private.

## 12. Prisma schema và migrations

### 12.1. Schema

File: `backend/prisma/schema.prisma`

| Dòng | Model/field |
|---:|---|
| 21 | `User`. |
| 30 | `User.bio VARCHAR(160)`. |
| 384–418 | `Locket` model. |
| 389–393 | Thumbnail và byte/dimension metadata. |
| 394–407 | `dishName` nullable cùng metadata legacy; `note`, device/time/GPS và visibility fields. |
| 421–425 | `LocketVisibility`. |
| 547+ | B2B models nhận từ `main`. |
| 719+ | Notification model nhận từ `main`. |

### 12.2. Executable migration history

| Migration | Dòng quan trọng | Nội dung |
|---|---:|---|
| `20260808_baseline/migration.sql` | 225–242 | Tạo Locket baseline và indexes. |
| `20260809_add_locket_media_pipeline/migration.sql` | 2–7 | Thêm thumbnail/dimension/byte fields. |
| `20260809_add_locket_profile_fields/migration.sql` | 2–21 | Thêm `bio`, structured content, soft delete và rating constraint. |
| `20260810131814_add_main_modules/migration.sql` | 6–147 | Notifications/B2B và đồng bộ index sau merge. |
| `20260811_simplify_taste_board/migration.sql` | 1–3 | Cho `dish_name` nullable mà không xóa dữ liệu/cột legacy. |

`backend/prisma/migrations/migration_lock.toml` khóa provider `mysql`.

Các SQL bootstrap/reference không được Prisma chạy nằm tại:

- `backend/prisma/sql/v5.0/`
- `backend/prisma/sql/main-merge/`

## 13. Tests đã thêm

### Backend

| File | Điểm được bảo vệ |
|---|---|
| `lockets.authorization.test.ts:5` | Visibility và owner/friend rules. |
| `lockets.validation.test.ts:8` | File, GPS, timestamp và metadata validation. |
| `lockets.imageProcessor.test.ts:5` | Sharp re-encode, EXIF strip và invalid image. |
| `lockets.storage.test.ts:37` | Path, signed/public URL và Storage adapter. |
| `lockets.mediaAccess.test.ts:15` | Capability signature và cache policy. |
| `lockets.lifecycle.test.ts:48` | Upload/persist rollback và delete cleanup. |
| `users.validation.test.ts:4` | Profile field validation. |
| `locket-profile-schema.contract.test.ts:7` | Prisma/API schema contract. |
| `api-integration.test.ts` | MySQL CRUD, media columns và cleanup `try/finally`. |

### Mobile

| File | Điểm được bảo vệ |
|---|---|
| `locketMapper.test.ts:27` | DTO → domain mapping. |
| `mockLocketRepository.test.ts:5` | Create → feed → detail → delete flow. |
| `profileMapper.test.ts:6` | Public profile không lộ email/private display name. |

Kết quả gần nhất sau merge: 15 backend test files, 69 tests pass, 0 fail khi bật DB integration.

## 14. Toolchain và CI

| File và dòng | Thay đổi |
|---|---|
| `backend/package.json:5–7` | Backend Node `>=22.13.0 <23`. |
| `backend/package.json:13–21` | lint, test, Prisma validate/generate/migrate scripts. |
| `backend/package.json:37` | `sharp@^0.35.3`. |
| `backend/package.json:55` | `vitest@4.1.10`. |
| `backend/eslint.config.mjs` | ESLint 10 flat config. |
| `backend/eslint-suppressions.json` | Controlled suppressions cho legacy code; vi phạm mới vẫn fail lint. |
| `.github/workflows/backend-ci.yml:47–75` | Node 22, migrate deploy, lint/typecheck/build và DB integration test. |
| `backend.Dockerfile:2,24` | Node 22 builder/runner. |
| `docker/backend.Dockerfile:2,26` | Node 22 builder/runner cho CI context. |

Backend audit gần nhất: 0 vulnerability. Mobile Expo dependency graph còn advisory và cần upgrade có kiểm soát sau demo.

## 15. API documentation

File: `docs/API_SPEC.md`

| Dòng | Nội dung |
|---:|---|
| 1565+ | Upload Locket/Taste Board contract. |
| 1664–1675 | Media processing, rollback và URL policy. |
| 1677–1685 | Public media endpoint và security checks. |
| 1689+ | Feed. |
| 1752+ | My Lockets. |
| 1775+ | Detail. |
| 1808+ | Update. |
| 1840+ | Delete. |

## 16. Cách trình bày khi demo code

Thứ tự ngắn nhất để giải thích feature:

1. Mở `capture.tsx:114–219` để trình bày GPS/camera/validation/submit.
2. Mở `repository.ts` và `hooks.ts:20–40` để giải thích boundary và cache invalidation.
3. Mở `lockets.ts:71–101` để trình bày multipart headers/body.
4. Mở backend `lockets.routes.ts:8–36` và `lockets.controller.ts:62–88`.
5. Mở `lockets.service.ts:170–290` để trình bày transaction-like lifecycle và authorization.
6. Mở `lockets.imageProcessor.ts` và `lockets.storage.ts` để trình bày EXIF/thumbnail/Supabase.
7. Mở `schema.prisma` và năm migrations.
8. Kết thúc bằng test files ở mục 13 và kết quả backend gần nhất 69 tests pass.

## 17. Phần còn lại và lưu ý review

- Chưa smoke test Supabase bucket thật do chưa cấu hình credential/bucket local.
- Avatar upload thật còn chờ Profile Storage contract; hiện local avatar URI bị API adapter từ chối rõ ràng.
- `backend/src/modules/profile/` và `backend/src/modules/users/` đang có phần trách nhiệm chồng lấn sau merge; mobile hiện dùng `/users` làm canonical boundary.
- B2B Partner endpoints nhận từ `main` cần owner authorization review trước production.
- ESLint suppressions và mobile/web warnings là technical debt theo module, không phải phần media pipeline production.
- Hai thay đổi Expo-generated local (`apps/mobile/.gitignore`, `apps/mobile/package-lock.json`) không thuộc các commit feature/merge.

## 18. Lệnh tìm nhanh khi số dòng thay đổi

```bash
rg -n "handleCapture|handleSubmit|VISIBILITY_OPTIONS" apps/mobile/app/locket/capture.tsx
rg -n "useCreateLocket|invalidateQueries" apps/mobile/src/features/lockets
rg -n "router.post|router.delete|getMedia" backend/src/modules/lockets
rg -n "canViewLocket|async create|async delete" backend/src/modules/lockets/lockets.service.ts
rg -n "processLocketImage|SupabaseMediaStorage|MEDIA_URL_TTL_SECONDS" backend/src/modules/lockets backend/src/lib
rg -n "model Locket|thumbnailUrl|model User|bio" backend/prisma/schema.prisma
```
