# ADR-003: AI Suggestion Algorithm

## Status
Accepted - 2026-08-11

## Context

Food Roulette cần gợi ý quán ăn cho user dựa trên:
- **Lịch sử ăn uống** (đã ăn gì, ở đâu)
- **Preferences** (cuisine yêu thích, dietary restrictions)
- **Context** (thời gian, vị trí, group size)
- **Social signals** (bạn bè đang ăn gì)

## Decision

### Hybrid Approach: 3 signals combined

```typescript
suggestionScore(restaurant, user, context) =
  0.40 * contentBasedScore(restaurant, user)      // User's own preferences
  + 0.30 * collaborativeScore(restaurant, user)   // Similar users
  + 0.20 * contextualScore(restaurant, context)   // Time/place/group
  + 0.10 * popularityScore(restaurant)            // General popularity
```

### Signal 1: Content-Based (40%)

Tính cosine similarity giữa user preference vector và restaurant features.

```typescript
// User features
userVector = [
  cuisine_vietnamese: 0.8,
  cuisine_japanese: 0.3,
  price_low: 0.6,
  price_mid: 0.4,
  dietary_vegetarian: 0.0,
  // ... normalized to 0-1
]

// Restaurant features
restaurantVector = [
  cuisine_vietnamese: 1.0,
  cuisine_japanese: 0.0,
  price_low: 0.0,
  price_mid: 1.0,
  dietary_vegetarian: 0.0,
]

contentBasedScore = dot(userVector, restaurantVector) / (norm * norm)
```

### Signal 2: Collaborative (30%)

Tìm K users giống user (similarity > 0.7), aggregate các restaurants họ rate cao.

```typescript
function collaborativeScore(restaurantId, userId) {
  const similarUsers = await findSimilarUsers(userId, k=20, minSim=0.7);
  const scores = similarUsers.map(u => u.ratings[restaurantId] * u.similarity);
  return average(scores);
}
```

**Cold start**: Nếu user < 5 ratings → return 0, chỉ dùng content-based.

### Signal 3: Contextual (20%)

| Context | Boost logic |
|---------|-------------|
| Time of day | Sáng → cafe/phở/bún, Trưa → cơm, Tối → lẩu/nướng |
| Day of week | Cuối tuần → upscale, Ngày thường → casual |
| Group size | ≥ 5 → boost restaurants phù hợp nhóm |
| Distance | < 1km: boost, > 5km: penalty |
| Weather (future) | Mưa → boost comfort food |

### Signal 4: Popularity (10%)

Tổng hợp từ:
- Số lượt check-in (30 days)
- Average rating
- Recency (mới mở boost nhẹ)

### Caching Strategy

```typescript
// Cache key: "suggestions:{userId}:{contextHash}"
// TTL: 6 hours (recommendations stable trong vài giờ)
// Invalidation: Khi user add rating → invalidate ngay

class SuggestionCache {
  async get(userId, context) {
    const cached = await redis.get(this.key(userId, context));
    if (cached) return JSON.parse(cached);

    const fresh = await this.compute(userId, context);
    await redis.set(this.key(userId, context), JSON.stringify(fresh), 'EX', 6 * 3600);
    return fresh;
  }

  invalidate(userId) {
    // Pattern delete: suggestions:{userId}:*
    redis.del(...await redis.keys(`suggestions:${userId}:*`));
  }
}
```

### Cold Start Strategy

| User state | Strategy |
|-----------|----------|
| New user (0 ratings) | Popular + nearby (no personalization) |
| Few ratings (1-4) | Content-based only (40%) + Popularity (60%) |
| Established (5+) | Full hybrid |
| Power user (50+) | Trust more weight to collaborative |

### Performance Targets

- Cold compute: < 200ms (single user, full dataset)
- Cached: < 10ms (Redis lookup)
- Batch jobs (nightly): rebuild cho top 10K active users

## Implementation Plan

### Backend (Trường - 12h)

1. **Score functions:**
   ```typescript
   // backend/src/modules/circle/suggestion.engine.ts
   export async function computeSuggestions(
     userId: string,
     context: SuggestionContext
   ): Promise<RankedRestaurant[]>
   ```

2. **Caching layer:**
   ```typescript
   // backend/src/shared/services/suggestion-cache.service.ts
   ```

3. **API endpoint:**
   ```
   POST /api/circle/suggest
   Body: { lat, lng, time, groupSize, limit }
   Response: { suggestions: Restaurant[], generatedAt: string }
   ```

### Database (no schema changes)

Uses existing tables:
- `UserPreference` (user preferences)
- `SpinSession` (history)
- `Locket` (đã chụp)
- `CheckIn` (đã visit)
- `Friendship` (mutual friends)

### Frontend

- **Mobile:** Gia Bình - Inject suggestions vào Spin flow (optional chip "Gợi ý cho bạn")
- **Web:** Hoàng Hiếu - Suggestions card component

## Consequences

**Positive:**
- Personalization tăng retention
- Cache hit ratio > 70% (most users query vài lần/ngày)
- Graceful cold start
- Explainable (show why we suggest X)

**Negative:**
- Cold compute chậm cho power users
- Cache invalidation complexity
- Cần monitor bias (popular restaurants always boosted)

**Risks:**
- Filter bubble - **Mitigation:** Inject 20% random popular
- Privacy concerns - **Mitigation:** All computation on server, never expose user vectors

## Alternatives Considered

### A. Pure content-based
- Pro: Simple, fast, no cold start issue
- Con: Không leverage collective intelligence
- **Rejected:** Misses social signals

### B. Pure collaborative
- Pro: Better long-term quality
- Con: Cold start terrible
- **Rejected:** Bad for new users

### C. Matrix factorization (ALS)
- Pro: Better at scale
- Con: Complex, requires offline training
- **Deferred:** v3.0 khi có > 100K users

### D. LLM-based recommendations
- Pro: Can explain reasoning
- Con: Slow (1-2s), expensive ($0.01-0.10 per query)
- **Rejected for v1, deferred for v2.0 (AI Food Advisor)**

## Approval

Tuấn Anh (Architect) - 2026-08-11
Reviewed: Trường, Hoàng Hiếu

## References

- [Hybrid Recommender Systems](https://en.wikipedia.org/wiki/Recommender_system#Hybrid_recommender_systems)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Collaborative Filtering](https://en.wikipedia.org/wiki/Collaborative_filtering)