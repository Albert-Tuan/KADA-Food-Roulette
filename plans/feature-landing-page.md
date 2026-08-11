# Feature Plan: Landing Page + Legal Pages

## Overview
Xây dựng landing page hoàn chỉnh và các trang legal (privacy policy, terms of service).

## User Stories
- Landing page cho app promotion
- Privacy policy (Chính sách bảo mật)
- Terms of service (Điều khoản sử dụng)

## Architecture Decisions
- **Landing page:** Static/marketing pages trong web app
- **SEO:** Meta tags, OG images, sitemap
- **Legal docs:** Static content (có thể dùng MDX)

---

## Task List

### Phase 1: Landing Page

#### Task 1: Landing Page Layout
**Description:** Main layout cho landing page

**Acceptance criteria:**
- [ ] Header với navigation
- [ ] Hero section với CTA
- [ ] Responsive layout
- [ ] Footer với links

**Verification:**
- [ ] Layout renders correctly
- [ ] Responsive on mobile

**Dependencies:** None

**Files likely touched:**
- `apps/web/src/pages/landing/index.tsx`
- `apps/web/src/components/landing/Header.tsx`
- `apps/web/src/components/landing/Footer.tsx`

**Estimated scope:** Medium (3-4 files)

---

#### Task 2: Hero Section
**Description:** Hero với spin wheel animation

**Acceptance criteria:**
- [ ] Animated spin wheel
- [ ] Main tagline
- [ ] CTA buttons
- [ ] App store badges

**Verification:**
- [ ] Animation smooth
- [ ] CTAs clickable

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/landing/Hero.tsx`
- `apps/web/src/components/landing/SpinWheelAnimation.tsx`

**Estimated scope:** Medium (2-3 files)

---

#### Task 3: Features Section
**Description:** Section giới thiệu tính năng

**Acceptance criteria:**
- [ ] 4-5 feature cards
- [ ] Icons với animations
- [ ] Responsive grid

**Verification:**
- [ ] Cards display correctly
- [ ] Animations work

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/landing/Features.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 4: How It Works Section
**Description:** Section hướng dẫn cách hoạt động

**Acceptance criteria:**
- [ ] 3-step process
- [ ] Step indicators
- [ ] Illustrations

**Verification:**
- [ ] Steps display correctly
- [ ] Responsive layout

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/landing/HowItWorks.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 5: Social Proof Section
**Description:** Section testimonials và stats

**Acceptance criteria:**
- [ ] User testimonials
- [ ] Stats (users, restaurants, spins)
- [ ] App store badges

**Verification:**
- [ ] Testimonials display
- [ ] Stats visible

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/landing/SocialProof.tsx`

**Estimated scope:** Small (2 files)

---

#### Task 6: CTA Section
**Description:** Final CTA section

**Acceptance criteria:**
- [ ] Strong CTA
- [ ] App store badges
- [ ] Download counters

**Verification:**
- [ ] CTA prominent
- [ ] Links work

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/landing/CTA.tsx`

**Estimated scope:** Small (1-2 files)

---

### Checkpoint: After Tasks 1-6
- [ ] Landing page complete
- [ ] All sections render
- [ ] Responsive design works
- [ ] CTAs functional

---

### Phase 2: Legal Pages

#### Task 7: Privacy Policy Page
**Description:** Trang chính sách bảo mật

**Acceptance criteria:**
- [ ] Full privacy policy content
- [ ] Vietnamese language
- [ ] Proper formatting
- [ ] Print-friendly

**Verification:**
- [ ] Content complete
- [ ] Formatting correct

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/privacy.tsx`
- `apps/web/src/pages/legal/privacy.md`

**Estimated scope:** Small (2 files)

---

#### Task 8: Terms of Service Page
**Description:** Trang điều khoản sử dụng

**Acceptance criteria:**
- [ ] Full terms content
- [ ] Vietnamese language
- [ ] Proper formatting
- [ ] Print-friendly

**Verification:**
- [ ] Content complete
- [ ] Formatting correct

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/terms.tsx`
- `apps/web/src/pages/legal/terms.md`

**Estimated scope:** Small (2 files)

---

#### Task 9: Legal Navigation
**Description:** Links trong footer

**Acceptance criteria:**
- [ ] Privacy policy link
- [ ] Terms of service link
- [ ] Links in header (if needed)
- [ ] Legal pages accessible

**Verification:**
- [ ] Links work
- [ ] Pages accessible

**Dependencies:** Task 7, 8

**Files likely touched:**
- `apps/web/src/components/landing/Footer.tsx`

**Estimated scope:** Small (1 file)

---

### Checkpoint: After Tasks 7-9
- [ ] Privacy policy complete
- [ ] Terms of service complete
- [ ] Links working
- [ ] Ready for review

---

### Phase 3: SEO & Polish

#### Task 10: SEO Optimization
**Description:** SEO meta tags và OG images

**Acceptance criteria:**
- [ ] Meta title/description
- [ ] OG image
- [ ] Twitter card
- [ ] Sitemap entry

**Verification:**
- [ ] SEO tags correct
- [ ] Social sharing works

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/pages/landing/index.tsx`

**Estimated scope:** Small (1 file)

---

### Checkpoint: Complete
- [ ] Landing page complete
- [ ] Legal pages complete
- [ ] SEO optimized
- [ ] Ready for production

---

## Total Effort
- Landing Page: 12h
- Legal Pages: 4h
- SEO: 2h
- **Total: ~18h**

---

## Landing Page Sections

1. **Hero** - Spin wheel animation, tagline, CTA
2. **Pain Points** - Problem statements
3. **How It Works** - 3 steps
4. **Features** - Key features
5. **Target Audience** - Who it's for
6. **Social Proof** - Testimonials + stats
7. **CTA** - Final download CTA
8. **FAQ** - Common questions
9. **Footer** - Links + legal

---

## Open Questions
- Có cần blog section không?
- App store badges từ đâu lấy?
- Có cần multi-language (EN/VN) không?
