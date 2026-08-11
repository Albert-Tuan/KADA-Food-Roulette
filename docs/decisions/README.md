# ADR-000: Architecture Decision Records (ADR) Index

> **Lightweight ADR cho Food Roulette.**
> Mỗi quyết định kiến trúc có 1 file riêng. Index tại đây.

---

## Decision Records

| # | Title | Status | Date | Impact |
|---|-------|--------|------|--------|
| [001](001-ai-moderation.md) | AI Moderation Service Selection | Accepted | 2026-08-11 | High |
| [002](002-discover-map.md) | Discover Map - Geo Query Strategy & Map SDK | Accepted | 2026-08-11 | High |
| [003](003-ai-suggestion.md) | AI Suggestion Algorithm | Accepted | 2026-08-11 | Medium |
| [004](004-realtime-architecture.md) | Real-time WebSocket Architecture | Accepted | 2026-08-11 | High |
| [005](005-ai-advisor.md) | AI Food Advisor LLM | Accepted | 2026-08-11 | Medium |

---

## ADR Format

Mỗi ADR follow Michael Nygard's format:

```markdown
# ADR-NNN: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by NNN]

## Context
[Vấn đề cần giải quyết]

## Decision
[Quyết định cuối cùng]

## Consequences
[Positive, Negative, Risks]

## Alternatives Considered
[Các options đã cân nhắc + lý do reject]

## References
[Links, docs]

## Approval
[Người approve + date]
```

---

## Convention

- **Không xóa ADR** - Chỉ mark "Superseded by NNN" nếu replaced
- **Mỗi ADR 1 quyết định** - Không gộp nhiều decisions
- **Append-only** - File mới theo số thứ tự

---

*Maintainer: Tuấn Anh (Architect)*