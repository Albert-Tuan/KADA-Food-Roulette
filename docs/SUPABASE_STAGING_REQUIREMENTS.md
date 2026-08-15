# Yêu cầu Supabase Storage staging

> Gửi tới: **Thành Nam** (Storage/DevOps) + **Trường** (Backend)
> Owner feature: Gia Bình (Locket + Profile)
> Cập nhật: 2026-08-15 · Branch: `feature/locket-profile`

## 1. Mục tiêu

Cấp credential + bucket Supabase **staging** để backend có thể chạy `SupabaseMediaStorage`
thay cho `InMemoryMediaStorage` hiện tại, rồi smoke test pipeline ảnh Taste Board thật.

Pipeline code đã implement đầy đủ (`backend/src/modules/lockets/lockets.storage.ts`) và có
unit test; chỉ còn phụ thuộc credential + bucket thật để verify.

## 2. Credential cần cấp (backend-only)

Set trong `backend/.env` (không commit):

```env
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>"
SUPABASE_STORAGE_BUCKET="lockets"
```

> ⚠️ **Ràng buộc (backend tự enforce):**
>
> - `SERVICE_ROLE_KEY` **chỉ tồn tại ở backend**. Tuyệt đối không đưa vào mobile, log, Git
>   hoặc tài liệu.
> - `URL` phải **HTTPS**, trừ `http://localhost` cho local dev (`backend/src/lib/supabase.ts:20-24`).
> - Thiếu bất kỳ 1 trong 3 biến → backend **throw** ngay khi khởi tạo storage (fail nhanh).
> - Đặt 3 biến nhưng bucket chưa tồn tại / chưa private → request upload trả `503`.

## 3. Bucket bắt buộc

| Yêu cầu | Giá trị | Enforced bởi code |
|---------|---------|-------------------|
| Tên bucket | `lockets` | `supabase.ts:25` — tên khác bị chặn |
| Chế độ | **Private** | `storage.ts:113` — public → `503 LOCKET_STORAGE_BUCKET_INVALID` |
| Object path | `lockets/{userId}/{locketId}/original.jpg` + `thumbnail.jpg` | `storage.ts:42-51` |
| MIME | `image/jpeg` | upload option |
| Cache control | `0` | upload option |

## 4. Access policy đề xuất

- **Service role key (backend):** full read/write/delete trên bucket `lockets` — cơ chế duy nhất
  backend dùng để upload/download/delete.
- **Không cần anon key / public policy cho ảnh Locket:**
  - `PRIVATE`/`FRIENDS` → **signed URL TTL 1 giờ** (`storage.ts:155-163`).
  - `PUBLIC` → đi qua **Express media proxy** `GET /api/v1/lockets/media/...`, backend đọc lại
    visibility từ Prisma trước khi tải object; **không** dùng `getPublicUrl` trực tiếp
    (`docs/API_SPEC.md:1667-1668`).
- **Không dùng signed upload URL:** backend giữ quyền validate `device_hash`, timestamp và
  kích thước trước khi upload (đã chốt trong `docs/LOCKET_PROFILE_PROGRESS.md` §2).

## 5. Checklist smoke test sau khi có credential

| # | Bước | Kỳ vọng |
|---|------|---------|
| 1 | Set 3 env vào `backend/.env`, restart backend container | Backend chuyển sang `storageMode: supabase` |
| 2 | Upload Taste Board | Lưu 2 object `original.jpg` + `thumbnail.jpg` đúng path |
| 3 | Mở locket `PRIVATE`/`FRIENDS` | Trả signed URL, truy cập được trong 1 giờ |
| 4 | Mở locket `PUBLIC` | Express proxy trả `200`; **direct bucket URL trả `403`** |
| 5 | Đổi visibility `PUBLIC` → `PRIVATE` | Proxy cũ trả `403` (revalidate từ Prisma) |
| 6 | Delete Taste Board | Cả 2 object bị xóa khỏi bucket |
| 7 | Dọn sạch toàn bộ user/object test | Không để lại dữ liệu test |

## 6. Trạng thái hiện tại

- Code pipeline: implement đầy đủ, unit test pass.
- Docker stack hiện chạy **`memory` mode** (chưa có credential) — mọi test E2E hiện tại chỉ
  ghi vào RAM, không chạm Supabase.
- Chưa smoke test bucket thật vì chưa có project/credential.

## 7. Liên hệ

- Cần gì: project Supabase staging + 3 credential + bucket `lockets` private.
- Cần ai: Thành Nam (tạo project/bucket/policy) + Trường (set env + xác nhận config backend).
- Khi sẵn sàng: báo Gia Bình để chạy checklist smoke test ở §5.
