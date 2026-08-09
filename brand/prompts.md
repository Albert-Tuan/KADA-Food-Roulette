# Food Roulette — Master Prompt

> File này là **single-source-of-truth dạng prompt**: chép nội dung bên dưới vào bất kỳ AI nào (Cursor, ChatGPT, Claude, v.v.) để AI hiểu đầy đủ dự án mà không cần đọc thêm tài liệu nào khác trong repo.
>
> Cách dùng: copy block trong dấu ```prompt ...``` ở **§0**. Muốn chuyên sâu hơn về phần nào, tham khảo các §1–§9 bên dưới.
>
> Phiên bản: **2.2** · Cập nhật: **2026-07-24** · Trạng thái: **Pre-implementation (chưa viết code)**

---

## §0 · PROMPT DÁN VÀO AI (master prompt)

```prompt
Bạn đang đọc spec dự án "Food Roulette". Hãy đọc kỹ và xác nhận bạn hiểu trước khi trả lời bất kỳ câu hỏi nào.

## 1. Sản phẩm là gì

Food Roulette là **mobile app** (React Native + Expo, chạy thật trên iOS + Android) giúp người dùng Việt Nam **chọn quán ăn ngẫu nhiên xung quanh vị trí hiện tại** bằng cách quay một bánh xe (roulette) — giải quyết "nghịch lý lựa chọn" khi có quá nhiều quán nhưng không biết chọn cái nào.

**USP (điểm khác biệt so với Foody/ShopeeFood):**
- **Spin cho nhóm** (tối đa 20 người, vote chấp nhận/quay lại) — giải quyết cơn đau "đi ăn nhóm cãi nhau".
- **Locket camera-only** — ảnh phải chụp từ camera trong app, không upload từ thư viện. Mỗi ảnh có GPS + timestamp + device_hash để chống ảnh giả.
- **2 tên hiển thị** — `display_name_private` (trong nhóm bạn) và `display_name_public` (trên profile công khai).
- **Bản đồ quán riêng** — seed Google Places + user-submitted + Steward duyệt (chỉ duyệt quán user-submitted).
- **Review thật** — cam kết "review từ người dùng thật, không phải quảng cáo".

## 2. Tagline

*"Không biết ăn gì? Để vòng quyết định."*
*"Quay là ra, ăn là ghiền."*
Brand promise: *"Mỗi lần quay là một cuộc phiêu lưu ẩm thực — không bao giờ nhàm chán."*

## 3. Đối tượng

- Gen Z & Millennials (18–30 tuổi), sinh viên + nhân viên văn phòng tại TP lớn.
- Nhóm bạn / cặp đôi / gia đình đang "đứng hình trước câu hỏi ăn gì".
- Người thích khám phá quán mới nhưng lười lọc.

## 4. Tone giọng (BẮT BUỘC khi viết content)

4 tính từ: **Ngắn gọn · Rõ ràng · Bình thường · Có ích**.
- Xưng "mình – bạn", không "quý khách".
- Dùng "spin" (không "quay số"), "locket" (không "bộ sưu tập"), "review" (không "đánh giá"), "món ăn"/"nhà hàng" (không "đồ ăn"/"cửa hàng").
- Emoji vừa đủ, đúng chỗ. Không viết dài. Không so sánh trực tiếp đối thủ.

## 5. Brand & Design Language

- **Hệ thiết kế: Earthy (warm light-first)** — KHÔNG phải dark mode, KHÔNG cam đỏ.
- **Màu chính:**
  - Espresso `#3D2314` (text chính, CTA chính)
  - Dark Roast `#5C3317` (nền tối, header/footer)
  - Saddle Brown `#8B4513` (icon, border mạnh)
- **Màu accent (CTA, highlight):**
  - Golden `#C68E17` (CTA chính)
  - Caramel `#D4A574` (secondary)
  - Butter Yellow `#F5DEB3` (section background)
- **Nền:**
  - Cream `#FDF5E6` (body default)
  - Linen `#FAF0E6` (section xen kẽ)
  - Beige `#F5F0EB` (card)
- **Text:** Brown 900 `#2C1810` (chính), Warm Gray `#9C8B7A` (muted).
- **Dark mode** (tùy chọn): nền `#1A0F0A`, card `#2D1F15`, text `#F5F0EB`.
- **Font:**
  - Heading: **Plus Jakarta Sans** (800/700/600)
  - Body: **Inter** (400/500/600)
  - Fallback tiếng Việt: **Be Vietnam Pro** → system-ui
- **Nguyên tắc:** warm-light-first · card có shadow nhẹ · micro-interactions mượt · tôn trọng `prefers-reduced-motion` · tăng warmth +15%, saturation +10% cho ảnh.

## 6. Stack công nghệ

| Layer | Lựa chọn |
|-------|----------|
| App | **Expo SDK 52 + Expo Router + TypeScript** (EAS Build) |
| UI | **NativeWind** (Tailwind cho RN) + tokens Earthy |
| Animation | **Reanimated 3** + **Moti** (spin wheel) |
| State | **Zustand** + **TanStack Query** |
| Map | **react-native-maps** + OpenStreetMap tiles |
| Backend | **Supabase** (Postgres + Auth + Storage + Realtime) |
| DB | **Postgres + PostGIS** (query bán kính) |
| Storage | **Supabase Storage** (resize qua Edge Function) |
| Camera | **expo-image-picker** (`cameraOnly: true`) |
| GPS | **expo-location** |
| Push | **Expo Push Notifications** |
| Moderation (v1.2) | **OpenAI Moderation API** |
| Deploy | **EAS Build** + **Supabase Cloud** |
| CI/CD | **EAS Submit** + GitHub Actions |

## 7. Phạm vi v1.0 (MVP — đã thống nhất)

✅ Auth (email + Google) qua Supabase · Onboarding · **Spin cá nhân** · **Group spin (max 20, mutual opt-in, vote chấp nhận)** · **Locket camera-only** · Locket feed (cá nhân + nhóm + public) · Profile công khai (grid locket `visibility=public`) · **Thêm quán user-submitted** (chờ steward duyệt) · **Steward dashboard** (duyệt quán) · Google Places lookup/seed.

