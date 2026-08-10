# CLAUDE.md

> **Đọc file này trước khi làm bất kỳ việc gì trong repo.**
> Đây là **entry point** cho AI (Claude, Cursor, v.v.) — mô tả dự án, kiến trúc, và nơi tìm chi tiết.

## 1. Dự án là gì

**Food Roulette** — mobile app (React Native + Expo, iOS + Android) giúp người dùng Việt Nam **chọn quán ăn ngẫu nhiên xung quanh vị trí hiện tại** bằng cách quay một bánh xe.

Tagline: *"Không biết ăn gì? Để vòng quyết định."*

### USP (điểm khác biệt so với Foody/ShopeeFood)
- **Spin cho nhóm** (tối đa 20 người, vote chấp nhận / quay lại).
- **Locket camera-only** — chỉ chụp từ camera trong app, có GPS + timestamp + device_hash.
- **2 tên hiển thị** — `display_name_private` (trong nhóm bạn) và `display_name_public` (trên profile công khai).
- **Bản đồ quán riêng** — seed Google Places + user-submitted + Steward duyệt.
- **Review thật** — cam kết "review từ người dùng thật, không phải quảng cáo".

## 2. Trạng thái hiện tại

- **Giai đoạn:** Đang xây dựng cấu trúc scalable
- **Branch:** `main`, sạch.
- **Ngôn ngữ UI:** tiếng Việt.
- **Ngôn ngữ code:** TypeScript.
- **Backend:** Express.js + Prisma + MySQL (Docker)

## 3. Cấu trúc repo (Monorepo Scalable)

```
KADA-Food-Roulette/
├── apps/
│   ├── web/                          # React + Vite web app
│   │   ├── src/
│   │   │   ├── api/                  # API client layer
│   │   │   │   ├── client.ts         # Axios instance với interceptors
│   │   │   │   ├── endpoints/        # API endpoint definitions
│   │   │   │   └── index.ts
│   │   │   ├── components/           # Shared components
│   │   │   │   └── layout/           # Layout components
│   │   │   ├── features/             # Feature-based modules
│   │   │   │   ├── auth/            # Auth feature
│   │   │   │   ├── roulette/        # Spin/Roulette feature
│   │   │   │   ├── groups/         # Group spin feature
│   │   │   │   ├── lockets/        # Locket feature
│   │   │   │   ├── restaurants/    # Restaurant feature
│   │   │   │   ├── profile/        # Profile feature
│   │   │   │   ├── checkin/        # Check-in feature
│   │   │   │   └── rewards/        # Rewards/Gamification
│   │   │   ├── hooks/              # Global hooks
│   │   │   ├── stores/             # Zustand stores
│   │   │   ├── lib/                # Utils & constants
│   │   │   └── pages/              # Route pages (thin wrappers)
│   │   └── package.json
│   │
│   └── mobile/                       # Expo + React Native
│       └── app/                       # Expo Router pages (file-based routing)
│           ├── _layout.tsx            # Root layout
│           ├── +not-found.tsx         # 404 page
│           ├── auth/                  # Auth screens
│           │   ├── login.tsx
│           │   └── register.tsx
│           ├── locket/                # Locket screens
│           │   └── capture.tsx
│           ├── restaurant/            # Restaurant screens
│           │   └── [id].tsx
│           └── (tabs)/                # Tab navigation
│               ├── _layout.tsx        # Tab layout
│               ├── index.tsx          # Home
│               ├── spin.tsx           # Spin/Roulette
│               ├── lockets.tsx        # Locket feed
│               └── profile.tsx        # Profile
│       └── src/
│           ├── api/                   # API client & endpoints
│           ├── lib/                   # Utils & constants
│           └── stores/                # Zustand stores
│
├── packages/                         # Shared code (published as npm)
│   ├── ui/                          # Design system
│   ├── types/                       # Shared TypeScript types
│   ├── config/                      # ESLint, Prettier, TSConfig
│   └── utils/                       # Shared utilities
│
├── services/                         # Backend microservices (future-ready)
│   ├── gateway/                      # API Gateway
│   └── (extendable)                  # notification, analytics...
│
├── backend/                          # Main backend (Express.js + Prisma)
│   ├── prisma/                      # Database schema
│   └── src/
│       ├── index.ts                # Express app entry
│       ├── modules/                # Feature modules (auth, roulette, groups...)
│       ├── shared/                 # Shared services & utilities
│       ├── middleware/             # CORS, error handling
│       ├── utils/                  # JWT, hash, response helpers
│       └── lib/                    # Prisma client
│
├── docker/                           # Docker configs
├── scripts/                          # Dev scripts
└── CLAUDE.md                         # File này (entry point cho AI)
```

