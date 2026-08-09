# 🍜 Food Roulette - Sitemap & Đặc tả thiết kế

## 1. Mục tiêu của cấu trúc

- Giúp người dùng hiểu trong khoảng **5 giây**: đây là ứng dụng gì, giải quyết vấn đề gì và hoạt động như thế nào.
- Dẫn người dùng theo một luồng duy nhất: **thấy vấn đề → hiểu giải pháp → thử ngay → chia sẻ → tin tưởng**.
- Giữ phiên bản đầu gọn nhẹ: một landing page chính, module roulette, module Taste Board, và các trang phụ cần thiết.
- Không mô tả sản phẩm như đã hoàn thiện; mọi hình ảnh minh họa phải có nhãn **"Giao diện minh họa"** hoặc **"Tính năng dự kiến"**.

---

## 2. Pain Points cần giải quyết

| Vấn đề | Mô tả |
|--------|-------|
| 🤔 **Không biết ăn gì** | Quá nhiều lựa chọn hoặc không có ý tưởng |
| ⏰ **Tốn thời gian quyết định** | Scroll menu, hỏi bạn bè mất 30 phút |
| 📸 **Muốn chia sẻ món ăn** | Thấy món ngon nhưng không biết giới thiệu sao |
| ⭐ **Cần review thật** | Review trên mạng thường không đáng tin |

---

## 3. Sơ đồ sitemap

```text
/
├── #trang-chu
│   ├── Thanh điều hướng
│   └── Hero + CTA chính
├── #van-de
│   └── Ba tình huống phổ biến
├── #cach-hoat-dong
│   ├── Quy trình 3 bước
│   └── Tính năng chính
├── #tinh-nang
│   ├── 🎰 Roulette thông minh
│   ├── 🔒 Food Taste Board
│   ├── ⭐ Review thật
│   └── 📍 Khám phá xung quanh
├── #doi-tuong-su-dung
│   ├──Người độc thân
│   ├── 👫 Cặp đôi
│   ├── 👨‍👩‍👧‍👦 Gia đình
│   └── 👥 Nhóm bạn
├── #social-proof
│   ├── Thống kê người dùng
│   └── Testimonials
├── #dang-ky
│   └── Form đăng ký / Download app
├── #faq
│   └── Câu hỏi thường gặp
└── #cta-cuoi
    └── CTA đăng ký + Footer

/spin
├── Trang roulette chính
├── Bộ lọc (cuisine, khoảng cách, giá, chế độ ăn)
└── Kết quả spin + hành động

/taste-boards
├── Trang chủ Taste Board
├── Tạo Taste Board mới
├── Taste Board của tôi
├── Taste Board được chia sẻ
└── Khám phá Taste Board cộng đồng

/taste-boards/[id]
├── Chi tiết Taste Board
├── Gallery ảnh
├── Bình luận
└── Hành động (save, share, want this too)

/reviews
├── Trang reviews cộng đồng
├── Viết review
├── Chi tiết review
└── Bộ lọc (gần tôi, xu hướng, mới nhất)

/profile/[username]
├── Trang cá nhân
├── Thành tích
├── Hoạt động của tôi
└── Cài đặt

/dang-nhap
/dang-ky

/chinh-sach-bao-mat
/dieu-khoan-su-dung
```

---

## 4. Cấu trúc trang chủ

| Thứ tự | Khu vực | Mục đích | Nội dung chính | Hành động |
|--------|---------|----------|----------------|-----------|
| 01 | Hero | Định vị sản phẩm ngay lập tức | Spin wheel animation, tagline chính | **Thử ngay** |
| 02 | Vấn đề | Tạo sự đồng cảm | Không biết ăn gì, tốn thời gian, muốn chia sẻ | Xem giải pháp |
| 03 | Cách hoạt động | Làm rõ cơ chế | Spin → Khám phá → Chia sẻ | Thử spin |
| 04 | Tính năng | Chứng minh tính hữu ích | Roulette, Taste Board, Reviews, Map | Khám phá thêm |
| 05 | Đối tượng | Cá nhân hóa thông điệp | 4 nhóm người dùng phổ biến | Đăng ký theo nhóm |
| 06 | Social Proof | Xây dựng niềm tin | Stats, testimonials, reviews | Đọc review |
| 07 | Đăng ký / CTA | Thu lead / download | Form đăng ký hoặc download app | **Bắt đầu ngay** |
| 08 | FAQ | Gỡ rào cản | Câu hỏi về tính năng, bảo mật, chi phí | Mở từng câu hỏi |
| 09 | CTA cuối | Chốt chuyển đổi | "Sẵn sàng quyết định nhanh hơn?" | **Thử miễn phí** |

---

## 5. Điều hướng chính

### Desktop

- Logo / `Food Roulette`
- Tính năng
- Cách hoạt động
- Reviews
- Câu hỏi thường gặp
- Nút **Thử ngay / Đăng ký**

### Mobile

- Logo / `Food Roulette`
- Menu thu gọn (hamburger)
- Nút CTA cố định ở bottom hoặc luôn hiện ở vùng dễ chạm
- Các liên kết cuộn đến đúng section trên cùng một trang

---

## 6. Luồng chuyển đổi chính

```text
Nguồn truy cập (Social, Search, Referral)
    ↓
Hero: hiểu lợi ích trong 5 giây (spin wheel + tagline)
    ↓
Vấn đề + cách hoạt động (3 bước)
    ↓
Tính năng chính (Roulette, Taste Board, Reviews)
    ↓
Social proof + testimonials
    ↓
Form đăng ký / Download app
    ↓
Onboarding → Spin đầu tiên
    ↓
Tạo Taste Board / Viết Review
    ↓
Chia sẻ với bạn bè
```

**CTA tracking labels:**

