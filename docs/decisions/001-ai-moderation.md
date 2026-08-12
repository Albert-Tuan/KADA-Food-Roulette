# ADR-001: AI Moderation Service Selection

## Status
Accepted - 2026-08-11

## Context

Food Roulette cần moderation cho:
- **Review text** (nội dung đánh giá quán)
- **Locket captions** (caption khi chụp ảnh)
- **Group chat messages** (v2.0)

Cần auto-flag nội dung vi phạm (profanity, NSFW, spam, hate speech, violence) để giảm manual review workload.

## Decision

### Text Moderation: OpenAI Moderation API (`om-moderator-latest`)

**Rationale:**
- Free tier: đủ cho MVP (< 500K tokens/day)
- Vietnamese support tốt (đã test)
- Multi-category: hate, harassment, self-harm, sexual, violence
- Trả về confidence scores per category

### Image Moderation: NSFW.js (open-source, on-device)

**Rationale:**
- Free, runs locally (zero API cost)
- 90%+ accuracy cho NSFW detection
- Privacy: ảnh không rời khỏi server
- Trade-off: Không detect được violence, drugs

### Workflow

```
Content created → Auto-moderate → 
  IF confidence > 0.9 → auto-hide + queue for review
  IF 0.7 ≤ confidence ≤ 0.9 → queue for review (visible)
  IF confidence < 0.7 → publish
```

### Thresholds (will tune based on data)

- **> 0.9 confidence**: Auto-hide, immediate review queue
- **0.7 - 0.9 confidence**: Visible but flagged
- **< 0.7 confidence**: Pass through

### Rate Limiting

- 100 calls/hour/user
- 1000 calls/hour for system-wide batch jobs
- 429 response nếu vượt limit

### Fallback Strategy

- Nếu OpenAI down → grace period (24h) content không bị flag
- Sau 24h → manual review queue tăng backlog
- Nếu NSFW.js down → image skip moderation, content visible

## Schema Design

```prisma
model ModerationQueue {
  id          String   @id @default(uuid())
  contentType String   @db.VarChar(50) // 'review' | 'locket' | 'comment'
  contentId   String   // ID của content bị flag
  flaggedBy   String   @db.VarChar(100) // 'auto:openai-text' | 'auto:nsfw-image' | 'user:userId'
  category    String   @db.VarChar(50) // 'profanity' | 'nsfw' | 'spam' | 'hate' | 'violence'
  confidence  Float    // 0.0 - 1.0
  status      String   @default("pending") @db.VarChar(20) // 'pending' | 'approved' | 'rejected' | 'auto_hidden'
  reviewedBy  String?  // User ID of reviewer
  reviewedAt  DateTime?
  reviewerNote String? @db.Text
  payload     String?  @db.Text // JSON: API response, image URL
  createdAt   DateTime @default(now())

  @@index([status, createdAt])
  @@index([contentType, contentId])
  @@index([flaggedBy, status])
  @@map("moderation_queue")
}
```

## API Endpoints

```
GET    /api/moderation/queue         # List pending (steward only)
GET    /api/moderation/queue/:id     # Item detail
POST   /api/moderation/queue/:id/approve
POST   /api/moderation/queue/:id/reject
POST   /api/moderation/queue/:id/auto-hide
GET    /api/moderation/stats         # Stats (total flagged, etc.)
```

All endpoints require `role = STEWARD` or `ADMIN`.

## Cost Analysis

### OpenAI Moderation API
- Free tier: 500K tokens/day
- Beyond free: $0.01/1K tokens
- Estimate at 10K reviews/day × 100 tokens = 1M tokens/day → ~$5/day after free tier

### NSFW.js
- $0 (open-source, runs locally)
- CPU/RAM overhead: ~100MB per worker
- No external API calls

### Combined monthly cost (10K reviews/day):
- Free tier đủ: $0-5/month
- Beyond: $150/month

## Implementation Plan

### Backend (Trường - 12h)
1. `backend/src/shared/services/moderation.service.ts` - Adapter interface
2. `backend/src/shared/services/openai-moderation.adapter.ts` - OpenAI impl
3. `backend/src/shared/services/nsfw-moderation.adapter.ts` - NSFW.js impl
4. `backend/src/shared/services/__tests__/moderation.service.test.ts` - Tests
5. `backend/src/modules/moderation/moderation.controller.ts` - Queue API
6. `backend/src/modules/moderation/moderation.routes.ts` - Routes

### Database (Tuấn Anh - 3h)
1. Migration file: `add_moderation_queue`
2. Schema.prisma update
3. ERD XML update
4. ERD_MIGRATION_NOTES.md update

### Dashboard (Tuấn Anh - 8h)
1. `apps/web/src/pages/steward/moderation/queue.tsx`
2. `apps/web/src/pages/steward/moderation/item/[id].tsx`
3. `apps/web/src/pages/steward/moderation/stats.tsx`

## Consequences

**Positive:**
- Free tier đủ cho MVP
- Privacy: ảnh không rời server (NSFW.js)
- Multi-language support (Vietnamese + English)
- Confidence scores cho transparency

**Negative:**
- Vendor lock-in (OpenAI) - Mitigation: Adapter pattern
- False positives - Mitigation: Easy appeal flow
- Vietnamese nuance có thể miss - Mitigation: Manual review queue

**Risks:**
- OpenAI outage → Service down - Mitigation: Fallback + retry
- API rate limit → Queue buildup - Mitigation: Rate limit per user
- NSFW.js false positives on food photos - Mitigation: Train threshold

## Alternatives Considered

### A. Perspective API (Google Jigsaw)
- Pro: Free, well-tested
- Con: English-only, Vietnamese accuracy low
- **Rejected:** Poor Vietnamese support

### B. AWS Rekognition (Moderation Labels)
- Pro: Image + text moderation
- Con: $1/1000 images, $0.10/1000 text units
- **Rejected:** More expensive than combined OpenAI + NSFW.js

### C. Self-hosted model (BERT fine-tuned)
- Pro: Full control
- Con: Need labeled Vietnamese dataset (10K+ samples), ML ops overhead
- **Rejected:** Too much effort for MVP, deferred to v2.0

### D. Manual moderation only
- Pro: Zero false positives
- Con: Doesn't scale, $2-5 per review, slow
- **Rejected:** Doesn't work cho v1.0 scale

## Approval

Tuấn Anh (Architect) - 2026-08-11
Reviewed: Trường, Hoàng Hiếu, Gia Bình

## References

- [OpenAI Moderation API Docs](https://platform.openai.com/docs/guides/moderation)
- [NSFW.js GitHub](https://github.com/infinitered/nsfwjs)
- [Perspective API](https://perspectiveapi.com/)