❌ Để **v1.2**: AI moderation text, AI gợi ý khẩu vị. Để **v2.0**: gamification/streak, chat trong app, AI Food Advisor, Wear OS, đặt hàng.

## 8. Trạng thái repo

- Branch `main`, 3 commits, sạch.
- Chỉ có tài liệu: `brand/brand.md`, `brand/FOOD-ROULETTE-SITEMAP.md`, `brand/prompts.md` (file này), `Content/{feature,pricing,solution}.docx`. Thư mục `Food Roulette-web/`, `Videos/`, `ContentViral/` là placeholder.
- **Chưa có code**. Giai đoạn pre-implementation.

## 9. Luồng người dùng chính

**Luồng 1 — Đi ăn nhóm (USP):** Mở app → Chọn nhóm → "Quay chung" → Cả nhóm xem bánh xe realtime → Kết quả hiện cùng lúc → Mỗi người vote "Chấp nhận" / "Quay lại" → Đa số chấp nhận → App đưa đường đi.

**Luồng 2 — Locket (chụp & chia sẻ):** Ăn xong tại quán → Mở app → "Tạo locket" → Chụp ảnh (không có nút upload) → App tự gắn GPS + timestamp → Viết ghi chú ngắn → Chọn quán + visibility → Đăng → Bạn bè thấy trong feed chronological.

**Luồng 3 — Khám phá quán mới:** Cần thêm quán mới → "Thêm quán" → Check GPS → Nếu không có trên Google Places → User điền form → `pending` → Steward duyệt → hiện lên bản đồ.

## 10. Data model (TypeScript)

```typescript
interface User {
  id: string;                       // uuid
  email: string;
  display_name_private: string;     // tên trong nhóm bạn
  display_name_public: string;      // tên trên profile công khai
  username: string;                 // unique handle
  public_id: string;                // immutable, dùng cho URL
  avatar_url?: string;
  bio?: string;
  role: 'USER' | 'STEWARD' | 'ADMIN';  // role duyệt quán
  created_at: Date;
  preferences: { cuisines: string[]; price_range: 1|2|3|4; dietary: string[] };
}
interface Friendship { id: string; user_a: string; user_b: string; status: 'pending'|'accepted'|'blocked'; requested_by: string; created_at: Date; accepted_at?: Date; }
interface Group { 
  id: string; 
  name: string; 
  owner_id: string;  // chủ phòng (tạo group)
  member_ids: string[];  // max 20 - tất cả thành viên đều có thể thêm người khác
  created_at: Date; 
}
interface Restaurant {
  id: string; source: 'google_places'|'user_submitted'; google_place_id?: string;
  name: string; address: string; location: GeoJSON<Point>;          // PostGIS geography(Point,4326)
  cuisine: string[]; price_range: 1|2|3|4; rating_avg?: number; photos: string[];
  status: 'approved'|'pending'|'rejected'|'merged';
  submitted_by?: string; approved_by?: string; created_at: Date;
}
interface Locket {
  id: string; user_id: string; restaurant_id?: string; dish_name?: string;
  image_url: string; thumbnail_url: string;
  note?: string; rating?: number;
  visibility: 'private'|'friends'|'public';
  captured_at: Date; captured_gps?: GeoJSON<Point>;
  device_hash: string;               // anonymized
  group_id?: string; status: 'active'|'removed'|'reported'; created_at: Date;
}
interface Spin {
  id: string; user_id: string; group_id?: string;       // null = cá nhân
  filters: { cuisines?: string[]; price_range?: number[]; radius_km: number; dietary?: string[] };
  result_restaurant_id: string;
  votes?: { user_id: string; vote: 'accept'|'respin'; at: Date }[];   // cho group spin
  created_at: Date;
}
interface RestaurantSubmission {
  id: string; restaurant_id: string; submitted_by: string; submitted_at: Date;
  reviewed_by?: string; review_notes?: string;
  decision?: 'approved'|'rejected'|'merged_into'; merged_with_id?: string;
}
```

## 11. Ràng buộc & invariants

1. `Group.member_ids.length <= 20`.
2. `Locket.image_url` chỉ nhận từ endpoint upload của app — backend từ chối nếu thiếu `device_hash` hoặc `captured_at` lệch server time > 60s.
3. `Locket.visibility='public'` hiển thị trên profile công khai, **không** lộ `display_name_private`.
4. `Restaurant.source='user_submitted'` chỉ xuất hiện trong roulette sau khi `status='approved'`.
5. `Friendship` mutual: 2 bên đều accepted mới là bạn.
6. `User.public_id` immutable sau khi tạo.
7. Camera permission phải được xin trước khi vào capture screen.
8. EXIF gốc của ảnh bị strip trước khi lưu — server chỉ giữ metadata chuẩn hoá.

## 12. Câu trả lời của bạn