- `hero_primary` - CTA hero chính
- `spin_cta` - Nút spin ở giữa trang
- `features_card` - CTA ở card tính năng
- `locket_preview` - CTA xem trước Taste Board
- `final_cta` - CTA cuối trang

---

## 7. Metadata & SEO ban đầu

| Trang | Title đề xuất | Mô tả | Từ khóa |
|-------|--------------|-------|---------|
| `/` | Food Roulette - Quyết định món ăn trong 3 giây | Không biết ăn gì? Để Food Roulette chọn cho bạn. Spin ngẫu nhiên, khám phá món mới, chia sẻ với bạn bè. | quyết định món ăn, spin ăn uống, gợi ý nhà hàng, random food picker |
| `/spin` | Spin Ngay - Food Roulette | Thử vận may với bánh xe quay roulette ẩm thực. Bộ lọc theo loại món, khoảng cách, giá cả. | spin món ăn, roulette ẩm thực, quyết định ăn gì |
| `/lockets` | Food Taste Board - Chia sẻ & Sưu tầm món ngon | Tạo bộ sưu tập món ăn yêu thích. Chia sẻ với bạn bè, xem review thật từ cộng đồng. | food locket, chia sẻ món ăn, sưu tầm món ngon |
| `/reviews` | Reviews thật - Food Roulette | Đọc review ẩm thực từ người dùng thật. Tìm món ngon được đánh giá cao gần bạn. | review nhà hàng, review món ăn, đánh giá ẩm thực |

---

## 8. Phạm vi phiên bản đầu (v1.0)

### Làm ngay

- Landing page một trang với đầy đủ các section.
- Module Roulette cơ bản (spin wheel, filters, result card).
- Module Taste Board cơ bản (tạo, xem, chia sẻ).
- Trang Reviews cơ bản (xem, viết, filter).
- Trang Profile và Settings.
- Đăng ký / Đăng nhập.
- Chính sách bảo mật và điều khoản sử dụng.
- Theo dõi: spin, tạo locket, viết review, chia sẻ.

### Để giai đoạn sau (v1.5+)

- Trang bảng giá độc lập (nếu có premium).
- Module AI-powered suggestions.
- Interactive map đầy đủ.
- Push notifications.
- Gamification (achievements, streaks).
- Tích hợp đặt hàng trực tiếp.
- Multi-city support.
- Trang đối tác / nhà hàng.
- Trung tâm tài liệu / help center.

---

## 9. Nguyên tắc nội dung bắt buộc

### Tone giọng (5 tính từ)

**Rõ ràng, vui vẻ, tin cậy, nhanh, gần gũi.**

### Cách nói đúng

- Nói thẳng vào lợi ích: quyết định nhanh, chia sẻ dễ dàng, tìm món ngon.
- Dùng ngôn ngữ đời thường: spin, quay, locket, review, món ngon.
- Ưu tiên câu ngắn, có động từ mạnh.
- Tập trung vào cảm xúc (vui khi tìm được món mới, hào hứng khi chia sẻ).

### Cách nói tránh

- Không phóng đại kiểu "luôn luôn đúng", "tuyệt đối hoàn hảo".
- Không dùng thuật ngữ kỹ thuật nếu không cần thiết.
- Không hứa hẹn mơ hồ về kết quả.
- Không so sánh trực tiếp với đối thủ.

### Từ ngữ thống nhất

- Dùng: **"spin"**, không dùng "quay số", "lucky draw"
- Dùng: **"locket"**, không dùng "bộ sưu tập", "danh sách yêu thích"
- Dùng: **"review"**, không dùng "đánh giá" (dùng cho rating)
- Dùng: **"món ăn"**, "nhà hàng"**, không dùng "đồ ăn", "cửa hàng"

### Câu mẫu

- "Quyết định trong 3 giây, không phí thời gian."
- "Chia sẻ món ngon với bạn bè chỉ bằng một lần nhấn."
- "Review từ người dùng thật, không phải quảng cáo."
- "Khám phá món mới mỗi ngày, không bao giờ nhàm chán."

---

## 10. Design Language (Earthy — Warm)

> Hệ thiết kế này lấy từ `brand/brand.md` — đồng bộ 100% với Brand Kit. Mọi token dưới đây phải khớp với bảng màu, typography, tone trong brand.md.

### Bảng màu

| Token | Hex | Vai trò | Cách dùng |
|-------|-----|---------|-----------|
| `--brand-primary` | `#3D2314` | Espresso — màu chủ đạo | Logo, text chính, nút CTA chính, border mạnh |
| `--brand-primary-dark` | `#5C3317` | Dark Roast — nền tối | Header, footer, card nổi bật |
| `--brand-primary-soft` | `#8B4513` | Saddle Brown — phụ | Icon, dividers, accent đậm |
| `--brand-accent` | `#C68E17` | Golden — accent chính | CTA, rating star, highlight, link |
| `--brand-accent-soft` | `#D4A574` | Caramel — phụ | Button secondary, hover, badge |
| `--brand-accent-bg` | `#F5DEB3` | Butter Yellow — nền nhẹ | Section background, tag highlight |
| `--brand-bg` | `#FDF5E6` | Cream — nền chính | Body background mặc định (light mode) |
| `--brand-bg-soft` | `#FAF0E6` | Linen — nền phụ | Section xen kẽ |
| `--brand-bg-card` | `#F5F0EB` | Beige — card | Card background, surface nhẹ |
| `--brand-text` | `#2C1810` | Brown 900 | Text chính, heading |
| `--brand-text-muted` | `#9C8B7A` | Warm Gray | Caption, meta, label |
| `--brand-border` | `#D4C5B5` | Border Brown | Divider, border nhẹ |

### Dark mode (khi toggle)

