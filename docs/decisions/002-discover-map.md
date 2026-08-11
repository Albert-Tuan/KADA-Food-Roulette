# ADR-002: Discover Map - Geo Query Strategy & Map SDK

## Status
Accepted - 2026-08-11

## Context

Discover Map feature cho phép user xem các quán ăn trên bản đồ xung quanh vị trí hiện tại. Cần quyết định:

1. **Geo query strategy** cho MySQL 8.0
2. **Map SDK** cho web + mobile
3. **Caching strategy** cho popular locations
4. **Rate limiting** để bảo vệ backend

## Decision

### 1. Geo Query Strategy: Haversine (Application-level)

```sql
-- MySQL 8.0 Haversine query với bounding box pre-filter
SELECT *,
  (6371 * acos(
    cos(radians(:lat)) * cos(radians(lat)) *
    cos(radians(lng) - radians(:lng)) +
    sin(radians(:lat)) * sin(radians(lat))
  )) AS distance_km
FROM restaurants
WHERE
  status = 'APPROVED'
  AND lat BETWEEN :minLat AND :maxLat
  AND lng BETWEEN :minLng AND :maxLng
HAVING distance_km <= :radiusKm
ORDER BY distance_km ASC
LIMIT 50;
```

**Rationale:**
- MySQL 8.0 không có PostGIS extension mặc định (sẽ add sau nếu cần)
- Haversine qua app code đơn giản, dễ test
- Bounding box pre-filter giúp giảm dataset trước khi tính distance
- Với dataset < 100k restaurants, performance acceptable (< 100ms)

**Indexes cần thêm:**
- `@@index([lat, lng])` compound - giúp bounding box query
- `@@index([category])` single column
- `@@index([status, source])` compound - filter approved restaurants

**Trade-offs:**
- ✅ Đơn giản, không cần extension
- ✅ Portable giữa MySQL/PostgreSQL
- ❌ Không optimal cho dataset rất lớn (> 1M rows)
- ❌ Không support complex geo queries (polygon, distance within polygon)

**Future:** Nếu scale vượt 100k restaurants, consider MySQL 8.0 spatial indexes với `POINT` column và `SPATIAL INDEX`. Hoặc migrate sang PostgreSQL + PostGIS.

### 2. Map SDK

**Web:** **Leaflet + OpenStreetMap**
- Free, no API key
- Plugin ecosystem mature (marker clustering, heatmap, drawing)
- Smaller bundle (~40KB gzipped) vs Mapbox GL (~200KB)
- Trade-off: Less polished UI vs Mapbox

**Mobile:** **react-native-maps + OpenStreetMap**
- Free, no API key (dùng UrlTile với OSM server)
- Native performance
- Trade-off: iOS + Android cần setup riêng

**NOT using Google Maps:**
- Cost: $7/1000 loads (sẽ tốn khi scale)
- Vendor lock-in
- Vietnamese POI data OSM đủ tốt cho restaurant

### 3. Caching Strategy

**Server-side cache (Redis sau, in-memory trước):**
```typescript
// Cache key: "nearby:{lat}:{lng}:{radius}:{filters}"
// TTL: 5 minutes cho user queries
// TTL: 1 hour cho popular locations

// Cache invalidation: Khi restaurant được add/update/delete
```

**Client-side cache (TanStack Query):**
- `staleTime: 5 minutes` - data "fresh" trong 5p
- `gcTime: 30 minutes` - keep in memory 30p
- User pull-to-refresh để force fetch

### 4. Rate Limiting

- 60 requests/minute/user cho geo endpoint
- 1000 requests/hour cho unauthenticated (IP-based)
- Use `express-rate-limit` middleware
- 429 response với `Retry-After` header

## Implementation Plan

### Backend (Trường - 4h)

1. **Geospatial helpers:**
```typescript
// backend/src/shared/geo.utils.ts
export const EARTH_RADIUS_KM = 6371;

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  // ... haversine formula
}

export function boundingBox(
  centerLat: number, centerLng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  // ... calculate bounds
}
```

2. **Restaurant geo endpoint:**
```
GET /api/restaurants/nearby?lat=10.762622&lng=106.660172&radius=2&category=vietnamese
```

3. **Response shape:**
```typescript
interface NearbyRestaurantsResponse {
  data: Restaurant[];
  center: { lat: number; lng: number };
  radiusKm: number;
  totalInRadius: number;
  cachedAt: string;
}
```

4. **Indexes migration:**
```prisma
model Restaurant {
  // ... existing
  @@index([lat, lng])
  @@index([category])
  @@index([status, source])
}
```

### Mobile (Gia Bình - 4h)

1. Map Screen với `react-native-maps`
2. URL tile overlay cho OpenStreetMap
3. Filter bottom sheet
4. List/Map view toggle

### Web (Hoàng Hiếu - 6h)

1. Leaflet map component
2. Marker clustering plugin
3. Restaurant info popup
4. Sidebar với list + map

## Consequences

**Positive:**
- Free map tiles (tiết kiệm $)
- Fast queries với indexes đúng
- Good UX với caching
- Predictable performance

**Negative:**
- OSM tiles chậm hơn Google ở một số region
- Haversine không chính xác 100% (sai số ~0.5%)
- Cần manual cache invalidation

**Risks:**
- OSM tile server rate limit - **Mitigation:** Cache tiles client-side
- Restaurant dataset lớn - **Mitigation:** Migration sang PostGIS sau

## Alternatives Considered

### A. Google Maps
- Pro: Best UI/UX, reliable
- Con: $7/1000 loads, vendor lock-in
- **Rejected:** Cost too high cho MVP

### B. Mapbox
- Pro: Customizable, fast
- Con: $5/1000 loads sau free tier
- **Rejected:** Cost similar to Google, OSM đủ cho MVP

### C. MySQL Spatial Indexes (POINT column)
- Pro: Optimal performance
- Con: Complex migration, schema change
- **Deferred:** Khi dataset > 100k hoặc có nhu cầu geo queries phức tạp

## References

- [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [Leaflet vs Mapbox comparison](https://docs.mapbox.com/help/getting-started/mapbox-vs-leaflet/)
- [MySQL 8.0 Spatial Data](https://dev.mysql.com/doc/refman/8.0/en/spatial-types.html)

## Approval

Tuấn Anh (Architect) - 2026-08-11
Reviewed: Trường, Hoàng Hiếu, Gia Bình