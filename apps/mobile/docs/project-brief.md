# Project Brief

Cửa ngõ dự án — AI đọc file này trước khi làm bất kỳ feature nào để hiểu context của KADA Food Roulette Mobile App.

---

## Tên app

**Food Roulette** (KADA Food Roulette Mobile)

## Mục đích

Giúp người dùng Việt Nam giải quyết câu hỏi "Hôm nay ăn gì?" bằng cách quay vòng quay chọn quán ăn ngẫu nhiên xung quanh vị trí hiện tại.

## Brief

> Mobile app hỗ trợ quay bánh xe chọn món ăn/quán ăn ngẫu nhiên dựa trên vị trí GPS thực tế.
> 
> **Điểm khác biệt cốt lõi (USP):**
> - **Spin cho nhóm:** Tối đa 20 người tham gia realtime, cùng vote chấp nhận hoặc quay lại.
> - **Locket camera-only:** Chỉ chụp từ camera trực tiếp trong app (kèm GPS + timestamp + device_hash), không chọn từ thư viện ảnh để đảm bảo review chân thực.
> - **2 tên hiển thị:** `display_name_private` (hiển thị trong nhóm bạn) và `display_name_public` (trên profile công khai).
> - **Bản đồ quán riêng:** Tích hợp dữ liệu từ Google Places, đóng góp từ người dùng và kiểm duyệt qua hệ thống Steward.
> - **Review thật:** Đánh giá minh bạch từ trải nghiệm ăn uống thực tế của người dùng.
> 
> **Target user:** Giới trẻ, dân văn phòng, các nhóm bạn thường xuyên phân vân "không biết ăn gì".

## Platform target

- [x] Android
- [x] iOS
- [x] Cả 2

## Tech stack

- **Framework**: Expo SDK 52 + React Native 0.76.9 (TypeScript)
- **Routing**: Expo Router v4 (File-based routing)
- **Styling**: NativeWind v4 (TailwindCSS v3) + React Native Reanimated 3
- **Local storage / State**: AsyncStorage + Expo SecureStore + Zustand v5 + React Query v5
- **Backend**: Node.js + Express.js + Prisma ORM
- **DB**: MySQL 8.0 (Docker container)
- **Auth**: Supabase Auth / JWT + Google OAuth

## Links

- **Repo**: `d:\KADA-Food-Roulette`
- **Backend URL**: `http://localhost:5047` (Local Dev)
- **Figma**: `<Cập nhật sau>`
- **Analytics dashboard**: `<Cập nhật sau>`
- **Sentry**: `<Cập nhật sau>`

## Team

- **PM & Architecture**: Tuấn Anh
- **Spin Lead (Personal & Group Spin)**: Hoàng Hiếu
- **Auth & Onboarding Lead**: Trường
- **Locket & Profile Lead**: Gia Bình
- **Review & Discover / DevOps**: Thành Nam

## Timeline

- **Started**: `2026-08-01`
- **Target MVP**: `2026-09-30`
- **Current phase**: `MVP dev` (Đang phát triển các feature chính)

---

## Diagrams (tick nếu muốn AI auto-gen)

Diagram nằm ở **`docs/diagrams/`** (global scope — dùng chung cho project, không nằm trong feature).
AI sẽ generate file `.mmd` (Mermaid) khi user tick:

- [x] **Architecture** (`architecture.mmd`) — client ↔ backend ↔ DB, component overview
- [x] **Sequence** (`sequence-spin-flow.mmd`) — flow tương tác (VD auth: login → JWT, Spin nhóm realtime)
- [x] **Data flow** (`data-flow.mmd`) — state lifecycle (local → mirror → backend → poll → merge)
- [x] **ER** (`er.mmd`) — entity relationship, data model, foreign keys
- [x] **Navigation flow** (`navigation.mmd`) — screen ↔ screen (home → spin → result → review)
- [x] **Component tree** (`component-tree-spin.mmd`) — parent/child hierarchy trong màn hình quay bánh xe

Khi có feature mới đủ lớn để đổi architecture → update diagram tương ứng (không tạo mới per-feature).