| Token | Hex | Vai trò |
|-------|-----|---------|
| `--brand-bg` | `#1A0F0A` | Dark Espresso — background |
| `--brand-bg-card` | `#2D1F15` | Dark Roast — card / elevated surface |
| `--brand-border` | `#3D2D25` | Border Dark |
| `--brand-text` | `#F5F0EB` | Text Light |
| `--brand-text-muted` | `#B8A090` | Text Muted |

### Typography

**Font chính (khớp brand.md):**
- Heading: **Plus Jakarta Sans** (ExtraBold 800, Bold 700, SemiBold 600)
- Body: **Inter** (Regular 400, Medium 500, SemiBold 600)
- Fallback tiếng Việt: **Be Vietnam Pro** → system-ui

**Thang cỡ chữ (khớp brand.md):**

| Cấp | Font | Size | Weight | Line-height | Dùng cho |
|-----|------|------|--------|-------------|----------|
| Display | Plus Jakarta Sans | 48px | 800 | 1.1 | Hero title |
| H1 | Plus Jakarta Sans | 36px | 700 | 1.2 | Page title |
| H2 | Plus Jakarta Sans | 28px | 700 | 1.25 | Section title |
| H3 | Plus Jakarta Sans | 22px | 600 | 1.3 | Card title |
| H4 | Plus Jakarta Sans | 18px | 600 | 1.4 | Sub section |
| Body Large | Inter | 18px | 400 | 1.6 | Mô tả dài |
| Body | Inter | 16px | 400 | 1.5 | Nội dung chính |
| Body Small | Inter | 14px | 400 | 1.5 | Caption, meta |
| Caption | Inter | 12px | 500 | 1.4 | Tag, label |
| Button | Inter | 16px | 600 | 1.0 | CTA |

### Nguyên tắc thiết kế

1. **Warm-light-first** — nền kem/beige làm mặc định; dark mode là tùy chọn.
2. **Accent vàng nâu** (`#C68E17`) cho CTA và highlight — không dùng đỏ/cam cháy.
3. **Card có shadow nhẹ + border ngà** — không glassmorphism, không gradient đậm.
4. **Micro-interactions mượt** — dùng easing `ease-out`, 200–300ms, tôn trọng `prefers-reduced-motion`.
5. **Trust signals kiểu "nhà bếp"** — stats, badges, testimonial hiển thị tự nhiên, không marketing-sleek.
6. **Hình ảnh warm** — tăng warmth +15%, saturation +10% theo brand.md.

### Nguyên tắc tone giọng (từ brand.md)

- **4 tính từ:** Ngắn gọn · Rõ ràng · Bình thường · Có ích.
- **Xưng "mình – bạn"**, không "quý khách".
- **Emoji vừa đủ**, đặt đúng chỗ.
- **Không nói cố ý dí dỏm**, không viết dài.

---

## 11. Kiến trúc trang chi tiết

```
FOOD-ROULETTE-WEBSITE
│
├── 🏠 Trang chủ (/)
│   ├── Hero với Spin Wheel animation
│   ├── Section "Vấn đề của bạn"
│   ├── Section "Cách hoạt động" (3 bước)
│   ├── Section "Tính năng chính"
│   ├── Section "Đối tượng sử dụng"
│   ├── Section "Social Proof"
│   ├── Section "Đăng ký / CTA"
│   ├── Section "FAQ"
│   └── Footer
│
├── 🎰 Trang Roulette (/spin)
│   ├── Spin Wheel Component
│   │   ├── Idle state
│   │   ├── Spinning animation
│   │   └── Result reveal
│   ├── Filters Panel
│   │   ├── Loại món (Vietnamese, Japanese, Korean...)
│   │   ├── Khoảng cách (slider 1-10km)
│   │   ├── Mức giá ($ - $$$$)
│   │   └── Chế độ ăn (vegetarian, vegan, halal...)
│   ├── Result Card
│   │   ├── Restaurant info
│   │   ├── Món ăn đề xuất
│   │   ├── Quick actions (view, save, share)
│   │   └── "Quay lại" / "Đây là lựa chọn của tôi!"
│   └── Quick Spin Button (bỏ qua filter)
│
├── 🔒 Trang Taste Board (/lockets)
│   ├── Tab: Taste Board của tôi
│   │   ├── Danh sách locket đã tạo
│   │   ├── Tạo locket mới
│   │   └── Quản lý locket
│   ├── Tab: Được chia sẻ với tôi
│   │   ├── Danh sách locket từ bạn bè
│   │   └── Thông báo locket mới
│   └── Tab: Khám phá
│       ├── Taste Board xu hướng
│       ├── Taste Board gần tôi
│       └── Taste Board từ người tôi theo dõi
│
├── 🔒 Chi tiết Taste Board (/lockets/[id])
│   ├── Header: Tên locket, người tạo, số items
│   ├── Gallery: Ảnh carousel ngang
│   ├── Items List
│   │   ├── Thông tin món ăn
│   │   ├── Rating & review
│   │   ├── Ghi chú từ người tạo
│   │   └── Tags
│   ├── Actions
│   │   ├── "Tôi cũng muốn ăn!" (Want This Too)
│   │   ├── Lưu vào Taste Board của tôi
│   │   └── Chia sẻ
│   ├── Comments
│   │   ├── Bình luận từ bạn bè
│   │   └── Thêm bình luận
│   └── QR Code để chia sẻ offline
│
├── ⭐ Trang Reviews (/reviews)
│   ├── Filters: Gần tôi, Xu hướng, Mới nhất, Theo dõi
│   ├── Review Cards Grid
│   │   ├── User avatar & name
│   │   ├── Restaurant info
│   │   ├── Rating stars
│   │   ├── Nội dung review
│   │   ├── Ảnh đính kèm
│   │   └── Actions (helpful, comment, save)
│   ├── Write Review Button (FAB trên mobile)
│   └── Write Review Modal
│       ├── Tìm kiếm nhà hàng
│       ├── Rating tổng + chi tiết
│       ├── Nội dung review
│       ├── Upload ảnh (tối đa 5)
│       ├── Tags (tối đa 5)
│       └── Tùy chọn lưu vào Taste Board
│
├── 👤 Trang Profile (/profile/[username])
│   ├── Avatar & Info
│   ├── Stats: Spins, Reviews, Taste Boards
│   ├── Achievements & Badges
│   ├── Taste Profile (biểu đồ)
│   ├── Tabs: Reviews, Taste Boards, Spins, Đã lưu
│   └── Settings Button (nếu là profile của mình)
│
├── 🔐 Dashboard (/dashboard)
│   ├── Tổng quan
│   │   ├── Stats overview
│   │   └── Recent activity
│   ├── Quản lý Taste Board
│   ├── Reviews của tôi
│   ├── Lịch sử Spin
│   ├── Nhà hàng đã lưu
│   └── Cài đặt
│       ├── Tài khoản
│       ├── Thông báo
│       ├── Quyền riêng tư
│       └── Ứng dụng đã kết nối
│
├── 🔐 Đăng nhập / Đăng ký (/login, /register)
├── 📄 Chính sách bảo mật (/chinh-sach-bao-mat)
├── 📄 Điều khoản sử dụng (/dieu-khoan-su-dung)
└── 📱 Mobile App (tương lai)
```