### Feature Module Pattern

```
features/[feature]/
├── components/          # Feature-specific components
├── hooks/              # Feature hooks (TanStack Query)
├── api/                # Feature API calls
├── types/              # Feature types
└── index.ts            # Public exports
```

## 4. Nơi đọc chi tiết (theo độ ưu tiên)

Khi muốn hiểu sâu hơn, đọc theo thứ tự:

| # | File | Khi nào đọc |
|---|------|-------------|
| 1 | `brand/prompts.md` | Copy/paste vào AI bất kỳ để có context đầy đủ |
| 2 | `brand/brand.md` | Cần biết màu, font, tone, messaging |
| 3 | `brand/FOOD-ROULETTE-SITEMAP.md` | Cần biết cấu trúc trang, tính năng, data model |
| 4 | `content/source/*.docx` | Cần chi tiết marketing/pricing/solution |
| 5 | `app/README.md` | Cần biết stack & cấu trúc source code dự kiến |
| 6 | `AGENTS.md` | Cần biết AI được phép/không được phép làm gì |

**Quy tắc ưu tiên khi mâu thuẫn:**
```
brand/prompts.md  >  brand/brand.md  >  brand/FOOD-ROULETTE-SITEMAP.md  >  content/source/*.docx
```

## 5. Stack công nghệ (đã chốt)

### Backend
| Layer | Lựa chọn |
|-------|----------|
| Runtime | Node.js 22 LTS |
| Framework | Express.js |
| ORM | Prisma |
| Database | MySQL 8.0 (Docker local) / PlanetScale (cloud) |
| Auth | JWT + bcryptjs |
| API | REST |

### Frontend (Web)
| Layer | Lựa chọn |
|-------|----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 7 |
| State | Zustand |
| Data fetching | TanStack Query |
| HTTP | Axios |

### Frontend (Mobile)
| Layer | Lựa chọn |
|-------|----------|
| Framework | Expo SDK 52 + Expo Router |
| Styling | NativeWind (Tailwind cho RN) |
| Animation | Reanimated 3 + Moti |
| State | Zustand + TanStack Query |
| Map | react-native-maps + OpenStreetMap |
| Camera | expo-image-picker + expo-camera |
| GPS | expo-location |

### Infrastructure
| Layer | Lựa chọn |
|-------|----------|
| Container | Docker + Docker Compose |
| Backend Hosting | Railway / Render (free tier) |
| Web Hosting | Vercel / Netlify (free tier) |
| DB Cloud | PlanetScale / Supabase (free tier) |
| CI/CD | GitHub Actions |

## 6. Phạm vi v1.0 (MVP)

✅ Auth (email + Google) · Onboarding · **Spin cá nhân** · **Group spin (max 20, mutual opt-in, vote)** · **Locket camera-only** · Locket feed · Profile công khai · **Thêm quán user-submitted** (chờ steward duyệt) · **Steward dashboard** · Google Places lookup/seed.

❌ Để **v1.2**: AI moderation text, AI gợi ý khẩu vị. Để **v2.0**: gamification/streak, chat, AI Food Advisor.

## 7. Ràng buộc cốt lõi (đọc trước khi code)

1. `Group.member_ids.length <= 20` (enforced DB + app).
2. `Locket.image_url` chỉ nhận từ endpoint upload của app — backend từ chối nếu thiếu `device_hash` hoặc `captured_at` lệch server time > 60s.
3. `Locket.visibility='public'` hiển thị trên profile công khai, **không** lộ `display_name_private`.
4. `Restaurant.source='user_submitted'` chỉ xuất hiện trong roulette sau khi `status='approved'`.
5. `Friendship` mutual: cả 2 bên `accepted` mới là bạn.
6. `User.public_id` immutable sau khi tạo (dùng để share profile an toàn).
7. Camera permission phải được xin trước khi mở capture screen.
8. EXIF gốc của ảnh bị strip trước khi lưu.
9. Design language: **Earthy / nâu-vàng, warm-light-first** — KHÔNG dùng dark mode làm default, KHÔNG dùng cam đỏ.

