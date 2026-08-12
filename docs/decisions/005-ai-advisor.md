# ADR-005: AI Food Advisor LLM

## Status
Accepted - 2026-08-11

## Context

Food Roulette v2.0 sẽ có **AI Food Advisor** - chatbot giúp user:
- Gợi ý quán theo taste profile
- Trả lời câu hỏi "Hôm nay ăn gì?" một cách tự nhiên
- Tư vấn nhóm (group dynamics)
- Recommend theo context (mệt/hạn chế/kỷ niệm)

Cần chọn LLM và thiết kế interaction.

## Decision

### LLM: GPT-4o-mini

**Rationale:**
- Cost: $0.15/M input tokens, $0.60/M output tokens
- Fast: 200-500ms response time
- Vietnamese support tốt
- Function calling support (gọi tới tools/api)
- Có vision (cho menu scan)

**Trade-offs:**
- Vendor lock-in (OpenAI)
- Privacy concerns (data qua OpenAI)
- Cost tăng theo usage

### Alternatives Considered

| Model | Pros | Cons | Decision |
|-------|------|------|----------|
| GPT-4o-mini | Cheap, fast, multilingual | Vendor lock-in | **Selected** |
| Claude Sonnet 4 | Better reasoning | More expensive ($3/$15 per M) | Deferred |
| Gemini 2.0 Flash | Free tier, fast | Less reliable cho VN | Rejected |
| Llama 3.1 (self-host) | No vendor | Need GPU infra | Deferred |

### Architecture

```
User Query
    │
    ▼
[Rate Limit] ──► Reject if > 100/day
    │
    ▼
[Context Builder]
   ├─ User taste profile
   ├─ Recent spins/check-ins
   ├─ Location (if provided)
   ├─ Group context (if group query)
    │
    ▼
[LLM Call với Function Calling]
   ├─ Tool: search_restaurants()
   ├─ Tool: get_user_history()
   ├─ Tool: suggest_for_group()
    │
    ▼
[Response]
   ├─ Natural language answer
   ├─ Restaurant cards (if relevant)
    │
    ▼
[Cache]
   ├─ Per user per question (1 hour TTL)
```

### Conversation Memory

```typescript
interface ConversationMemory {
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  context: {
    currentLocation?: { lat: number; lng: number };
    currentGroupId?: string;
    activeFilters?: Record<string, unknown>;
  };
  expiresAt: string;
}
```

**Storage**: Redis với TTL 24h (auto-expire)
**Memory limit**: 20 messages (~10 turns)
**Cost optimization**: Summarize older messages

### Prompt Template

```typescript
const SYSTEM_PROMPT = `Bạn là AI Food Advisor cho Food Roulette - app giúp người Việt chọn quán ăn ngẫu nhiên.

PHONG CÁCH:
- Thân thiện, am hiểu ẩm thực Việt
- Dùng tiếng Việt tự nhiên
- Ngắn gọn (max 100 từ/response)
- Đưa ra 2-3 options, không spam

BỐI CẢNH USER:
{userTasteProfile}

QUÁN GẦN ĐÂY:
{nearbyRestaurants}

LỊCH SỬ GẦN:
{recentActivity}

Hãy trả lời câu hỏi của user một cách hữu ích và cá nhân.`;
```

### Function Calling Tools

```typescript
const TOOLS = [
  {
    name: 'search_restaurants',
    description: 'Tìm quán ăn theo criteria',
    parameters: {
      type: 'object',
      properties: {
        cuisine: { type: 'string' },
        priceLevel: { type: 'integer', minimum: 1, maximum: 4 },
        radiusKm: { type: 'number', default: 5 },
        maxResults: { type: 'integer', default: 5 },
      },
    },
  },
  {
    name: 'get_user_history',
    description: 'Lấy lịch sử ăn uống của user',
    parameters: {
      type: 'object',
      properties: {
        days: { type: 'integer', default: 30 },
      },
    },
  },
];
```

### Cost Estimation

| Usage | Cost/month |
|-------|------------|
| 1K active users × 5 queries/day × 500 tokens | $15-30 |
| 10K active users × 5 queries/day × 500 tokens | $150-300 |
| 100K active users (10% of total) | $1500-3000 |

### Rate Limiting

- 50 queries/day/user (hard limit)
- 200 queries/hour/user (burst)
- 429 response if exceeded

### Fallback Strategy

```typescript
async function advisorWithFallback(query: string): Promise<string> {
  try {
    return await callLLM(query);
  } catch (err) {
    if (err.status === 429) {
      return 'Bạn đã dùng hết lượt hỏi hôm nay. Vui lòng quay lại sau.';
    }
    if (err.status === 500 || err.status === 503) {
      return 'AI đang bận. Bạn có thể dùng Spin Roulette thay thế nhé!';
    }
    // Generic
    return 'Có lỗi xảy ra. Thử lại sau giây lát.';
  }
}
```

## Implementation Plan

### Backend (Trường - 12h)

1. **LLM adapter:**
   ```typescript
   // backend/src/shared/services/openai-advisor.adapter.ts
   ```

2. **Conversation memory:**
   ```typescript
   // backend/src/shared/services/conversation-memory.service.ts
   ```

3. **API endpoints:**
   ```
   POST /api/advisor/chat       # Send message, get response
   GET  /api/advisor/history    # Get conversation history
   DELETE /api/advisor/session  # Clear session
   ```

4. **Rate limiting:**
   ```typescript
   // Reuse rate-limit middleware from ADR-002
   ```

### Frontend

**Mobile (Hoàng Hiếu - 6h):**
- Chat screen cho advisor
- Restaurant cards inline
- Quick action buttons

**Web (Hoàng Hiếu - 4h):**
- Side panel với chat
- Cards modal

## Consequences

**Positive:**
- Differentiation: User có AI advisor thay vì chỉ random
- Higher engagement: Conversational UX
- Personalization: Càng dùng càng hiểu user

**Negative:**
- Cost ($150-300/month ở 10K users)
- Latency (200-500ms)
- Privacy: User data qua OpenAI

**Risks:**
- LLM hallucination (recommend quán không tồn tại) - **Mitigation:** Function calling only return real data
- Cost overrun - **Mitigation:** Hard rate limit + budget alerts
- Prompt injection - **Mitigation:** Sanitize inputs, separate system prompt

## Approval

Tuấn Anh (Architect) - 2026-08-11
Reviewed: Trường, Hoàng Hiếu

## References

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [GPT-4o-mini Pricing](https://openai.com/api/pricing/)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)