---

## 12. Luồng người dùng chính

### Luồng 1: Quyết định nhanh

```
Mở app/landing → Nhấn "Spin" → (Tùy chọn) Điều chỉnh bộ lọc →
Bánh xe quay → Xem kết quả → [Thích] → Xem chi tiết →
Điều hướng / Gọi món
          ↓
     [Không thích] → Quay lại spin
```

### Luồng 2: Chia sẻ món ăn

```
Thấy/tự ăn món ngon → "Lưu vào Taste Board" → Chọn hoặc tạo Taste Board →
Thêm ghi chú, ảnh → Chia sẻ cho bạn bè →
Bạn bè nhận thông báo → Họ có thể "Tôi cũng muốn ăn!"
```

### Luồng 3: Xây dựng uy tín

```
Ghé thăm nhà hàng → Viết Review →
Đánh giá (tổng + chi tiết) → Thêm ảnh & tags →
Tùy chọn lưu vào Taste Board → Đăng review →
Nhận likes & comments → Tích lũy followers & badges
```

---

## 13. Component Inventory

### 1. Spin Wheel Component

| Trạng thái | Mô tả |
|------------|-------|
| Idle | Bánh xe đứng yên, có thể nhấn spin |
| Spinning | Animation 3D rotation với easing deceleration |
| Result | Hiệu ứng reveal kết quả với confetti/chime |
| Error | Thông báo lỗi, nút retry |

- **Interaction**: Click/tap to spin, haptic feedback on mobile
- **Sound**: Tiếng quay (tùy chọn), tiếng kết quả

### 2. Restaurant Card

| Trạng thái | Mô tả |
|------------|-------|
| Default | Ảnh, tên, rating, khoảng cách, giá |
| Hover | Slight lift, hiện quick actions |
| Expanded | Full details, menu preview, directions |
| Loading | Skeleton với shimmer |
| Empty | "Không tìm thấy nhà hàng phù hợp" |

### 3. Taste Board Card

| Trạng thái | Mô tả |
|------------|-------|
| Default | Cover image, tên, số items, người tạo |
| Hover | Preview items (carousel) |
| Shared | Hiện số chia sẻ, reactions |
| Empty | "Chưa có món nào" state |

### 4. Review Card

| Trạng thái | Mô tả |
|------------|-------|
| Default | Avatar, rating stars, excerpt, photos |
| Expanded | Full review, detailed ratings, tags |
| Own Review | Hiện Edit/Delete actions |

### 5. User Avatar

| Kích thước | Pixel | Sử dụng |
|------------|-------|---------|
| Small | 32px | Comments, notifications |
| Medium | 48px | Cards, lists |
| Large | 96px | Profile header |
| XL | 128px | Profile page |

- **States**: Online indicator, verified badge, achievement ring
- **Fallback**: Initials on gradient background

### 6. Action Buttons

| Loại | Mô tả |
|------|-------|
| Primary | Gradient background (Orange), white text |
| Secondary | Ghost/outline style |
| Icon | Circular với tooltip |
| Loading | Spinner replacement |

### 7. Filter Chips

| Trạng thái | Mô tả |
|------------|-------|
| Default | Outlined, secondary color |
| Selected | Filled với accent color |
| Category Groups | Cuisine, Distance, Price, Dietary |

---

## 14. Technical Considerations

### Frontend Stack

| Công nghệ | Gợi ý |
|-----------|-------|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + custom design tokens |
| Animation | Framer Motion |
| Maps | Mapbox hoặc Google Maps API |
| State Management | Zustand |
| UI Components | shadcn/ui hoặc Radix |

### Backend Stack

| Công nghệ | Gợi ý |
|-----------|-------|
| API | Next.js API Routes hoặc tRPC |
| Database | Supabase hoặc PostgreSQL |
| Auth | NextAuth.js / Supabase Auth |
| Storage | Cloudinary hoặc Supabase Storage (images) |
| Search | Algolia hoặc Meilisearch |
| Location | Google Places API |

### Data Models

