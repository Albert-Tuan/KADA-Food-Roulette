# Prompt Template for ChatGPT

> Copy/paste vào ChatGPT khi bắt đầu session mới
> **Version:** 1.2 · **Date:** 2026-08-07

---

## Quick Start

```
1. Paste toàn bộ nội dung này vào ChatGPT
2. Bắt đầu hỏi/bàn giao task
```

---

## Context Packet

```markdown
# Food Roulette Context

## Project
Mobile app (React Native + Expo) cho người Việt chọn quán ăn ngẫu nhiên.
Tagline: "Không biết ăn gì? Để vòng quyết định."

## Tech Stack
- Frontend (Web): React 19 + Vite + TypeScript + Tailwind CSS
- Frontend (Mobile - Future): React Native + Expo + NativeWind
- Animation: Reanimated 3 + Moti (mobile)
- State: Zustand + TanStack Query
- Backend: Express.js + Prisma + MySQL (Docker)
- Design: Earthy/warm-light-first (nâu-vàng)

## Project Structure
```
KADA-Food-Roulette/
├── Food Roulette-web/     # React + Vite web app
├── backend/              # Express.js + Prisma + MySQL
├── brand/               # Design & specs
├── Content/             # Strategy docs
├── docs/               # ERD & technical
├── .agents/skills/     # Agent skills (Cursor)
└── PROMPT_TEMPLATES/   # Context cho AI tools
```

## Spec Files (đọc trong repo hoặc paste đoạn liên quan)
- `brand/prompts.md` — Single source of truth
- `brand/brand.md` — Design tokens
- `brand/FOOD-ROULETTE-SITEMAP.md` — Feature specs
- `VIBE_RULES.md` — Golden rules
- `AGENTS.md` — Agent conventions
- `CLAUDE.md` — Entry point

## Key Specs
- Auth: JWT + bcrypt qua Express (email + Google OAuth)
- Spin: Random restaurant với bánh xe quay
- Group spin: Max 20 người, vote accept/respin
- Locket: Camera-only photo với metadata
- Menu Capture: AI OCR đọc menu (v1.1)
- AI Personalization: Suggest best match cho group (v1.1)

## Pricing Model

### B2C - Người dùng app
- **Free**: 0đ, 5 spins/ngày, 3 locket/tháng, có ad
- **Pro**: 59.000đ/tháng hoặc 490.000đ/năm (~30% off)
- **Spin Packs**: Starter (5 spins/15k), Standard (20 spins/59k), Premium (100 spins/199k)

### B2B - Restaurant Partner (Fixed + PPV)
| Tier | Fixed | PPV | Features |
|------|-------|-----|----------|
| Basic | Miễn phí | - | Badge only |
| Bronze | 99k/tháng | 5k/visit | Badge + Basic analytics |
| Silver | 199k/tháng | 4k/visit | Top 5 + Promo codes |
| Gold | 399k/tháng | 3k/visit | Top 3 + Full analytics + Priority |

### Billing Policy
- **Upgrade**: Prorated, active ngay
- **Downgrade**: Cuối chu kỳ, không refund
- **Cancel**: Giữ quyền đến hết chu kỳ đã paid
- **B2B Guarantee**: 0 đơn = Hoàn tiền 100% nếu 0 visit/30 ngày

## Spec Files (đọc online):
- brand/prompts.md: https://github.com/.../brand/prompts.md
- brand/brand.md: Design tokens
- VIBE_RULES.md: Golden rules

## Skills (Cursor only)
Skills trong `.agents/skills/` chỉ hoạt động với Cursor IDE. Các AI tools khác tuân thủ rules trực tiếp từ:
- `VIBE_RULES.md` — 10 golden rules
- `AGENTS.md` — Agent conventions & permissions

## Ràng buộc quan trọng
1. Group.member_ids.length <= 20
2. Locket chỉ từ camera trong app
3. 2 display names: private vs public
4. Restaurant only in roulette khi status='approved'
5. Không tự thêm tính năng

## Feature Owners (5 Roles)
| Feature | Owner | Stack |
|---------|-------|-------|
| SPIN (Personal + Group) | Hoàng Hiếu | React Native + Expo + Reanimated |
| AUTH + ONBOARDING | Trường | Express + Prisma + MySQL + JWT |
| LOCKET + PROFILE | Gia Bình | React Native + Expo + Supabase Storage |
| REVIEW + DISCOVER | Thành Nam | Express + Prisma + MySQL + GitHub Actions + EAS Build |
| PM + B2B | Tuấn Anh | Architecture + Scope Control |

## Cross-File Consistency (CRITICAL)

> **Khi thay đổi file nào, PHẢI cập nhật TẤT CẢ files liên quan.**

| Thay đổi... | Phải đồng bộ... |
|---------------|------------------|
| ERD (docs/*.xml) | schema.prisma, migrations, ERD_MIGRATION_NOTES.md |
| schema.prisma | ERD, migrations/*.sql |
| brand/prompts.md | brand.md, sitemap, PROMPT_TEMPLATES/ |
| VIBE_RULES.md | CLAUDE.md, AGENTS.md, templates |

**KHÔNG ĐƯỢC** chỉ sửa 1 file khi có files liên quan.

## 10 Golden Rules
1. Đọc spec trước khi code
2. Không tự thêm tính năng
3. Check 3 files: prompts.md, brand.md, SITEMAP.md
4. Tuân thủ constraints
5. Log spec changes
6. Verify trước commit
7. Code phải match spec
8. Mỗi feature có owner
9. Không commit credentials
10. Khi không chắc — hỏi
```

---

## Cách Dùng

### Bắt đầu task mới

```
Paste context packet → Mô tả task → Execute
```

### Hỏi về spec

```
"Tôi đang làm feature X. Check spec giúp tôi:"
→ Paste relevant spec section
→ Answer questions
```

### Code review

```
"Review code này theo spec:"
→ Paste code
→ Provide feedback
```

---

## Lưu Ý

- Nếu cần xem spec chi tiết, hỏi user cung cấp file path
- Không make assumptions về spec
- Hỏi khi không rõ

---

*Paste toàn bộ vào ChatGPT · 2026-08-07*
