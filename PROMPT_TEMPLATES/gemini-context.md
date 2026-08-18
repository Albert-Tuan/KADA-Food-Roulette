# Prompt Template for Gemini

> Copy/paste vào Gemini (gemini.google.com) khi bắt đầu session mới
> **Version:** 1.1 · **Date:** 2026-08-07

---

## Quick Start

```
1. Paste toàn bộ nội dung này vào Gemini chat
2. Bắt đầu task
```

---

## Context Packet

```markdown
# Food Roulette Context

## Project
Mobile app (React Native + Expo) giúp người Việt chọn quán ăn ngẫu nhiên.
Tagline: "Không biết ăn gì? Để vòng quyết định."

## USP
- Spin cho nhóm (max 20 người, vote)
- Locket camera-only với metadata
- 2 display names (private/public)
- Menu Capture (AI OCR)
- AI Personalization (suggest best match)

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

## Spec Priority Order
brand/prompts.md > brand/brand.md > brand/FOOD-ROULETTE-SITEMAP.md > content/*.docx

## Spec Files (đọc trong repo hoặc paste đoạn liên quan)
- `brand/prompts.md` — Single source of truth
- `brand/brand.md` — Design tokens
- `brand/FOOD-ROULETTE-SITEMAP.md` — Feature specs
- `VIBE_RULES.md` — Golden rules
- `AGENTS.md` — Agent conventions
- `CLAUDE.md` — Entry point

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

## Skills (Cursor only)
Skills trong `.agents/skills/` chỉ hoạt động với Cursor IDE. Các AI tools khác tuân thủ rules trực tiếp từ:
- `VIBE_RULES.md` — 10 golden rules
- `AGENTS.md` — Agent conventions & permissions

## Key Constraints
- Group.member_ids.length <= 20
- Locket chỉ từ camera app
- Restaurant.status='approved' mới trong roulette
- User.publicId immutable

## Feature Owners (5 Roles)
| Feature | Owner | Stack |
|---------|-------|-------|
| SPIN (Personal + Group) | Hoàng Hiếu | React Native + Expo + Reanimated |
| AUTH + ONBOARDING | Trường | Express + Prisma + MySQL + JWT |
| LOCKET + PROFILE | Gia Bình | React Native + Expo + Supabase Storage |
| REVIEW + DISCOVER | Thành Nam | Express + Prisma + MySQL + GitHub Actions + EAS Build |
| PM + B2B | Tuấn Anh | Architecture + Scope Control |

## Không Được Làm
- Thêm feature tự ý
- Override design tokens
- Commit credentials
- Đoán spec
```

---

## Cách Dùng

### Bắt đầu task

```
Paste context → Mô tả task → Execute
```

### Hỏi về spec

```
"Check spec trong brand/ cho feature X"
```

### Code generation

```
"Tạo code theo spec. Đã đọc: [files]"
```

---

## Lưu Ý

- Gemini có context limit — chia nhỏ prompts nếu cần
- Không assume spec — hỏi user khi không rõ
- Tuân thủ golden rules

---

*Paste toàn bộ vào Gemini · 2026-08-07*
