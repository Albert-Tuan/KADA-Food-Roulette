# VIBE_RULES.md

> **Bộ rules cho VIBE CODING** — tất cả AI phải tuân thủ
> **Version:** 1.0 · **Date:** 2026-08-06
> **Applies to:** Cursor, ChatGPT, Claude, Gemini, và mọi AI tool khác

---

## 1. Tổng quan

Khi team dùng AI để code, mỗi người có thể dùng tool khác nhau (Cursor, ChatGPT, Claude, Gemini...). Bộ rules này đảm bảo:

- **Consistency:** Tất cả AI nhận cùng context và constraints
- **Quality:** Spec được follow, không tự thêm tính năng
- **Traceability:** Ai thay đổi gì, khi nào đều có log

---

## 2. 10 Golden Rules

### Rule 1: Đọc Spec Trước Khi Code

**LUÔN LUÔN** đọc files theo thứ tự ưu tiên:

1. `brand/prompts.md` §0 — Master prompt (copy/paste vào AI)
2. `brand/brand.md` — Brand kit (màu, font, tone)
3. `brand/FOOD-ROULETTE-SITEMAP.md` §19 — Spec chi tiết

**KHÔNG BAO GIỜ** code khi chưa đọc spec.

### Rule 2: Không Tự Thêm Tính Năng

- Muốn thêm tính năng → hỏi PM/team trước
- AI không được tự quyết định "tính năng này có vẻ hay"
- Nếu thấy spec thiếu → báo PM, không tự bổ sung

### Rule 3: Check 3 Files Trước Khi Code

| Thứ tự | File | Mục đích |
|---------|------|----------|
| 1 | `brand/prompts.md` | Single source of truth |
| 2 | `brand/brand.md` | Design language |
| 3 | `brand/FOOD-ROULETTE-SITEMAP.md` | Data model & UI |

### Rule 4: Mỗi AI Đều Phải Tuân Thủ

| AI Tool | Cách áp dụng |
|---------|-------------|
| Cursor | Tự động load `.cursorrules`, `CLAUDE.md`, `VIBE_RULES.md` |
| ChatGPT | Copy `PROMPT_TEMPLATES/chatgpt-context.md` vào chat |
| Claude | Copy `PROMPT_TEMPLATES/claude-context.md` vào chat |
| Gemini | Copy `PROMPT_TEMPLATES/gemini-context.md` vào chat |

### Rule 5: Spec Thay Đổi → Log

**BẮT BUỘC** log mọi thay đổi spec vào `CHANGELOG_SPEC.md`:

```markdown
## YYYY-MM-DD
- Changed: [Mô tả thay đổi]
- By: [Tên người] - [Role]
- Via: [AI Tool]
- Spec: [File và section]
```

### Rule 6: Verify Trước Khi Commit

**Checklist trước commit:**

- [ ] `npm run typecheck` pass
- [ ] `npm run lint` pass
- [ ] Không có credentials trong code
- [ ] Code match spec đã đọc
- [ ] Unit tests pass (nếu có)

### Rule 7: Code Phải Match Spec

- Không "pragmatic override" spec
- Nếu spec không rõ → hỏi, không đoán
- Nếu muốn deviate → discuss với team trước

### Rule 8: Mỗi Feature Có Owner

| Feature | Owner | Stack |
|---------|-------|-------|
| SPIN (Personal + Group) | Hoàng Hiếu | React Native + Expo + NativeWind + Reanimated |
| AUTH + ONBOARDING | Trường | Express + Prisma + MySQL + JWT |
| LOCKET + PROFILE | Gia Bình | React Native + Expo + Supabase Storage |
| REVIEW + DISCOVER | Thành Nam | Express + Prisma + MySQL + GitHub Actions + EAS Build |
| PM + B2B | Tuấn Anh | Architecture + Scope Control |

### Rule 9: Privacy & Security

**KHÔNG BAO GIỜ commit:**

- `.env`, credentials
- API keys, tokens
- Personal data của user
- File binary lớn (>500KB)

### Rule 10: Khi Không Chắc — Hỏi

- Đừng đoán spec
- Đừng "大概" (khoảng) khi không biết
- Hỏi team/PM để clarify

---

## 3. Quy Trình Spec → Implement → Verify