```typescript
// User
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  preferences: FoodPreferences;
  stats: UserStats;
  achievements: Achievement[];
}

// Restaurant
interface Restaurant {
  id: string;
  name: string;
  location: GeoLocation;
  cuisine: CuisineType[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  images: string[];
  menu?: MenuItem[];
}

// Taste Board
interface Taste Board {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  type: 'photo' | 'review' | 'recommendation' | 'discovery';
  items: Taste BoardItem[];
  isPublic: boolean;
  sharedWith?: string[]; // user IDs
  createdAt: Date;
  updatedAt: Date;
}

// Taste BoardItem
interface Taste BoardItem {
  id: string;
  restaurantId?: string;
  dishName?: string;
  image: string;
  note?: string;
  rating?: number;
  addedBy: string;
  addedAt: Date;
}

// Review
interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  overallRating: number;
  ratings: DetailRatings;
  content: string;
  photos: string[];
  tags: string[];
  createdAt: Date;
  helpful: number;
  locketId?: string;
}
```

---

## 15. Responsive Breakpoints

| Breakpoint | Chiều rộng | Điều chỉnh layout |
|------------|------------|-------------------|
| Mobile | < 640px | Single column, bottom nav, cards full-width |
| Tablet | 640-1024px | 2-column grid, sidebar collapses |
| Desktop | 1024-1440px | 3-column grid, persistent sidebar |
| Large | > 1440px | Max-width container, centered |

---

## 16. Accessibility Requirements

- **Độ tương phản màu**: Tối thiểu 4.5:1 cho text
- **Điều hướng bàn phím**: Hỗ trợ tab đầy đủ
- **Screen Reader**: Labels ARIA đúng cách
- **Motion**: Tôn trọng `prefers-reduced-motion`
- **Focus States**: Indicators hiển thị rõ ràng

---

## 17. Tính năng tương lai (v2.0)

- 🤖 AI Food Advisor (chat với bot)
- 📱 Apple Watch / Wear OS app
- 🎮 Gamification (streaks, challenges)
- 🛒 Tích hợp đặt hàng trực tiếp
- 🍴 Tích hợp kế hoạch ăn uống
- 🎥 Video reviews ngắn (TikTok-style)
- 🌍 Hỗ trợ đa thành phố
- 👨‍🍳 Trang dành cho nhà hàng/đối tác

---

## 18. Success Metrics

| Metric | Mô tả |
|--------|-------|
| 📈 DAU | Daily Active Users |
| 🎰 Spins/session | Trung bình số lần spin mỗi phiên |
| 🔒 Taste Boards created | Số locket được tạo & chia sẻ |
| ⭐ Reviews submitted | Số review được đăng |
| 👥 Social shares | Số lần chia sẻ mạng xã hội |
| 📍 Discovery rate | Tỷ lệ khám phá nhà hàng mới |
| ⏱️ Time-to-decision | Thời gian quyết định (nên giảm) |

---

## 19. Quyết định sản phẩm v2.3 (cập nhật 2026-08-06)

> Phần này là **phụ lục ưu tiên cao**, ghi nhận các quyết định mới nhất. Mọi phần khác của tài liệu cần đối chiếu lại khi triển khai.

### 19.1 Hướng sản phẩm

- **Nền tảng:** **React Native (Expo)** — mobile app thật trên iOS + Android. Web/landing page chỉ là trang marketing tĩnh tối thiểu.
- **Lý do:** Cần camera thật, GPS thật, push notifications, App Store presence — vượt quá khả năng PWA.
- **Cơ chế xác thực:** Supabase Auth (email + Google).

### 19.2 Nhóm bạn (Group)

- **Loại quan hệ:** **Mutual opt-in** — cả 2 bên phải chấp nhận mới trở thành bạn.
- **Giới hạn nhóm:** tối đa **20 thành viên/group**.
- **Tính năng "Group spin":** **Có** — cả nhóm cùng quay 1 lần, kết quả là 1 quán mà cả nhóm đồng thuận (mỗi người thấy cùng 1 kết quả, có thể vote "chấp nhận" / "quay lại").
- **Tên hiển thị:** Mỗi user có **2 tên**:
  - `display_name_private` — dùng trong nhóm bạn, có thể là biệt danh.
  - `display_name_public` — tên đại diện trên profile công khai, có thể trùng `display_name_private` hoặc khác.
- **Privacy:** Trong nhóm, mọi locket chỉ chia sẻ nếu user chọn `visibility = "friends"` hoặc `"public"`. Mặc định trong nhóm là `friends`.

### 19.3 Locket — Camera-only

- **Không cho upload ảnh từ thư viện.** Chỉ chụp từ camera trong app.
- **Công nghệ:** `expo-image-picker` ở chế độ `cameraOnly: true` (chặn gallery).
- **Metadata bắt buộc** lưu cùng ảnh:
  - `captured_at` (timestamp thiết bị — kiểm tra hợp lý so với server time).
  - `gps_lat`, `gps_lng` (nếu user cấp quyền).
  - `device_hash` (chuỗi anonymized, giúp truy vết ảnh giả / gửi hàng loạt).
- **EXIF gốc** sẽ bị strip trước khi lưu — server chỉ giữ metadata chuẩn hoá của app.
- **Hiệu ứng / filter:** Có thể cho phép filter nhẹ trong app (warm tone, theo brand guideline). Không cho phép filter làm sai giá trị/authenticity.
- **Locket feed:** Hiển thị theo thứ tự thời gian (chronological, không algorithm ranking) — chính sách cam kết "review thật".

### 19.4 Profile công khai

- **Mỗi user có 1 profile công khai** (`/u/:public_id` hoặc `/profile/:username`).
- **Hiển thị:** avatar, `display_name_public`, bio ngắn, **grid các locket có `visibility = "public"`**, thống kê (số quán đã thử, số nhóm, số locket).
- **Locket `visibility = "friends"`** không xuất hiện trên profile công khai.
- **Tên trong nhóm (`display_name_private`)** không bao giờ hiển thị public.

