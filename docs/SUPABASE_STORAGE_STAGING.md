# Hướng dẫn Setup Supabase Storage (Staging GĐ4)

> **Owner:** Thành Nam (Review + Discover Lead / DevOps)
> **Mục đích:** Unblock GĐ4 (Supabase staging smoke test) - Cung cấp Storage pipeline cho tính năng Locket.

Do hiện tại chúng ta sử dụng **MySQL** làm Database chính và **Supabase** làm Storage provider, phần setup Supabase này sẽ tập trung hoàn toàn vào Storage Bucket.

## 1. Supabase SQL Setup (Chạy trong SQL Editor của Supabase)

Để đảm bảo bucket `lockets` hoạt động đúng như spec (Private, bảo mật cao, backend quản lý access), hãy chạy script SQL sau trong [Supabase Dashboard > SQL Editor]:

```sql
-- 1. Tạo bucket 'lockets' ở chế độ Private
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lockets',
  'lockets',
  false, -- BẮT BUỘC false (Private bucket)
  10485760, -- Limit 10MB/file ở tầng Storage (Backend đã limit 5MB trước đó)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']::text[]
);

-- 2. Đảm bảo RLS (Row Level Security) được bật cho bảng objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Xoá các policy cũ (nếu có)
DROP POLICY IF EXISTS "Deny all public access" ON storage.objects;

-- 4. Tạo Policy: Chặn TẤT CẢ quyền truy cập từ public/anon
-- (Backend của chúng ta dùng SERVICE_ROLE_KEY nên sẽ tự động bypass RLS này)
CREATE POLICY "Deny all public access"
  ON storage.objects FOR ALL
  TO public, anon, authenticated
  USING (false);
```

## 2. Thông tin Credentials (Dành cho Trường config)

Vào **Project Settings > API** trong Supabase Dashboard, lấy 2 thông tin sau:
1. **Project URL**
2. **Service Role Key** (Mục *Project API keys* -> `service_role` -> `secret`)

⚠️ **LƯU Ý QUAN TRỌNG:** TUYỆT ĐỐI KHÔNG DÙNG `anon` key. File `lockets.storage.ts` bắt buộc dùng `SERVICE_ROLE_KEY` vì bucket là private.

## 3. Cập nhật file `.env` của Backend

Sau khi có thông tin, cập nhật vào file `.env` ở backend:

```env
# Supabase Storage (Staging Config)
SUPABASE_URL="https://[PROJECT_ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGci...[DÁN_SERVICE_ROLE_KEY_VÀO_ĐÂY]"
SUPABASE_STORAGE_BUCKET="lockets"
```

## 4. Test Storage Pipeline (Smoke Test)

Sau khi config `.env`, backend server sẽ tự động chuyển từ `InMemoryMediaStorage` sang `SupabaseMediaStorage`. 

Chạy test để xác nhận:
```bash
cd backend
npm run test -- lockets.storage.test.ts
# Hoặc chạy lệnh test khói của GĐ4
npm run test:smoke
```

Nếu console log không báo lỗi `LOCKET_STORAGE_BUCKET_INVALID` tức là pipeline đã thông!
