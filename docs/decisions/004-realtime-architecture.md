# ADR-004: Real-time WebSocket Architecture

## Status
Accepted - 2026-08-11

## Context

Food Roulette cần real-time features:
- **Group spin** (max 20 người cùng spin, vote real-time)
- **Live notifications** (friend check-in, group activity)
- **In-app chat** (v2.0)

Cần kiến trúc persistent connection giữa client và server.

## Decision

### Protocol: Socket.io

**Rationale:**
- Auto-reconnect built-in
- Fallback từ WebSocket → long polling (reliable qua proxy/firewall)
- Rooms/namespaces built-in (cho group isolation)
- Compatible với React Native + Web
- Có sẵn infrastructure knowledge trong team

### Authentication

JWT trong handshake:

```typescript
// Client
const socket = io('wss://api.foodroulette.app', {
  auth: { token: getJwtToken() },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// Server middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const user = verifyJwt(token);
  if (!user) return next(new Error('Unauthorized'));
  socket.data.user = user;
  next();
});
```

### Namespaces

| Namespace | Use case | Auth |
|-----------|----------|------|
| `/groups` | Group spin + voting | Required |
| `/notifications` | User-level notifications | Required |
| `/chat` | In-app chat (v2.0) | Required |

### Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Mobile App │         │   Socket.io  │         │  Backend    │
│  (Socket.io │ ◄────► │   Gateway    │ ◄────► │  Handlers   │
│   Client)   │   WSS   │  (Cluster)   │  Emit  │             │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │    Redis     │
                        │   Adapter    │
                        │ (multi-node) │
                        └──────────────┘
```

### Scaling Path

**Phase 1 (MVP, < 1000 concurrent):**
- Single Socket.io server, in-memory adapter
- Vertical scaling OK

**Phase 2 (1000-10000 concurrent):**
- Multiple Socket.io servers behind load balancer
- Redis adapter (socket.io-redis) cho cross-node broadcast

**Phase 3 (> 10000 concurrent):**
- Kafka/RabbitMQ giữa services
- Sharded by namespace

### Message Format

```typescript
interface SocketMessage<T = unknown> {
  type: string;          // Discriminator
  namespace: string;     // 'groups' | 'notifications' | 'chat'
  payload: T;
  timestamp: string;     // ISO 8601
  messageId: string;     // UUID for dedup
  userId?: string;       // Sender
}

// Example
socket.emit('vote.cast', {
  type: 'vote.cast',
  namespace: 'groups',
  payload: { sessionId: 's1', value: 'ACCEPT' },
  timestamp: '2026-08-11T15:30:00Z',
  messageId: 'm-abc-123',
  userId: 'u-123',
});
```

### Group Spin Flow (Phase 1)

```
1. HOST creates group → server creates Room 'group-{groupId}'
2. Members join → emit 'member.joined'
3. HOST clicks Spin → server spins → emit 'spin.started'
4. Members see real-time wheel → emit 'spin.tick' (frame updates)
5. Result revealed → emit 'spin.complete'
6. Members vote → emit 'vote.cast' → tally → emit 'vote.result'
```

### Notification Flow

```typescript
// Events
'notification.new'           // New notification for user
'notification.read'          // User marked read (ack to server)

// Persistence: Server emit + save to DB
// Client receives → show toast/in-app banner
```

### Reconnection Strategy

Client side:
- Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
- Max 10 attempts
- After reconnect: rejoin all rooms
- Missed events: pull from REST API for last 5 minutes

### Error Handling

| Error | Action |
|-------|--------|
| Connection lost | Auto-reconnect with backoff |
| Auth expired | Re-login → reconnect |
| Server error | Show toast "Kết nối bị gián đoạn" |
| Message send fail | Queue locally, retry on reconnect |

### Rate Limiting

- 100 messages/minute/connection
- 1000 messages/hour/user
- Drop messages over limit, log warning

### Security

- WSS only (TLS)
- CORS: Only allow app domain
- Validate EVERY message at server (type + payload schema)
- Sanitize text content (XSS prevention)
- Origin check on handshake

## Implementation Plan

### Backend (Trường - 12h)

1. **Setup Socket.io server:**
   ```typescript
   // backend/src/index.ts
   const io = new SocketIOServer(httpServer, {
     cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
   });
   ```

2. **Namespaces:**
   ```typescript
   // backend/src/realtime/groups.namespace.ts
   // backend/src/realtime/notifications.namespace.ts
   ```

3. **JWT middleware**

4. **Rate limiting middleware**

### Mobile (Hoàng Hiếu + Gia Bình - 8h)

```typescript
// apps/mobile/src/lib/socket.ts
import { io } from 'socket.io-client';

export const socket = io(API_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  auth: { token: getToken() },
});
```

### Web (Hoàng Hiếu - 6h)

```typescript
// apps/web/src/lib/socket.ts (similar)
```

## Consequences

**Positive:**
- Real-time UX tốt cho group features
- Single protocol cho nhiều use cases
- Open-source, mature (no vendor lock-in)
- Easy horizontal scaling

**Negative:**
- Persistent connection expensive (memory)
- Cần sticky session khi dùng multiple servers
- Debugging harder than REST

**Risks:**
- Server crash = drop all connections - **Mitigation:** Auto-reconnect + state recovery
- Memory leak từ disconnected sockets - **Mitigation:** Heartbeat ping/pong, timeout 60s
- DDoS via WebSocket flooding - **Mitigation:** Rate limit + connection cap per IP

## Alternatives Considered

### A. Server-Sent Events (SSE)
- Pro: Simpler, one-way
- Con: One-way only (need POST for client→server)
- **Rejected:** Group spin needs bi-directional

### B. Pusher / Ably (3rd-party)
- Pro: No infra to manage
- Con: $49+/month tại scale, vendor lock-in
- **Rejected:** Cost at scale, flexibility

### C. gRPC Streaming
- Pro: Faster, type-safe
- Con: No browser native support
- **Rejected:** Browser compatibility

### D. Firebase Realtime Database
- Pro: Easy setup
- Con: $$, less control
- **Rejected:** Vendor lock-in + cost

### E. Polling (REST every 2s)
- Pro: Dead simple
- Con: Battery drain, lag, scale issues
- **Rejected:** Bad UX for real-time

## Approval

Tuấn Anh (Architect) - 2026-08-11
Reviewed: Trường, Hoàng Hiếu, Gia Bình

## References

- [Socket.io Docs](https://socket.io/docs/v4/)
- [Scaling Socket.io](https://socket.io/docs/v4/redis-adapter/)
- [WebSocket Security](https://blog.securityevaluators.com/websockets-not-bound-by-cors-555ef92f49d2)