Hãy xác nhận bạn đã hiểu bằng cách:
1. Tóm tắt lại USP của Food Roulette trong 3-5 dòng.
2. Nêu stack chính (mobile + backend + DB).
3. Nêu 3 invariants quan trọng nhất.
4. Hỏi lại tôi 1-2 câu nếu có điểm chưa rõ trước khi bắt tay vào task.
```

---

## §1 · Định vị & Đối tượng (mở rộng)

### Một câu định vị
> *"Food Roulette — quay là ra, ăn là ghiền."*

### Khẩu hiệu gốc
> *"Không biết ăn gì? Để vòng quyết định."*

### Positioning statement
Food Roulette là ứng dụng **giải quyết "nghịch lý lựa chọn"** khi đi ăn — khi có quá nhiều quán nhưng không biết chọn cái nào. Khác với Foody/ShopeeFood (chỉ liệt kê), Food Roulette biến việc chọn quán thành **một trải nghiệm vui, ngẫu nhiên và có cá tính**.

### Lời hứa thương hiệu
> *"Mỗi lần quay là một cuộc phiêu lưu ẩm thực — không bao giờ nhàm chán."*

### Tệp người dùng chính
- **Gen Z & Millennials (18–30 tuổi)**, sinh viên + nhân viên văn phòng tại các thành phố lớn.
- **Nhóm bạn / cặp đôi / gia đình** đang "không biết ăn gì".
- **Người thích khám phá** quán mới nhưng lười lọc.

### 4 nhóm người dùng được nhắm trong marketing
1. Người độc thân
2. 👫 Cặp đôi
3. 👨‍👩‍👧‍👦 Gia đình
4. 👥 Nhóm bạn

---

## §2 · Pain Points cần giải quyết

| Vấn đề | Mô tả |
|--------|-------|
| 🤔 **Không biết ăn gì** | Quá nhiều lựa chọn hoặc không có ý tưởng |
| ⏰ **Tốn thời gian quyết định** | Scroll menu, hỏi bạn bè mất 30 phút (67% smartphone user mất >15 phút) |
| 😤 **Cãi nhau khi đi nhóm** | 8/10 cặp đôi xung đột vì không thống nhất chỗ ăn |
| 📸 **Muốn chia sẻ món ăn** | Thấy món ngon nhưng không biết giới thiệu sao |
| ⭐ **Cần review thật** | Review trên mạng thường không đáng tin |
| 📍 **Bỏ lỡ quán ngon** | Quán nằm trong hẻm, không quảng cáo, không có trên Google Maps |

**Số liệu tham chiếu từ `Content/solution.docx`:**
- Dân văn phòng mất trung bình **2.5 giờ/tuần** chỉ để chọn địa điểm ăn.
- Mỗi cuộc "tranh luận ăn gì" có **3–10 người** tham gia.
- Sau 30 phút cãi nhau, **80% quay về canteen** hoặc 2-3 quán quen.

---

## §3 · Tính năng sản phẩm (từ `Content/feature.docx`)

### 1. 🎰 Roulette thông minh — Smart Food Decision Engine
- **Vấn đề:** Mất 20–30 phút/bữa để chọn quán, kết quả là vẫn quay về quán cũ.
- **Luồng:** Mở app → Nhấn SPIN lớn → (tùy chọn) chỉnh filter → Bánh xe quay animation 3D → Hiện kết quả.
- **Filter:** Cuisine (Việt, Nhật, Hàn, Thái, Ý, Ấn Độ…), khoảng cách slider 1–10 km, mức giá $/$$/$$$/$$$$ (VNĐ: <50K / 50–150K / 150–300K / >300K), chế độ ăn (Chay, Vegan, Halal, Keto, Gluten-free).
- **Hành động sau spin:** Spin lại · Xem chi tiết · Lưu vào Locket · Chia sẻ.
- **Pro filter:** Rating tối thiểu (4+), thời gian mở cửa, tiêu chí đặc biệt (chỗ ngoài trời, phù hợp nhóm đông, yên tĩnh).
- **Metric mục tiêu:** thời gian quyết định giảm từ 25 phút xuống ≤ 3 giây · spin → ghé thăm 35% · discovery rate 40% tháng đầu.

### 2. 🔒 Locket (gọi là "Taste Board" trong docx cũ) — Camera-only
- **Vấn đề:** Lưu ảnh món ngon qua Zalo/chat → trôi mất; bookmark Google Maps → không có review; Notes app → không chia sẻ được.
- **Khác biệt v1.0:** **camera-only** — không có nút upload từ thư viện.
- **Tạo:** Đặt tên board (vd: "Quán ngon Sài Gòn", "Bữa trưa team") → Thêm món (tìm quán hoặc thêm thủ công) → Chụp ảnh từ camera → Ghi chú + rating 1–5 + tags → Chọn visibility (private / friends / public).
- **Chia sẻ & tương tác:**
  - Nút "Tôi cũng muốn ăn!" → bạn bè lưu vào board của họ.
  - QR Code · Link chia sẻ · Nhúng web.
- **Mẫu phổ biến:** "Quán ngon quanh công ty" · "Ăn vặt dưới 30K" · "Cuối tuần gia đình" · "Review từ food blogger".
- **Metric mục tiêu:** viral loop 2.4 người/board · 8.5 món/board trung bình · engagement 68%.

### 3. ⭐ Review thật — Community-Verified Food Reviews
- **Vấn đề:** Review Google/Facebook bị nghi quảng cáo trá hình · ảnh không đại diện · không biết ai viết.
- **Cách viết:** Tìm quán → Đánh giá tổng 1–5 sao → Đánh giá chi tiết (Vị · Phục vụ · Không gian · Giá) → Nội dung + ảnh (tối đa 5) + tags (tối đa 5).
- **Bộ lọc:** Gần tôi (bán kính 5 km) · Xu hướng · Mới nhất · Theo dõi.
- **Trust system:** Avatar + username thật · Stats profile · Badge verified (xác minh SĐT) · Report system.
- **Metric mục tiêu:** trust > 85% (vs ~40% trên nền tảng có quảng cáo) · chuyển đổi đọc review → ghé quán 2.1× cao hơn.

### 4. 📍 Khám phá xung quanh — Nearby Discovery Engine
- **Vấn đề:** Luôn ăn quán cũ · bỏ lỡ quán trong hẻm · review từ xa không phù hợp.
- **Bản đồ tương tác:** Pin màu theo rating (xanh 4.5+ · vàng 3.5–4.4 · đỏ <3.5) · Filter (loại món, đang mở cửa, đang KM).
- **Gợi ý thông minh:** theo vị trí · theo Taste Board · theo xu hướng · theo bữa (sáng/trưa/chiều/tối).
- **Metric mục tiêu:** discovery 40% tháng đầu · 3 quán mới/tháng · trung bình 1.8 km.

### 5. 👤 Hồ sơ ẩm thực cá nhân — Personal Taste Profile
- **Vấn đề:** Không có nơi thể hiện "gu ăn uống" · review cũ trôi mất · thiếu gamification.
- **Taste Profile tự động** (radar chart) dựa trên: lịch sử Spin · Review · Taste Board.
- **Hiển thị:** Avatar · Stats · Taste Radar · Achievements · Timeline hoạt động.
- **Badges v1.0 chưa có (để v2.0):** 🏃 Spinner (100 spin) · 📝 Reviewer (10 review) · 🔒 Board Master (5 board) · 🗺️ Explorer (10 quán mới) · ⭐ Helpful (50 useful) · 🔥 Streak (7 ngày liên tiếp).

### Feature Matrix (từ `Content/feature.docx`)

| Tính năng | Free | Pro | Business |
|-----------|:----:|:---:|:--------:|
| Spin Roulette | 5/ngày | ∞ | ∞ |
| Locket / Taste Board | 1 board, 10 món | ∞ | ∞ |
| Review thật | 3/tháng | ∞ | ∞ + phản hồi |
| Khám phá xung quanh | 3 km | 20 km | 20 km |
| Bộ lọc nâng cao | ✗ | ✓ | ✓ |
| Không quảng cáo | ✗ | ✓ | ✓ |
| Taste Profile đầy đủ | ✗ | ✓ | ✓ |
| Dashboard analytics | ✗ | ✗ | ✓ |
| Ưu tiên Roulette | ✗ | ✗ | ✓ |
| Chạy khuyến mãi | ✗ | ✗ | ✓ |
| Trang nhà hàng chính thức | ✗ | ✗ | ✓ |

---

## §4 · Pricing

### Tổng quan

Food Roulette có **2 mô hình pricing** cho 2 đối tượng khác nhau:

| Đối tượng | Mô hình | Chi tiết |
|------------|---------|----------|
| **B2C - Người dùng app** | Subscription | Free / Pro |
| **B2B - Restaurant Partner** | Fixed Tier + PPV | 4 tiers + Pay-Per-Visit |

---

### 4.1 B2C: Người dùng app

#### Phương pháp: Subscription Model

| Gói | Giá tháng | Giá năm | Chiết khấu năm | Đối tượng |
|------|-----------|---------|-----------------|-----------|
| **Free** | 0đ | 0đ | - | Thử nghiệm, đọc review |
| **Pro** | 59.000đ | 490.000đ | ~30% | Cá nhân, cặp đôi, nhóm bạn |

#### Spin Packs (IAP - mua 1 lần)

| Pack | Spins | Giá |
|------|-------|------|
| Starter | 5 spins | 15.000đ |
| Standard | 20 spins | 59.000đ |
| Premium | 100 spins | 199.000đ |

#### Gói Free - Giới hạn

| Tính năng | Giới hạn |
|------------|----------|
| Spin/ngày | 5 lần |
| Tạo group spin | Có |
| Xem review | Có |
| Locket camera | 3 ảnh/tháng |
| Ad banner | Có |

#### Gói Pro - Quyền lợi

| Tính năng | Giới hạn |
|------------|----------|
| Spin/ngày | Không giới hạn |
| Tạo group spin | Có |
| Xem review | Có |
| Locket camera | Không giới hạn |
| Ad banner | Không |
| 7 ngày dùng thử | Có (không cần nhập thẻ) |

---

### 4.2 B2B: Restaurant Partner

#### Phương pháp: Hybrid (Fixed Tier + Pay-Per-Visit)

> **Khác với ShopeeFood/GrabFood (30% per order)**: Food Roulette **0% per order**, chỉ trả khi có khách THẬT SỰ đến check-in.

#### Pricing Tiers

| Tier | Fixed Fee | PPV Rate | Giá/spin* | Features |
|------|-----------|----------|------------|----------|
| **Basic** | Miễn phí | - | - | Badge only |
| **Bronze PPV** | 99.000đ/tháng | 5.000đ/visit | ~200đ/ngày | Badge + Basic analytics |
| **Silver PPV** | 199.000đ/tháng | 4.000đ/visit | ~400đ/ngày | Top 5 + Promo codes |
| **Gold PPV** | 399.000đ/tháng | 3.000đ/visit | ~800đ/ngày | Top 3 + Full analytics + Priority |

*Giả định: 30 visits/tháng

#### Feature Breakdown

| Feature | Basic | Bronze | Silver | Gold |
|---------|:-----:|:------:|:------:|:----:|
| Verified Badge | ✅ | ✅ | ✅ | ✅ |
| Basic analytics | ❌ | ✅ | ✅ | ✅ |
| Featured Placement | ❌ | ❌ | ✅ (Top 5) | ✅ (Top 3) |
| Promo Codes | ❌ | ❌ | ✅ | ✅ |
| Full analytics | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ❌ | ✅ |
| Dedicated Account Manager | ❌ | ❌ | ❌ | ✅ |

#### PPV Verification Mechanism

```
1. Khách đến quán
       ↓