Chi tiết hơn → `brand/FOOD-ROULETTE-SITEMAP.md` §19.

---

## 8. Kiến trúc Scalable & Extensible

### Cấu trúc Monorepo
- `apps/` - Applications deployable (web, mobile)
- `packages/` - Shared code publish as npm
- `services/` - Microservices (future-ready)
- `backend/` - Main backend với module pattern

### Khi nào cần tách microservice?
| Trigger | Action |
|---------|--------|
| Auth bottleneck | Tách `auth-service` |
| Real-time cần nhiều | Thêm WebSocket service |
| Analytics phức tạp | Tách `analytics-service` |

### Technology Swap Options
| Component | Current | Swap to |
|-----------|---------|---------|
| Database | MySQL | PostgreSQL |
| ORM | Prisma | Drizzle |
| API | Express | NestJS |
| Auth | JWT | Auth0/Clerk |

---

## 9. Quy ước khi viết code

- **Ngôn ngữ:** TypeScript, strict mode.
- **Style:** ESLint + Prettier (Expo defaults + Airbnb-ish).
- **Commit:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`...).
- **Branch:** `feature/<slug>` cho mỗi feature, PR vào `main`.
- **Folder trong app:** dùng Expo Router (file-based routing, `app/`).
- **Tailwind tokens:** map 1-1 với `brand/brand.md` — đặt trong `app/tailwind.config.js`.

### Quy Tắc Đồng Bộ Files (CRITICAL)

> **Khi thay đổi BẤT KỲ file nào, PHẢI cập nhật TẤT CẢ files liên quan.**

| Thay đổi... | Phải đồng bộ... |
|--------------|------------------|
| `docs/*.xml` (ERD) | `backend/prisma/schema.prisma`, `migrations/`, `ERD_MIGRATION_NOTES.md` |
| `schema.prisma` | `docs/*.xml`, `backend/prisma/migrations/*.sql` |
| `brand/prompts.md` | `brand/brand.md`, `brand/FOOD-ROULETTE-SITEMAP.md`, `PROMPT_TEMPLATES/` |
| `brand/brand.md` | `app/tailwind.config.js` |
| `VIBE_RULES.md` | `CLAUDE.md`, `AGENTS.md`, `PROMPT_TEMPLATES/*.md` |

**Xem chi tiết:** `VIBE_RULES.md` §8 - Cross-File Consistency

## 10. Cách dùng file này

1. **Bắt đầu chat mới với AI?** Copy nội dung file này + `brand/prompts.md` (hoặc copy nguyên §0 của `prompts.md`) là đủ.
2. **AI đang đọc nhầm spec?** Trỏ AI về `brand/prompts.md` và `brand/FOOD-ROULETTE-SITEMAP.md` §19.
3. **Cập nhật spec?** Sửa `brand/prompts.md` trước (single-source-of-truth), rồi sửa các file liên quan.

## 11. Vibe Coding Team Rules

> **5 Roles cố định** — mỗi người có thể dùng AI tool khác nhau (Cursor/ChatGPT/Claude/Gemini)

### Files bắt buộc đọc

| File | Mục đích |
|------|----------|
| `VIBE_RULES.md` | 10 golden rules cho vibe coding |
| `AGENTS.md` | Role templates + conventions |
| `CHANGELOG_SPEC.md` | Track spec changes |
| `PROMPT_TEMPLATES/*` | Context packets cho từng AI tool |

### Quick Start cho mỗi AI Tool

| Tool | Template |
|------|----------|
| Cursor | `.cursorrules` auto-loads |
| ChatGPT | `PROMPT_TEMPLATES/chatgpt-context.md` |
| Claude | `PROMPT_TEMPLATES/claude-context.md` |
| Gemini | `PROMPT_TEMPLATES/gemini-context.md` |

### 10 Golden Rules

1. **Đọc spec trước** — Không code khi chưa đọc `brand/prompts.md` §0
2. **Không tự thêm tính năng** — Muốn thêm phải hỏi PM/team
3. **Check 3 files trước khi code** — prompts.md, brand.md, SITEMAP.md
4. **Mỗi AI đều phải tuân thủ** — Cursor, ChatGPT, Claude, Gemini
5. **Spec thay đổi → Log** vào `CHANGELOG_SPEC.md`
6. **Verify trước khi commit** — Type check, lint pass
7. **Code phải match spec** — Không pragmatic override
8. **Mỗi feature có owner** — Role responsible được ghi rõ
9. **Privacy & Security** — Không bao giờ commit credentials
10. **Khi không chắc — Hỏi** — Đừng đoán spec

### Team Roles

| Role | Feature | Người | Stack |
|------|---------|-------|-------|
| **SPIN Lead** | Personal Spin + Group Spin | Hoàng Hiếu | React Native + Expo + NativeWind + Reanimated |
| **AUTH Lead** | Auth + Onboarding | Trường | Supabase Auth + Express + Prisma |
| **LOCKET + PROFILE Lead** | Locket + Profile | Gia Bình | React Native + Expo + Supabase Storage |
| **REVIEW + DISCOVER Lead** | Review + Discover + DevOps | Thành Nam | Supabase + GitHub Actions + EAS Build |
| **PM + B2B Lead** | Project Management + B2B | Tuấn Anh | Architecture + Scope Control |

Chi tiết: `VIBE_RULES.md` §8 và `AGENTS.md` §10

## 11. Dataset Reference

### googleplaystore_cleaned.csv

**Source:** `i:\My Drive\Bài Tập\AI-FullStack\Module 4\Dataset\googleplaystore_cleaned.csv`

**Mô tả:** Dữ liệu ứng dụng Google Play Store đã chuẩn hóa (~8,892 dòng)

| # | Tên cột | Kiểu | Mô tả |
|---|---------|------|--------|
| 1 | `App` | str | Tên ứng dụng |
| 2 | `Category` | str | Danh mục (ART_AND_DESIGN, FAMILY, GAME...) |
| 3 | `Rating` | float64 | Đánh giá (0-5) |
| 4 | `Reviews` | int64 | Số lượt đánh giá |
| 5 | `Size` | str | Kích thước gốc (có M, k, Varies...) |
| 6 | `Type` | str | Free / Paid |
| 7 | `Price` | str | Giá gốc (có $, 0 cho miễn phí) |
| 8 | `Content Rating` | str | Phân loại nội dung (Everyone, Teen...) |
| 9 | `Genres` | str | Thể loại (có ; cho multi-category) |
| 10 | `Last Updated` | str | Ngày cập nhật gốc (dạng text) |
| 11 | `Current Ver` | str | Phiên bản hiện tại |
| 12 | `Android Ver` | str | Phiên bản Android tối thiểu |
| 13 | `Size_MB` | float64 | **Cột mới** - Kích thước đã chuẩn hóa (MB) |
| 14 | `Installs_Num` | int64 | **Cột mới** - Số lượt cài đặt (đã bỏ +, ,) |
| 15 | `Price_Num` | float64 | **Cột mới** - Giá đã chuẩn hóa (USD, đã bỏ $) |
| 16 | `Last_Updated_Date` | datetime64 | **Cột mới** - Ngày cập nhật (datetime) |
| 17 | `Main_Genre` | str | **Cột mới** - Thể loại chính (lấy phần trước `;`) |

**Các cột mới được tạo trong quá trình chuẩn hóa:** `Size_MB`, `Installs_Num`, `Price_Num`, `Last_Updated_Date`, `Main_Genre`

**Các bước chuẩn hóa đã thực hiện:**
- Xóa 483 dòng trùng
- Xóa dòng Reviews không phải số
- Xóa dòng Rating ngoài [0, 5]
- Xóa cột `Installs` gốc (đã thay bằng `Installs_Num`)
- Điền Rating NaN bằng trung bình theo Category

---

*Phiên bản: 1.2 · Cập nhật: 2026-08-06 · Added Vibe Coding Team Rules §11*
