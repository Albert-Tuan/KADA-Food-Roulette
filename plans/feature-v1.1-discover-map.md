# Feature Plan: Discover Map

## Overview
Hiển thị bản đồ với các nhà hàng gần user, cho phép filter theo cuisine và tap để xem chi tiết.

## User Stories
- US-060: Xem bản đồ với các pins nhà hàng
- US-060 Filter: Filter theo cuisine

## Architecture Decisions
- **Map SDK:** react-native-maps (iOS) + react-native-web-google-maps (web)
- **Map tiles:** OpenStreetMap (free) hoặc Google Maps (có API key)
- **Clustering:** react-native-map-clustering cho iOS
- **Geo queries:** Haversine formula (MySQL) hoặc PostGIS

---

## Task List

### Phase 1: Backend Geo API

#### Task 1: Restaurant Geo Endpoint
**Description:** Thêm endpoint để lấy restaurants gần một location

**Acceptance criteria:**
- [ ] `GET /api/restaurants/nearby?lat=X&lng=Y&radius=Z` trả về restaurants trong bán kính
- [ ] Support filter by cuisine
- [ ] Support pagination
- [ ] Return distance từ user location

**Verification:**
- [ ] Test với mock data
- [ ] Verify distance calculation

**Dependencies:** None

**Files likely touched:**
- `backend/src/modules/restaurants/restaurants.controller.ts`
- `backend/src/modules/restaurants/restaurants.service.ts`

**Estimated scope:** Medium (2-3 files)

---

### Phase 2: Mobile Map

#### Task 2: Map Screen
**Description:** Tạo screen hiển thị bản đồ với restaurant pins

**Acceptance criteria:**
- [ ] Map view chiếm full screen
- [ ] Current location marker
- [ ] Restaurant pins với clustering
- [ ] Tap pin → show callout với basic info
- [ ] Tap callout → navigate to restaurant detail

**Verification:**
- [ ] Map renders correctly
- [ ] Pins appear at correct locations
- [ ] Callout shows on tap

**Dependencies:** Task 1

**Files likely touched:**
- `apps/mobile/app/discover/index.tsx`
- `apps/mobile/src/components/RestaurantMarker.tsx`

**Estimated scope:** Medium (3-4 files)

---

#### Task 3: Filter Bottom Sheet
**Description:** Bottom sheet để filter restaurants trên map

**Acceptance criteria:**
- [ ] Cuisine filter (multi-select chips)
- [ ] Distance filter (slider)
- [ ] Price range filter
- [ ] Apply filters → update map
- [ ] Clear filters option

**Verification:**
- [ ] Filters apply correctly
- [ ] Map updates in real-time

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/src/components/MapFilterSheet.tsx`
- `apps/mobile/src/hooks/useRestaurantFilter.ts`

**Estimated scope:** Medium (2-3 files)

---

#### Task 4: List View Toggle
**Description:** Toggle giữa map view và list view

**Acceptance criteria:**
- [ ] Toggle button (map/list icon)
- [ ] List view hiển thị restaurants gần đó
- [ ] Pull to refresh
- [ ] Tap item → navigate to detail

**Verification:**
- [ ] Toggle works smoothly
- [ ] List renders correctly

**Dependencies:** Task 2

**Files likely touched:**
- `apps/mobile/app/discover/index.tsx`
- `apps/mobile/src/components/RestaurantList.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: After Tasks 1-4
- [ ] Backend geo endpoint tests pass
- [ ] Mobile map renders correctly
- [ ] Filters work as expected
- [ ] Navigation to detail works

---

### Phase 3: Web Map

#### Task 5: Web Map Component
**Description:** Map component cho web app

**Acceptance criteria:**
- [ ] Leaflet/Google Maps integration
- [ ] Restaurant markers
- [ ] Marker clustering
- [ ] Info popup on click

**Verification:**
- [ ] Map renders on web
- [ ] Markers clickable

**Dependencies:** Task 1

**Files likely touched:**
- `apps/web/src/components/RestaurantMap.tsx`
- `apps/web/src/hooks/useMap.ts`

**Estimated scope:** Medium (3-4 files)

---

#### Task 6: Web Sidebar
**Description:** Sidebar với restaurant list cho web

**Acceptance criteria:**
- [ ] Sidebar hiển thị restaurant cards
- [ ] Hover card → highlight pin on map
- [ ] Click card → zoom to pin
- [ ] Filter panel

**Verification:**
- [ ] Sidebar responsive
- [ ] Interaction with map works

**Dependencies:** Task 5

**Files likely touched:**
- `apps/web/src/components/RestaurantSidebar.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: Complete
- [ ] Mobile map complete
- [ ] Web map complete
- [ ] Integration tests pass
- [ ] Ready for review

---

## Total Effort
- Backend Geo API: 4h
- Mobile Map: 8h
- Web Map: 6h
- **Total: ~18h**

---

## Technical Notes

### Haversine Formula (MySQL fallback)
```sql
SELECT *, (
  6371 * acos(
    cos(radians(?)) * cos(radians(latitude)) *
    cos(radians(longitude) - radians(?)) +
    sin(radians(?)) * sin(radians(latitude))
  )
) AS distance
FROM Restaurant
HAVING distance < ?
ORDER BY distance
```

### PostGIS (Production)
```sql
SELECT *, ST_Distance(
  location::geography,
  ST_MakePoint(?, ?)::geography
) as distance
FROM Restaurant
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(?, ?)::geography,
  ?
)
ORDER BY distance
```

---

## Open Questions
- Dùng OpenStreetMap (free) hay Google Maps (cần API key)?
- Clustering threshold là bao nhiêu?
- Có cần direction/link tới Google Maps app không?