2. Mở app → Tap "Check-in"
       ↓
3. App verify GPS (trong 100m của quán)
       ↓
4. Nếu verified → Tạo RestaurantVisit record
       ↓
5. End of month → Billing = fixed + (visits × ppvRate)
```

#### Billing Example (Silver PPV)

```
Fixed fee: 199.000đ/tháng
PPV rate: 4.000đ/visit

If 30 visits in month:
Total = 199.000 + (30 × 4.000)
     = 199.000 + 120.000
     = 319.000đ/tháng

Compare to ShopeeFood (30 orders × 35k × 30%):
= 315.000đ → About same!

But: Only pay for REAL visits ✅
```

#### Break-even Analysis

| Tier | Fixed | PPV | Break-even Visits |
|------|-------|-----|-------------------|
| Bronze | 99k | 5k | 20/tháng |
| Silver | 199k | 4k | 50/tháng |
| Gold | 399k | 3k | 133/tháng |

---

### 4.3 Chính sách Billing (B2C)

#### Thanh toán
- **Tự động gia hạn** qua: ATM nội địa, Visa/MasterCard, Momo
- **Hủy** trong mục Cài đặt (Settings)

#### Upgrade/Downgrade/Cancel

| Action | Xử lý |
|---------|--------|
| **Upgrade** | Prorated, active ngay |
| **Downgrade** | Cuối chu kỳ, không refund |
| **Cancel** | Giữ quyền đến hết chu kỳ đã paid |

#### Prorated Billing
- **Công thức**: `(Giá gói mới - Giá gói cũ) × (Số ngày còn lại / Tổng ngày chu kỳ)`

---

### 4.4 Chính sách B2B

| Policy | Chi tiết |
|--------|----------|
| **Trial** | 7 ngày free Gold (không cần credit card) |
| **Guarantee** | 0 đơn = Hoàn tiền 100% nếu 0 visit trong 30 ngày |
| **Team License** | Không giới hạn nhân viên quản lý tài khoản |
| **Per-Seat** | Không tính theo số user trong nhà hàng |

---

### 4.5 ROI Claims

#### Pro (B2C)
- Tiết kiệm ~600.000đ/tháng (12 giờ × 50.000đ/giờ)
- ROI = **916%** · Hoàn vốn **< 3 ngày**

#### Restaurant Partner (B2B)
- So với ShopeeFood 30% order: tiết kiệm ~1.9M/tháng
- ROI = **4.482%** · Hoàn vốn **< 1 ngày**

---

> **Lưu ý:** Pricing này là spec chi tiết. Áp dụng cho **v1.1+**. MVP v1.0 chỉ cần Free + Spin Packs + Basic Restaurant Partner.

---

## §5 · Solution (từ `Content/solution.docx`) — câu chuyện theo nhóm đối tượng

### 1. Dân văn phòng & công sở
- **Nỗi đau:** 12 giờ trưa — 30 phút cãi nhau, cuối cùng vẫn quay về canteen.
- **Giải pháp:** Spin 3 giây, filter trong bán kính 500m–1km, giá $ hoặc $$.
- **Kết quả kỳ vọng:** tiết kiệm 2.5 giờ/tuần.

### 2. Sinh viên & ký túc xá
- **Nỗi đau:** Ngân sách hẹn hẹp, ăn quán lạ sợ mất vệ sinh, hay phải ăn cùng món.
- **Giải pháp:** Filter giá $ (<50K), board "Ăn vặt dưới 30K", review từ bạn cùng khu.
- **Kết quả kỳ vọng:** giảm lo lắng, khám phá quán mới an toàn.

### 3. Gia đình có con nhỏ
- **Nỗi đau:** Con khó tính, cần không gian phù hợp, đỗ xe khó.
- **Giải pháp:** Filter "Phù hợp nhóm đông", "Yên tĩnh", "Có chỗ ngồi ngoài trời", board "Cuối tuần gia đình".
- **Kết quả kỳ vọng:** bớt stress bữa ăn gia đình.

### 4. Ngành F&B — Nhà hàng & quán ăn
- **Nỗi đau:** Quán mới mở thiếu visibility, khách đến không đều.
- **Giải pháp (gói Business):** Ưu tiên xuất hiện trên Roulette + dashboard analytics + ưu đãi + badge "Đối tác xác thực" + QR Code riêng.
- **Kết quả kỳ vọng:** 100+ khách mới/tháng.

---

## §6 · Sitemap ứng dụng (từ `brand/FOOD-ROULETTE-SITEMAP.md`)

### Trang chính (trong app)
- `/` — Landing page trong app (intro, hero)
- `/spin` — Trang roulette (cá nhân + group)
- `/lockets` — Danh sách Locket của tôi / được chia sẻ / khám phá
- `/lockets/[id]` — Chi tiết Locket
- `/reviews` — Trang reviews cộng đồng
- `/profile/:username` hoặc `/u/:public_id` — Profile công khai
- `/dashboard` — Dashboard user (locket của tôi, lịch sử spin, cài đặt)
- `/auth/login` `/auth/register` — Auth
- `/steward` — Steward dashboard (duyệt quán)
- `/settings` — Cài đặt

### Landing page web (marketing tĩnh)
Hero → Vấn đề → Cách hoạt động (3 bước) → Tính năng → Đối tượng → Social proof → Đăng ký → FAQ → CTA cuối.

---

## §7 · Design Tokens (từ `brand/brand.md`, đồng bộ với sitemap §10)

### Màu chính (Primary — Earthy)
```
--brand-primary        #3D2314  Espresso (logo, text chính, CTA)
--brand-primary-dark   #5C3317  Dark Roast (header, footer, card nổi)
--brand-primary-soft   #8B4513  Saddle Brown (icon, border mạnh)
```

### Màu accent (vàng — nổi bật)
```
--brand-accent         #C68E17  Golden (CTA, rating, highlight)
--brand-accent-soft    #D4A574  Caramel (button secondary, hover)
--brand-accent-bg      #F5DEB3  Butter Yellow (section bg, tag)
```

### Màu nền & chữ
```
--brand-bg             #FDF5E6  Cream (body default)
--brand-bg-soft        #FAF0E6  Linen (section xen kẽ)
--brand-bg-card        #F5F0EB  Beige (card)
--brand-text           #2C1810  Brown 900 (text chính)
--brand-text-muted     #9C8B7A  Warm Gray (caption)
--brand-border         #D4C5B5  Border Brown (divider)
```

### Dark mode
```
--brand-bg-dark        #1A0F0A  Dark Espresso
--brand-bg-card-dark   #2D1F15  Dark Roast
--brand-border-dark    #3D2D25
--brand-text-dark      #F5F0EB
--brand-text-muted-dark #B8A090
```

### Thang nâu (Brown scale)
```
Brown 900  #2C1810  Text chính
Brown 700  #5C3317  Text tiêu đề
Brown 500  #8B6914  Text phụ
Brown 300  #C4A77D  Border nhẹ
Brown 100  #E8DDD0  Background nhẹ
Brown 50   #F7F2ED  Background chính
```

### Typography
```
Display    Plus Jakarta Sans  48px  weight 800  lh 1.1   Hero title
H1         Plus Jakarta Sans  36px  weight 700  lh 1.2   Page title
H2         Plus Jakarta Sans  28px  weight 700  lh 1.25  Section title
H3         Plus Jakarta Sans  22px  weight 600  lh 1.3   Card title
H4         Plus Jakarta Sans  18px  weight 600  lh 1.4   Sub section
Body Large Inter             18px  weight 400  lh 1.6   Mô tả dài
Body       Inter             16px  weight 400  lh 1.5   Nội dung chính
Body Small Inter             14px  weight 400  lh 1.5   Caption
Caption    Inter             12px  weight 500  lh 1.4   Tag, label
Button     Inter             16px  weight 600  lh 1.0   CTA
```

### Do / Don't
```
✅ DO                                       ❌ DON'T
───────────────────────────────────────    ─────────────────────────────────────
Dùng màu chính cho CTA                     Đổi màu logo
Giữ clear space quanh logo                 Vẽ thêm chiết tiết vào logo
Mix Plus Jakarta + Inter                   Dùng nhiều hơn 3 font
Nói ngắn, có emoji                         Viết đoạn văn dài
Xưng "mình – bạn"                          Xưng "quý khách"
```

---

## §8 · Messaging Pillars (3 trụ cột copy)

### 🌀 Pillar 1 — "Chọn nhanh"
- **Headline:** *"Không biết ăn gì? Quay một cái."*
- **Sub:** *"Quay vài giây — có quán ngay."*
- Nhấn mạnh tốc độ, giải quyết "lãng phí thời gian".

### 🎲 Pillar 2 — "Khám phá có chủ đích"
- **Headline:** *"Biết đâu có quán ngon gần bạn."*
- **Sub:** *"Quán mới mỗi tuần, không cần tìm."*
- Khuyến khích thử mới, có lọc theo sở thích.

### 🍽️ Pillar 3 — "Theo khẩu vị"
- **Headline:** *"Chọn theo điều kiện của bạn."*
- **Sub:** *"Có quán ưng ý — không cần đoán."*
- Filter theo vị trí, ngân sách, loại món.

---

## §9 · Open questions còn lại (đã resolve)

- [x] **Steward role:** ✅ Dùng `role ENUM('USER', 'STEWARD', 'ADMIN')` trên bảng User
- [x] **Mời vào group:** ✅ Có chủ phòng tạo, nhưng **tất cả thành viên** (kể cả chủ phòng) đều có thể thêm người mới sau khi vào phòng
- [x] **Vòng đời group:** ✅ Group bị **xóa khi tất cả thành viên out**
- [x] **Vòng đời locket:** ✅ **Vĩnh viễn** (không tự hủy)
- [x] **Push notification:** ✅ **Per-type toggle** - bật/tắt theo loại (locket mới, spin, group...)
- [x] **`device_hash` reset:** ✅ **User-initiated reset** - user chủ động confirm đổi máy trong app
- [x] **Pricing** (Free/Pro/Business): ✅ Đã triển khai Spin System + B2B trong v1.0

---

## §10 · Spin System v2 (Spin Wallet & Recharge)

> Cập nhật: 2026-08-06 · v2.3

### 10.1 Tổng quan

Spin System thay thế model "5 spins/ngày free" bằng **Spin Wallet** — ví chứa spin credits có thể nạp lại qua nhiều cách.

**Tại sao thay đổi:**
- User không bị giới hạn cứng "5 spins/ngày"
- Tăng engagement với daily recharge
- Tạo revenue stream qua spin packs
- Giảm friction khi user muốn spin nhiều lần

### 10.2 Spin Wallet

```typescript
interface SpinWallet {
  id: string;
  userId: string;           // 1:1 với User
  balance: number;          // Số spin hiện có
  lastRechargeAt: Date;
  updatedAt: Date;
}