```
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 1: SPEC REVIEW                                      │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  1. Đọc brand/prompts.md §0                               │
│  2. Đọc brand/brand.md                                    │
│  3. Đọc brand/FOOD-ROULETTE-SITEMAP.md §19               │
│  4. Đọc feature spec cụ thể (nếu có)                     │
│                                                              │
│  Checklist: □ Đã hiểu spec □ Đã check conflicts □ Đã hỏi  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 2: IMPLEMENT                                       │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  1. Code theo spec đã đọc                                │
│  2. Dùng đúng design tokens từ brand.md                  │
│  3. Tuân thủ naming conventions                          │
│  4. Comment chỉ khi cần giải thích intent               │
│                                                              │
│  Checklist: □ Code done □ Match spec □ Naming correct     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 3: VERIFY                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  1. Chạy typecheck                                         │
│  2. Chạy linter                                           │
│  3. Review code với spec                                  │
│  4. Self-review: "Code có match spec không?"              │
│                                                              │
│  Checklist: □ Typecheck pass □ Lint pass □ Spec match      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  BƯỚC 4: COMMIT & LOG                                    │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  1. Commit message theo Conventional Commits             │
│  2. Update CHANGELOG_SPEC.md nếu có spec change         │
│  3. Nếu spec change → phải được PM approve              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Constraints — Không Được Làm

### Tuyệt đối không được:

| ❌ | Thay vì | ✅ |
|----|----------|-----|
| Thêm feature tự ý | Hỏi PM trước | Báo cáo spec thiếu |
| Override design tokens | Dùng brand.md tokens | Hỏi design team |
| Commit credentials | Không bao giờ | Dùng .env.example |
| Hardcode config | Dùng config files | Hỏi backend |
| Tạo file mới không hỏi | Hỏi team trước | Follow conventions |
| Đoán spec | Hỏi khi không rõ | Đừng assume |

### Khi muốn làm những việc này → phải hỏi:

| Việc | Hỏi ai |
|-------|--------|
| Thêm feature mới | PM |
| Thay đổi design tokens | Design/Frontend lead |
| Thay đổi API contracts | Backend lead |
| Thêm dependency mới | Team vote |
| Refactor lớn (>1 file) | PM approve |
| Sửa brand/*.md | PM + Design approve |

---

## 5. Priority Khi Mâu Thuẫn

Khi các file spec mâu thuẫn, thứ tự ưu tiên:

```
brand/prompts.md > brand/brand.md > brand/FOOD-ROULETTE-SITEMAP.md > content/*.docx
```

---

## 6. Quick Reference Card

### Khi bắt đầu chat mới với AI:

```
1. Copy brand/prompts.md §0
2. Copy VIBE_RULES.md §1-2
3. Paste vào AI chat
4. Bắt đầu hỏi/bàn giao task
```

### Checklist trước mỗi task:

- [ ] Đã đọc 3 spec files
- [ ] Hiểu feature cần làm
- [ ] Biết ai là owner
- [ ] Có spec link để reference

### Checklist sau mỗi task:

- [ ] Typecheck pass
- [ ] Lint pass
- [ ] Code match spec
- [ ] Log vào CHANGELOG_SPEC.md (nếu có change)
- [ ] Commit theo Conventional Commits

---

## 8. Cross-File Consistency — Đồng Bộ Toàn Bộ Files

### Nguyên Tắc Vàng

> **Khi thay đổi BẤT KỲ file nào trong dự án, AI PHẢI tìm và cập nhật TẤT CẢ các file liên quan.**

### Tại Sao Quan Trọng

Trong Food Roulette, có nhiều files chứa cùng thông tin:
- ERD XML (`docs/*.xml`) ↔ Prisma Schema (`backend/prisma/schema.prisma`)
- Prisma Schema ↔ SQL Migrations (`backend/prisma/migrations/`)
- Prompt Templates ↔ Spec Files (`brand/*.md`)
- Spec Files ↔ CHANGELOG

**Nếu không đồng bộ** → inconsistencies → bugs → developer confusion.

---

### Bảng Mapping Files Liên Quan

| Khi thay đổi... | Phải đồng bộ... |
|------------------|------------------|
| `docs/*.xml` (ERD) | `backend/prisma/schema.prisma`, `docs/ERD_MIGRATION_NOTES.md`, `backend/prisma/migrations/` |
| `backend/prisma/schema.prisma` | `docs/*.xml`, `backend/prisma/migrations/*.sql` |
| `backend/prisma/migrations/` | `backend/prisma/schema.prisma`, `docs/ERD_MIGRATION_NOTES.md` |
| `brand/prompts.md` | `brand/brand.md`, `brand/FOOD-ROULETTE-SITEMAP.md`, `PROMPT_TEMPLATES/*.md` |
| `brand/brand.md` | `brand/prompts.md`, `app/tailwind.config.js` |
| `CHANGELOG_SPEC.md` | (không cần sync, nhưng phải update khi spec thay đổi) |
| `VIBE_RULES.md` | `CLAUDE.md`, `AGENTS.md`, `PROMPT_TEMPLATES/chatgpt-context.md` |

---

### Quy Trình Khi Thay Đổi

#### Bước 1: Tìm tất cả files liên quan

```bash
# Tìm files liên quan đến ERD
rg -l "SpinSession|Locket|CheckIn" --type prisma,sql,md

# Tìm files reference đến entity cụ thể
rg "SpinWallet" -g "*.prisma" -g "*.sql" -g "*.md"
```

#### Bước 2: Đọc tất cả files liên quan

Trước khi sửa, phải đọc ít nhất:
- File đang sửa
- Tất cả files trong cùng "group" (xem bảng trên)
- Files trong `docs/` nếu là schema change
- Files trong `backend/prisma/` nếu là code change

#### Bước 3: Sửa tất cả cùng lúc

**Sửa KHÔNG ĐƯỢC sửa chỉ 1 file.** Phải sửa tất cả files liên quan trong cùng một lần.

#### Bước 4: Verify consistency

```bash
# Kiểm tra schema và migration khớp nhau
npm run db:validate

# Kiểm tra typecheck
npm run typecheck

# Kiểm tra lint
npm run lint
```

---

### Checklist Đồng Bộ

Trước khi commit, verify:

- [ ] **Schema change?**
  - [ ] `backend/prisma/schema.prisma` đã update
  - [ ] `backend/prisma/migrations/` đã update (hoặc tạo migration mới)
  - [ ] `docs/*.xml` ERD đã update
  - [ ] `docs/ERD_MIGRATION_NOTES.md` đã update

- [ ] **Spec change?**
  - [ ] `brand/prompts.md` đã update
  - [ ] `brand/brand.md` đã update (nếu design thay đổi)
  - [ ] `brand/FOOD-ROULETTE-SITEMAP.md` đã update
  - [ ] `PROMPT_TEMPLATES/` đã update
  - [ ] `CHANGELOG_SPEC.md` đã log change

- [ ] **UI/Design change?**
  - [ ] `app/tailwind.config.js` đã update (nếu tokens thay đổi)
  - [ ] `brand/brand.md` đã update

- [ ] **Process/Rule change?**
  - [ ] `VIBE_RULES.md` đã update
  - [ ] `CLAUDE.md` đã update
  - [ ] `AGENTS.md` đã update
  - [ ] Tất cả `PROMPT_TEMPLATES/*.md` đã update

---

### Cảnh Báo Red Flags

🚨 **STOP ngay nếu thấy:**

| Red Flag | Hành động |
|----------|-----------|
| Sửa schema nhưng không sửa ERD | Sửa ERD trước, rồi generate lại schema |
| Sửa spec nhưng không log CHANGELOG | Log ngay, không commit |
| Sửa prompts.md nhưng không sync templates | Sync tất cả templates |
| Sửa brand tokens nhưng không update tailwind | Update tailwind.config.js |
| Thêm field mới nhưng không thêm migration | Tạo migration trước |

---

### AI-Specific Rules

#### Cursor / Claude (file-based):
- Sau khi sửa 1 file, **tự hỏi**: "File nào khác cần sửa?"
- Dùng `Grep` để tìm references: `rg "EntityName" -g "*.prisma" -g "*.sql"`

#### ChatGPT / Gemini (prompt-based):
- Khi nhận task, **liệt kê** tất cả files cần thay đổi
- Sau khi done, **verify** tất cả files đã được update

---

## 9. Exception Cases

### Khi nào được sửa 1 file?

| Exception | Điều kiện |
|-----------|-----------|
| Chỉ đọc | Không sửa gì, chỉ đọc để hiểu context |
| Typo fix | Chỉ fix lỗi chính tả, không đổi logic |
| Comment update | Chỉ cập nhật comment không ảnh hưởng logic |
| README docs | File docs không ảnh hưởng code |

### Khi nào PHẢI sửa nhiều files?

| Trường hợp | Files phải update |
|------------|-------------------|
| Thêm entity mới | schema.prisma + ERD XML + migration + ERD_MIGRATION_NOTES |
| Đổi field | schema.prisma + migration + tất cả queries dùng field đó |
| Đổi feature flag | prompts.md + sitemap + CHANGELOG |
| Đổi design token | brand.md + tailwind.config.js |

---

*Lưu ý: Đây là rule bắt buộc. Không tuân thủ = inconsistent codebase = bug.*

---

## 7. Related Files

| File | Mục đích |
|------|----------|
| `CLAUDE.md` | Entry point cho AI |
| `AGENTS.md` | Role-specific rules |
| `CURSOR_RULES.md` | Cursor IDE rules |
| `PROMPT_TEMPLATES/*` | Context packets cho từng AI |
| `CHANGELOG_SPEC.md` | Spec change log |

---

*Version 1.0 · 2026-08-06 · Food Roulette Team*