### 19.5 Bản đồ quán ăn (Restaurant Map)

- **Nguồn dữ liệu 2 lớp:**
  1. **Seed từ Google Places API** — tự động thêm khi search/lookup. Mỗi quán Google có `source = "google_places"` và `google_place_id`.
  2. **User-submitted** — khi user muốn thêm quán không có trên Google. `source = "user_submitted"`, `status = "pending"`.
- **Moderation:**
  - **Steward chỉ duyệt các quán `user_submitted`** (vì Google đã là nguồn tương đối đáng tin).
  - Flow: user thêm → trạng thái `pending` → Steward duyệt → `approved` (có thể hợp nhất với Google Places nếu detect trùng) hoặc `rejected`.
  - **Quán Google Places** vẫn có thể được user contribute thêm ảnh (locket) — không cần steward duyệt ảnh.
- **Chống trùng lặp:**
  - Khi user thêm quán mới, server check khoảng cách (bán kính 50m) + tên gần đúng so với quán Google đã biết → gợi ý "Có phải quán này không?" trước khi tạo mới.
- **Kiểm duyệt review / locket text:** Để phase **v1.2** — có thể dùng AI moderation (OpenAI Moderation API) + report + manual queue.

### 19.6 Phạm vi v1.0 (MVP)

| Tính năng | Status |
|-----------|:------:|
| Auth (email + Google) qua Supabase | ✅ |
| Onboarding (chọn cuisine, vị trí, tên) | ✅ |
| **Spin cá nhân** (random trong bán kính, filter cuisine/giá) | ✅ |
| **Spin Wallet** (Spin System v2) | ✅ |
| **Group spin** (mutual opt-in, max 20 người, vote chấp nhận) | ✅ |
| **Locket capture** (camera-only, có metadata, geotag) | ✅ |
| Locket feed (cá nhân + nhóm + public) | ✅ |
| **Taste Board** (collections của lockets) | ✅ |
| Profile công khai (grid locket public) | ✅ |
| **Thêm quán user-submitted** (chờ steward duyệt) | ✅ |
| **Steward dashboard** (duyệt quán mới) | ✅ |
| Google Places lookup / seed | ✅ |
| **Restaurant Partner (B2B)** | ✅ |
| **Corporate Account (B2B)** | ✅ |
| **Menu Capture** (chụp menu + AI OCR) | ✅ v1.1 |
| **AI Personalization** (suggest best match per member) | ✅ v1.1 |
| Kiểm duyệt review/locket text | ❌ v1.2 |
| Streak / gamification | ❌ v2.0 |
| In-app chat | ❌ v2.0 |
| Web app (chỉ marketing page tĩnh) | có thể có |

### 19.7 Stack công nghệ (đề xuất)

| Layer | Lựa chọn | Ghi chú |
|-------|----------|---------|
| App | **Expo SDK 52 + Expo Router** + TypeScript | EAS Build cho store |
| UI | **NativeWind** (Tailwind cho RN) + tokens Earthy từ `brand.md` | |
| Animation | **Reanimated 3** + **Moti** | Spin wheel, micro-interactions |
| State | **Zustand** + **TanStack Query** | Cache + realtime |
| Map | **react-native-maps** | OpenStreetMap tile (miễn phí) |
| Backend | **Supabase** (Postgres + Auth + Storage + Realtime) | PostGIS cho query bán kính |
| DB extension | **PostGIS** | `ST_DWithin` cho "quán trong 5km" |
| Storage | **Supabase Storage** | Ảnh locket, resize qua Edge Function |
| Camera | **expo-image-picker** (cameraOnly) | |
| Location | **expo-location** | Foreground + background khi cần |
| Push | **Expo Push Notifications** | Free đủ dùng cho v1 |
| Reviews / moderation | **OpenAI Moderation API** (v1.2) | |
| Deploy | **EAS Build** + **Supabase Cloud** | |
| CI/CD | **EAS Submit** + GitHub Actions | |

### 19.8 Data Model (cập nhật theo quyết định trên)