interface SpinLog {
  id: string;
  userId: string;
  type: 'FREE_DAILY' | 'PURCHASE' | 'AD_WATCH' | 'GIFT' | 'USE';
  amount: number;           // +/- số spin
  referenceId?: string;     // purchase_id, ad_id
  createdAt: Date;
}
```

### 10.3 Spin Economy

| Nguồn spin | Số lượng | Chi phí | Ghi chú |
|------------|----------|---------|---------|
| **Free Daily** | 10 spins | Miễn phí | Reset lúc 00:00 hàng ngày |
| **Ad Watch** | 1 spin | Miễn phí | Max 5 lần/ngày |
| **Gift** | Variable | Miễn phí | Từ friend referral |
| **Spin Pack** | 5-100 spins | 15k-199k | One-time purchase |
| **Pro Subscription** | Unlimited | 59k/tháng | Auto-recharge |

### 10.4 Spin Packs (IAP)

| Pack | Spins | Giá | Value | Best For |
|------|-------|------|-------|----------|
| Starter | 5 | 15k | 3k/spin | Thử nghiệm |
| Regular | 20 | 49k | 2.45k/spin | Dùng 1 tuần |
| Pro | 50 | 99k | 1.98k/spin | Dùng 1 tháng |
| Power | 100 | 179k | 1.79k/spin | Power user |

### 10.5 Ad Watch Flow

```
1. User hết spin → Thấy nút "Xem quảng cáo +1 spin"
2. User tap → Play ad (15-30s)
3. Ad complete → +1 spin vào wallet
4. Cap: 5 ads/ngày/user
5. Ad revenue split: ~70% cho publisher
```

### 10.6 Invariants

1. `SpinWallet.balance >= 0` — không cho phép âm
2. Spin không transfer được giữa users
3. Spin packs không hết hạn sau khi mua
4. Ad watch cap per user per day: 5 spins

---

## §11 · B2B Revenue: Restaurant Partner & Corporate

> Cập nhật: 2026-08-06 · v2.3

### 11.1 Restaurant Partner (B2B Nhà hàng)

**Mô hình hybrid:** Fixed tier + Pay-Per-Visit (PPV)

#### Pricing Tiers

| Tier | Fixed | PPV/Visit | Features |
|------|-------|-----------|----------|
| **Basic** | Miễn phí | - | Badge only, basic info |
| **Bronze PPV** | 99k/tháng | 5k | + Badge + Basic analytics |
| **Silver PPV** | 199k/tháng | 4k | + Featured top 5 + Promo codes |
| **Gold PPV** | 399k/tháng | 3k | + Top 3 + Full analytics + Priority |

#### Pay-Per-Visit Model

```typescript
interface RestaurantPartner {
  id: string;
  ownerId: string;           // FK → User (chủ quán)
  restaurantId: string;      // FK → Restaurant
  planId: string;           // FK → SubscriptionPlan
  ppvRateVND: number;       // Rate per verified visit
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
  createdAt: Date;
  expiresAt: Date;
}

