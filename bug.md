# Bug Notes

Tổng hợp các lỗi/risks đã chốt từ review local-only. Không sửa code ở đây, chỉ ghi nhận để theo dõi.

## Critical

- **Profile backend fail-open và fabricate data**
  - [backend/src/modules/users/users.service.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/backend/src/modules/users/users.service.ts#L41)
  - [backend/src/modules/users/users.controller.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/backend/src/modules/users/users.controller.ts#L23)
  - Mô tả: `getMyProfile()` và `getPublicProfile()` fallback sang demo/in-memory data khi DB lỗi hoặc không tìm thấy user. Controller vẫn trả `success: true`, nên missing user hoặc outage có thể trở thành `200 OK` với profile giả.

## Medium

- **Mobile client tự bịa metadata locket khi thiếu header**
  - [apps/mobile/src/api/endpoints/lockets.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/apps/mobile/src/api/endpoints/lockets.ts#L126)
  - [backend/src/modules/lockets/lockets.validation.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/backend/src/modules/lockets/lockets.validation.ts#L119)
  - Mô tả: `X-Device-ID` fallback sang chuỗi 64 ký tự `'a'` và `X-Captured-At` fallback sang `new Date().toISOString()` thay vì fail closed. Điều này che giấu bug upstream và làm invariant `device_hash` / `captured_at` kém tin cậy.

- **Contract test bị loại khỏi test discovery**
  - [backend/vitest.config.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/backend/vitest.config.ts#L4)
  - [backend/src/test/locket-profile-schema.contract.test.ts](/Users/giabinhtran/project/KADA-Food-Roulette-/backend/src/test/locket-profile-schema.contract.test.ts#L1)
  - Mô tả: `src/test/**` bị exclude khỏi Vitest mặc định, nên contract test này không chạy trong luồng test chuẩn. Schema/API drift có thể lọt qua CI nếu không gọi test thủ công.

- **Capture flow dễ hết hạn do timestamp được chốt quá sớm**
  - [apps/mobile/app/locket/capture.tsx](/Users/giabinhtran/project/KADA-Food-Roulette-/apps/mobile/app/locket/capture.tsx#L139)
  - [apps/mobile/app/locket/capture.tsx](/Users/giabinhtran/project/KADA-Food-Roulette-/apps/mobile/app/locket/capture.tsx#L181)
  - Mô tả: `capturedAt` được lấy trước khi chụp ảnh xong và trước khi người dùng đi qua các bước caption/details. Với cửa sổ 60 giây, flow nhiều bước có thể bị reject dù ảnh vẫn hợp lệ.

## Low / Docs

- **Docs stack đang không đồng nhất**
  - [brand/prompts.md](/Users/giabinhtran/project/KADA-Food-Roulette-/brand/prompts.md#L78)
  - [CLAUDE.md](/Users/giabinhtran/project/KADA-Food-Roulette-/CLAUDE.md#L25)
  - [brand/FOOD-ROULETTE-SITEMAP.md](/Users/giabinhtran/project/KADA-Food-Roulette-/brand/FOOD-ROULETTE-SITEMAP.md#L699)
  - [docs/API_SPEC.md](/Users/giabinhtran/project/KADA-Food-Roulette-/docs/API_SPEC.md#L568)
- Mô tả: Một số tài liệu vẫn mô tả backend Supabase/Postgres/Auth, trong khi repo hiện tại dùng Express + Prisma + MySQL cho backend chính. Route public profile cũng được mô tả qua cả `/u/:public_id` và `/profile/:username`, dễ gây hiểu sai contract.