```typescript
// User
interface User {
  id: string;                       // uuid
  email: string;
  display_name_private: string;     // tên dùng trong nhóm bạn
  display_name_public: string;      // tên trên profile công khai
  username: string;                 // unique handle dùng cho URL
  public_id: string;                // ngẫu nhiên, dùng cho /u/:public_id
  avatar_url?: string;
  bio?: string;
  role: 'USER' | 'STEWARD' | 'ADMIN';  // role duyệt quán
  created_at: Date;
  preferences: {
    cuisines: string[];
    price_range: 1 | 2 | 3 | 4;
    dietary: string[];              // vegetarian, vegan, halal, ...
  };
}

// Friendship (mutual opt-in)
interface Friendship {
  id: string;
  user_a: string;                   // user id
  user_b: string;                   // user id
  status: 'pending' | 'accepted' | 'blocked';
  requested_by: string;
  created_at: Date;
  accepted_at?: Date;
}

// Group (nhóm để quay chung)
interface Group {
  id: string;
  name: string;
  owner_id: string;              // chủ phòng (tạo group)
  member_ids: string[];          // max 20 - tất cả thành viên đều có thể thêm người khác
  created_at: Date;
}

// Restaurant (hợp nhất 2 nguồn)
interface Restaurant {
  id: string;
  source: 'google_places' | 'user_submitted';
  google_place_id?: string;
  name: string;
  address: string;
  location: GeoJSON<Point>;          // PostGIS geography(Point, 4326)
  cuisine: string[];
  price_range: 1 | 2 | 3 | 4;
  rating_avg?: number;
  photos: string[];
  status: 'approved' | 'pending' | 'rejected' | 'merged';
  submitted_by?: string;
  approved_by?: string;              // steward id
  created_at: Date;
}

// Locket (chụp ảnh món ăn, kèm review)
interface Locket {
  id: string;
  user_id: string;
  restaurant_id?: string;            // optional - có thể chụp món không rõ quán
  dish_name?: string;
  image_url: string;                 // đã strip EXIF
  thumbnail_url: string;
  note?: string;                     // text review
  rating?: number;                   // 1..5
  visibility: 'private' | 'friends' | 'public';
  captured_at: Date;                 // timestamp từ thiết bị
  captured_gps?: GeoJSON<Point>;
  device_hash: string;               // anonymized
  group_id?: string;                 // nếu chụp trong context group
  status: 'active' | 'removed' | 'reported';
  created_at: Date;
}

// Spin (lượt quay)
interface Spin {
  id: string;
  user_id: string;
  group_id?: string;                 // null = cá nhân
  filters: {
    cuisines?: string[];
    price_range?: number[];
    radius_km: number;
    dietary?: string[];
  };
  result_restaurant_id: string;
  votes?: {                          // cho group spin
    user_id: string;
    vote: 'accept' | 'respin';
    at: Date;
  }[];
  created_at: Date;
}

// Steward moderation queue
interface RestaurantSubmission {
  id: string;
  restaurant_id: string;
  submitted_by: string;
  submitted_at: Date;
  reviewed_by?: string;
  review_notes?: string;
  decision?: 'approved' | 'rejected' | 'merged_into';
  merged_with_id?: string;
}

// ========== Spin System v2 ==========
interface SpinWallet {
  id: string;
  userId: string;                    // 1:1 với User
  balance: number;                  // Số spin hiện có
  lastRechargeAt: Date;
  updatedAt: Date;
}

interface SpinLog {
  id: string;
  userId: string;
  type: 'FREE_DAILY' | 'PURCHASE' | 'AD_WATCH' | 'GIFT' | 'USE';
  amount: number;                    // +/- số spin
  referenceId?: string;             // purchase_id, ad_id
  createdAt: Date;
}

interface SpinPack {
  id: string;
  name: string;                     // e.g. "Gói 20 spins"
  spins: number;
  priceVND: number;
  isActive: boolean;
}

interface AdWatchLog {
  id: string;
  userId: string;
  watchedAt: Date;
  rewarded: boolean;
}

// ========== B2B Restaurant Partner ==========
interface SubscriptionPlan {
  id: string;
  type: 'RESTAURANT' | 'CORPORATE';
  tier: 'BASIC' | 'BRONZE' | 'SILVER' | 'GOLD' | 'ENTERPRISE';
  priceVND: number;
  features: string[];                // array of feature keys
}

interface RestaurantPartner {
  id: string;
  ownerId: string;                  // FK → User (chủ quán)
  restaurantId: string;             // FK → Restaurant
  planId: string;                   // FK → SubscriptionPlan
  ppvRateVND: number;               // Pay-Per-Visit rate
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
  expiresAt: Date;
}

interface RestaurantVisit {
  id: string;
  partnerId: string;                // FK → RestaurantPartner
  userId: string;                  // FK → User (khách)
  checkinAt: Date;
  verified: boolean;                // GPS trong 100m
}

// ========== B2B Corporate ==========
interface CorporateAccount {
  id: string;
  companyName: string;
  adminId: string;                 // FK → User (admin công ty)
  planId: string;                  // FK → SubscriptionPlan
  maxSeats: number;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  createdAt: Date;
  expiresAt: Date;
}

interface CorporateMember {
  id: string;
  corporateId: string;              // FK → CorporateAccount
  userId: string;                  // FK → User
  role: 'MEMBER' | 'MANAGER';
  joinedAt: Date;
}

// ========== Taste Board ==========
interface TasteBoard {
  id: string;
  ownerId: string;                  // FK → User
  name: string;
  description?: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
  createdAt: Date;
  updatedAt: Date;
}

interface TasteBoardItem {
  id: string;
  boardId: string;                 // FK → TasteBoard
  restaurantId?: string;            // FK → Restaurant
  dishName?: string;
  locketId?: string;               // FK → Locket
  note?: string;
  addedAt: Date;
}

// ========== Menu Capture ==========
interface Menu {
  id: string;
  restaurantId: string;            // FK → Restaurant
  imageUrl: string;
  extractedText: string;            // AI OCR output
  parsedItems: MenuItem[];         // Parsed menu items
  capturedAt: Date;
  capturedBy: string;              // FK → User
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface MenuItem {
  id: string;
  menuId: string;                  // FK → Menu
  name: string;
  priceVND?: number;
  category?: string;               // món chính, side, drink...
  tags: string[];                 // spicy, vegetarian, gluten-free...
}

// ========== AI Personalization ==========
interface UserPreference {
  id: string;
  userId: string;                  // FK → User (1:1)
  cuisineScores: Record<string, number>;  // { "Vietnamese": 0.9, "Japanese": 0.7 }
  priceRange: 1 | 2 | 3 | 4;
  dietaryRestrictions: string[];   // vegetarian, halal, gluten-free...
  spiceTolerance: 'mild' | 'medium' | 'spicy';
  updatedAt: Date;
}

interface CircleRecommendation {
  id: string;
  groupId: string;                // FK → Group
  spinSessionId?: string;          // FK → SpinSession (optional)
  memberScores: Record<string, {
    matchScore: number;            // 0-1
    reasons: string[];             // ["Bạn thích món cay", "Trong budget"]
    suggestedItems: string[];      // Top 3 items for member
  }>;
  createdAt: Date;
}
```

### 19.9 Ràng buộc & invariants quan trọng