interface RestaurantVisit {
  id: string;
  partnerId: string;         // FK → RestaurantPartner
  userId: string;           // FK → User (khách)
  checkinAt: Date;
  verified: boolean;         // GPS trong 100m
}
```

**Verification Mechanism:**
1. Khách đến quán → Mở app → "Check-in"
2. App verify GPS (trong bán kính 100m)
3. Nếu verified → RestaurantVisit record
4. End of month: billing = fixed + (visits × ppvRate)

#### Featured Placement Algorithm

Score = distanceWeight × 0.4 + ratingWeight × 0.3 + partnerTier × 0.2 + recency × 0.1

| Tier | Partner Boost |
|------|--------------|
| Basic | 0% |
| Bronze | +15% |
| Silver | +25% (Top 5) |
| Gold | +35% (Top 3) |

### 11.2 Corporate Account (B2B Doanh nghiệp)

#### Pricing Tiers

| Package | Giá/tháng | Seats | Features |
|---------|-----------|-------|----------|
| **Starter** | 999k | 10 | Basic team spin, unlimited spins |
| **Growth** | 2,499k | 30 | + Analytics + Spend report |
| **Enterprise** | 4,999k | 100+ | + Custom + Dedicated support |

```typescript
interface CorporateAccount {
  id: string;
  companyName: string;
  adminId: string;           // FK → User (admin của công ty)
  planId: string;           // FK → SubscriptionPlan
  maxSeats: number;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  createdAt: Date;
  expiresAt: Date;
}

interface CorporateMember {
  id: string;
  corporateId: string;       // FK → CorporateAccount
  userId: string;           // FK → User
  role: 'MEMBER' | 'MANAGER';
  joinedAt: Date;
}
```

### 11.3 Local Proof Strategy

**Vấn đề của chủ quán:** "App có ai xài không?"

**Giải pháp:**

| Feature | Mô tả |
|---------|--------|
| **Local Heatmap** | Bản đồ user density theo khu vực |
| **Partner Showcase** | "X+ quán đối tác trong khu vực" |
| **Live Counter** | "X người đang tìm quán ăn gần đây" |

### 11.4 Guarantee & Risk Reversal

| Guarantee | Mô tả |
|-----------|--------|
| **0 đơn = Hoàn tiền** | Hoàn 100% nếu 0 visit trong 30 ngày |
| **7 ngày free Gold** | Trial không cần credit card |
| **Pay-per-Visit** | Chỉ trả khi CÓ khách thật |

### 11.5 Onboarding Simplified

| Feature | Mô tả |
|---------|--------|
| **1-Click Setup** | Import từ Google Maps |
| **WhatsApp Support** | Nhân viên hỗ trợ trực tiếp |
| **Auto Profile** | Pull data từ platform khác |

---

## §12 · Taste Board (Locket Collections)

> Cập nhật: 2026-08-06 · v2.3

### 12.1 Tổng quan

Taste Board = Collection của các món ăn/lockets. User có thể tạo nhiều boards cho các mục đích khác nhau.

### 12.2 Data Model

```typescript
interface TasteBoard {
  id: string;
  ownerId: string;           // FK → User
  name: string;
  description?: string;
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
  createdAt: Date;
  updatedAt: Date;
}