1. `Group.member_ids.length <= 20` — enforced ở DB + app.
2. `Locket.image_url` chỉ nhận từ endpoint upload của app — backend từ chối nếu không có `device_hash` hợp lệ và `captured_at` trong vòng 60s so với server time.
3. `Locket.visibility = 'public'` hiển thị trên profile công khai, **không** hiển thị `display_name_private`.
4. `Restaurant.source = 'user_submitted'` chỉ xuất hiện trong roulette sau khi `status = 'approved'`.
5. `Friendship` mutual: `current_user` thấy user B là bạn **chỉ khi** cả 2 record `accepted` tồn tại (kết hợp 2 chiều user_a → user_b hoặc user_b → user_a).
6. `User.public_id` không đổi sau khi tạo — dùng để chia sẻ profile an toàn (username có thể đổi).
7. Camera permission phải được xin trước khi mở capture screen — fallback khi denied = hiện thông báo "Không thể tạo locket nếu không bật camera".
8. `SpinWallet.balance >= 0` — không cho phép âm.
9. `RestaurantVisit.verified = true` chỉ khi GPS trong bán kính 100m.
10. Corporate members không vượt quá `maxSeats`.
11. `Menu.status = 'VERIFIED'` trước khi dùng cho spin.
12. `CircleRecommendation` được tạo cho mỗi group spin.

### 19.10 Open questions còn lại (đã resolve)

- [x] Steward role: ✅ Dùng `role ENUM('USER', 'STEWARD', 'ADMIN')` trên bảng User
- [x] Mời vào group: ✅ Có chủ phòng tạo, nhưng **tất cả thành viên** đều có thể thêm người mới
- [x] Vòng đời group: ✅ Group bị **xóa khi tất cả thành viên out**
- [x] Vòng đời locket: ✅ **Vĩnh viễn** (không tự hủy)
- [x] Push notification: ✅ **Per-type toggle** - bật/tắt theo loại (locket mới, spin, group...)
- [x] `device_hash` reset: ✅ **User-initiated reset** - user chủ động confirm đổi máy trong app
- [ ] AI OCR engine: dùng Google ML Kit, AWS Textract, hay custom model?
- [ ] Preference learning: real-time update hay batch update daily?

### 19.11 Spin System v2 (Spin Wallet & Recharge)

**Spin Economy:**
| Nguồn spin | Số lượng | Chi phí |
|------------|----------|---------|
| Free Daily | 10 spins | Miễn phí (reset 00:00) |
| Ad Watch | 1 spin | Miễn phí (max 5/ngày) |
| Gift | Variable | Miễn phí |
| Spin Pack | 5-100 spins | 15k-179k |
| Pro | Unlimited | 59k/tháng |

**Spin Packs:**
| Pack | Spins | Giá |
|------|-------|------|
| Starter | 5 | 15k |
| Regular | 20 | 49k |
| Pro | 50 | 99k |
| Power | 100 | 179k |

### 19.12 Restaurant Partner (B2B)

**Pricing Tiers:**
| Tier | Fixed | PPV/Visit | Features |
|------|-------|-----------|----------|
| Basic | Miễn phí | - | Badge only |
| Bronze PPV | 99k/tháng | 5k | + Analytics |
| Silver PPV | 199k/tháng | 4k | + Top 5 + Promo |
| Gold PPV | 399k/tháng | 3k | + Top 3 + Priority |

**Featured Algorithm:**
```
Score = distance × 0.4 + rating × 0.3 + tier × 0.2 + recency × 0.1
```

### 19.13 Corporate Account (B2B)

| Package | Giá/tháng | Seats |
|---------|-----------|-------|
| Starter | 999k | 10 |
| Growth | 2,499k | 30 |
| Enterprise | 4,999k | 100+ |

### 19.14 Sitemap Updates (v2.4)

**Trang mới cho B2B:**
- `/partner/dashboard` — Dashboard cho restaurant partner
- `/partner/analytics` — Analytics chi tiết
- `/partner/promo` — Tạo & quản lý promo codes
- `/partner/settings` — Cài đặt partner
- `/corporate/dashboard` — Dashboard cho corporate admin
- `/corporate/members` — Quản lý seats
- `/corporate/analytics` — Spend analytics

**Trang mới cho Spin System:**
- `/spin/shop` — Mua spin packs
- `/spin/wallet` — Xem số dư & lịch sử

**Trang mới cho Menu Capture:**
- `/spin/menu-capture` — Chụp & parse menu
- `/spin/menu-review` — Xác nhận menu đã parse

**Trang mới cho AI Personalization:**
- `/preferences` — Quản lý sở thích cá nhân
- `/preferences/explicit` — Set preference thủ công

### 19.15 Menu Capture Flow

```
1. User đến quán → Tap "Chụp Menu"
2. Camera mở → Chụp ảnh menu
3. AI OCR parse → Hiện danh sách món
4. User xác nhận/chỉnh sửa
5. Spin với menu này
6. AI suggest best match cho từng member
```

### 19.16 AI Match Algorithm

```
MatchScore = CuisineMatch × 0.4 + PriceMatch × 0.3 + DietaryMatch × 0.2 + SpiceMatch × 0.1

CuisineMatch = user.cuisineScores[menuItem.category] || 0.5
PriceMatch = menuItem.price <= maxPrice(user.priceRange) ? 1 : 0.5
DietaryMatch = menuItem.tags.includesAll(user.dietary) ? 1 : 0
SpiceMatch = menuItem.spiceLevel <= user.spiceTolerance ? 1 : 0.5
```

---

*Tài liệu phiên bản: 2.4*
*Cập nhật lần cuối: 2026-08-06*
*Design Language đồng bộ với `brand/brand.md` — hệ Earthy (nâu-vàng, warm light-first).*
*Quyết định sản phẩm v2.4 (Menu Capture + AI Personalization): xem §19.*