interface TasteBoardItem {
  id: string;
  boardId: string;           // FK → TasteBoard
  restaurantId?: string;     // FK → Restaurant (optional)
  dishName?: string;
  locketId?: string;         // FK → Locket (optional)
  note?: string;
  addedAt: Date;
}
```

### 12.3 Use Cases

| Board Name | Visibility | Mục đích |
|------------|-----------|----------|
| "Quán ngon Sài Gòn" | PUBLIC | Chia sẻ với cộng đồng |
| "Bữa trưa team" | FRIENDS | Share với nhóm |
| "Ăn vặt dưới 30K" | PRIVATE | Personal tracking |
| "Cuối tuần gia đình" | FRIENDS | Family dining |

---

## §13 · Menu Capture & AI Personalization

> Cập nhật: 2026-08-06 · v2.4

### 13.1 Menu Capture

**Concept:** Chụp menu tại quán → AI đọc → Đưa vào vòng quay → Mỗi member trong circle được suggest best match.

**User Flow:**
```
1. Đến quán → Chụp menu (từ camera app)
2. AI OCR đọc menu → Parse thành danh sách món
3. User xác nhận/chỉnh sửa menu
4. Spin với các món từ menu này
5. AI suggest best match cho từng member
```

#### Data Model

```typescript
interface Menu {
  id: string;
  restaurantId: string;      // FK → Restaurant
  imageUrl: string;
  extractedText: string;     // AI OCR output
  parsedItems: MenuItem[];   // Array of parsed items
  capturedAt: Date;
  capturedBy: string;        // FK → User
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

interface MenuItem {
  id: string;
  menuId: string;
  name: string;
  priceVND?: number;
  category?: string;         // món chính, side, drink...
  tags: string[];           // spicy, vegetarian, gluten-free...
}
```

#### AI OCR Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Chụp ảnh   │ → │  Vision API  │ → │  Parse Text  │
│  menu        │    │  OCR         │    │  (structured)│
└──────────────┘    └──────────────┘    └──────────────┘
                                              ↓
                    ┌──────────────┐    ┌──────────────┐
                    │  User Verify │ ← │  Extract     │
                    │  & Edit      │    │  MenuItems   │
                    └──────────────┘    └──────────────┘
```

### 13.2 AI Personalization

**Concept:** Dựa trên sở thích của từng member trong circle → AI suggest best match → Tăng satisfaction cho cả nhóm.

#### User Preference Learning

```typescript
interface UserPreference {
  id: string;
  userId: string;            // FK → User (1:1)
  cuisineScores: Record<string, number>;  // { "Vietnamese": 0.9, "Japanese": 0.7 }
  priceRange: 1 | 2 | 3 | 4;
  dietaryRestrictions: string[];  // vegetarian, halal, gluten-free...
  spiceTolerance: 'mild' | 'medium' | 'spicy';
  updatedAt: Date;
}
```

#### Preference Learning Sources

| Source | Weight | Description |
|--------|--------|-------------|
| Spin history | 40% | Món nào đã spin trước đây |
| Locket ratings | 30% | Rating đã cho |
| Reviews written | 20% | Review content analysis |
| Explicit settings | 10% | User tự set trong profile |

#### Circle Recommendation

```typescript
interface CircleRecommendation {
  id: string;
  groupId: string;          // FK → Group
  spinSessionId?: string;    // Optional, link to spin
  memberScores: Record<string, {
    matchScore: number;      // 0-1
    reasons: string[];      // ["Bạn thích món cay", "Trong budget"]
    suggestedItems: string[]; // Top 3 items for this member
  }>;
  createdAt: Date;
}
```

#### Match Algorithm

```typescript
function calculateMatchScore(
  member: UserPreference,
  menuItems: MenuItem[],
  groupContext: GroupContext
): CircleRecommendation {
  const scores = member.scores.map(item => ({
    item,
    score: calculateItemScore(item, member),
    reasons: getMatchReasons(item, member)
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return {
    groupId: groupContext.id,
    memberScores: {
      [member.userId]: {
        matchScore: scores[0].score,
        reasons: scores[0].reasons,
        suggestedItems: scores.slice(0, 3).map(s => s.item.name)
      }
    }
  };
}

function calculateItemScore(item: MenuItem, pref: UserPreference): number {
  let score = 0;

  // Cuisine match (40%)
  const cuisineMatch = pref.cuisineScores[item.category] || 0.5;
  score += cuisineMatch * 0.4;

  // Price match (30%)
  const priceMatch = item.priceVND <= getMaxPrice(pref.priceRange) ? 1 : 0.5;
  score += priceMatch * 0.3;

  // Dietary match (20%)
  const dietaryMatch = itemMeetsDietary(item, pref.dietary) ? 1 : 0;
  score += dietaryMatch * 0.2;

  // Spice tolerance (10%)
  const spiceMatch = itemSpiceLevel(item) <= pref.spiceTolerance ? 1 : 0.5;
  score += spiceMatch * 0.1;

  return score;
}
```

### 13.3 UI Flow: Menu Spin

```
┌─────────────────────────────────────────────────────┐
│  📷 Chụp Menu                                      │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │         [Camera Viewfinder]                │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Hoặc chọn ảnh có sẵn                            │
│                                                     │
│  [  📁 Chọn từ thư viện  ]                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  📋 Xác nhận Menu                                  │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Đã nhận diện 15 món từ menu:                    │
│                                                     │
│  ✓ Cơm gà xối mỡ          45,000                │
│  ✓ Cơm gà teriyaki        50,000                │
│  ✓ Cơm gà curry           48,000                │
│  ✓ Bún gà nướng           40,000                │
│  ✗ ────────────────────── (có thể xóa)          │
│                                                     │
│  [ + Thêm món ]  [ Chỉnh sửa ]                   │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  Thêm món nào không có trên menu?                  │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [ Quay với Menu này ] →                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🎰 Kết quả Spin                                   │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Cơm gà xối mỡ                              │   │
│  │  45,000đ                                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  🔮 AI Gợi ý cho cả nhóm:                        │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  👤 Minh: "Bạn thường thích món cay, món này    │
│     hợp với khẩu vị của bạn ✓"                   │
│                                                     │
│  👤 Lan: "Món này trong budget của bạn,          │
│     Lan's pick! ✓"                                 │
│                                                     │
│  👤 Tuấn: "Hơi cay nhưng bạn vẫn thích          │
│     thử món mới đúng không? 🤙"                    │
│                                                     │
│  [ Chấp nhận ]  [ Quay lại ]                      │
└─────────────────────────────────────────────────────┘
```

### 13.4 Privacy & Data

- **Preference data:** Private by default, can share with circle
- **Menu photos:** Can be shared or kept private
- **AI suggestions:** Explainable ("Vì bạn thích...")

---

## Phụ lục · Tài liệu liên quan trong repo

| File | Mô tả |
|------|-------|
| `brand/brand.md` | Brand Kit đầy đủ (định vị, màu, font, tone, logo, messaging) |
| `brand/FOOD-ROULETTE-SITEMAP.md` | Sitemap & đặc tả thiết kế chi tiết (v2.4) |
| `brand/prompts.md` | File này — tổng hợp dạng prompt |
| `docs/food_roulette_erd.drawio.xml` | ERD với Menu + AI entities |
| `content/explore/spin-system-v2.md` | Chi tiết Spin System |
| `content/explore/restaurant-partner-strategy.md` | Chiến lược Restaurant Partner |
| `content/explore/menu-ai-strategy.md` | Menu Capture & AI Personalization |
| `Content/feature.docx` | Mô tả 5 tính năng chính + metric |
| `Content/pricing.docx` | 3 gói Free/Pro/Business + ROI |

---

*Lưu ý:*
- *Cập nhật file này mỗi khi thay đổi quyết định lớn. Nếu AI đọc sai, kiểm tra file này trước.*
- *Mọi mâu thuẫn giữa file này và các tài liệu khác: ưu tiên `brand/prompts.md` → `brand/brand.md` → `brand/FOOD-ROULETTE-SITEMAP.md` → `Content/*.docx`.*
- *Phiên bản: 2.4 · Ngày: 2026-08-06.*