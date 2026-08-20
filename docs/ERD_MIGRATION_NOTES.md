# ERD Migration Notes

> SQL migration scripts and database trigger definitions
> **Current Version:** v5.3 (Locket likes)
> **Date:** 2026-08-20

---

## Prisma migration history

- `20260808_baseline`: canonical baseline trước các field Locket/Profile mới.
- `20260809_add_locket_media_pipeline`: media paths và normalized image metadata.
- `20260809_add_locket_profile_fields`: structured profile và Locket metadata.
- `20260820_add_locket_likes`: reaction Like theo từng user cho Locket.
- SQL bootstrap/validation thủ công nằm tại `backend/prisma/sql/v5.0/`, ngoài Prisma migration history.

---

## v5.3 — Locket likes

Migration: `backend/prisma/migrations/20260820_add_locket_likes/migration.sql`

- Thêm bảng `locket_likes` với khóa chính kép `[locket_id, user_id]` để một user không thể Like trùng.
- Foreign key tới `lockets` và `users` đều `ON DELETE CASCADE`.
- Feed/detail tính `like_count` từ dữ liệu thật và trả `is_liked` theo JWT hiện tại.
- Locket mới không có reaction nên bắt đầu với `like_count = 0`.

---

## v5.2 — Locket media pipeline

Migration: `backend/prisma/migrations/20260809_add_locket_media_pipeline/migration.sql`

- `image_url` lưu object path của ảnh JPEG gốc đã chuẩn hóa trong bucket `lockets`.
- Thêm `thumbnail_url` để lưu object path thumbnail.
- Thêm `image_width`, `image_height`, `image_bytes`, `thumbnail_bytes` để audit output từ Sharp.
- Object path: `lockets/{userId}/{locketId}/{original,thumbnail}.jpg`.
- Bucket luôn private: `PRIVATE`/`FRIENDS` dùng signed URL 1 giờ; `PUBLIC` đi qua Express media endpoint và revalidate visibility từ Prisma.

---

## v5.1 — Locket + Profile structured fields

Migration: `backend/prisma/migrations/20260809_add_locket_profile_fields/migration.sql`

- `users.bio`: `VARCHAR(160) NULL`.
- `lockets`: thêm `dish_name`, `restaurant_name`, `note`, `rating`, `tags`, `updated_at`, `deleted_at`.
- `20260811_simplify_taste_board` đổi `dish_name` về nullable; dữ liệu metadata cũ được giữ để tương thích API nhưng không còn dùng trong UI Taste Board.
- Thêm check constraint `rating` trong khoảng 1–5 và index cho soft delete.
- `exif_stripped` chỉ là `TRUE` cho ảnh đã được Sharp re-encode server-side.

---

## Quick Start (v5.0)

```bash
# 1. Create database
mysql -u root -p < backend/prisma/sql/v5.0/000_create_database.sql

# 2. Create tables
mysql -u root -p food_roulette < backend/prisma/sql/v5.0/complete_schema.sql

# 3. Seed test data
mysql -u root -p food_roulette < backend/prisma/sql/v5.0/seed_data.sql
```

---

## Legacy Migrations (v2.x - v4.x)

> SQL migration scripts and database trigger definitions for ERD v3.0 (4NF Normalized)

---

## P0 - Critical (MVP)

### P0.1: SpinLog - Separate FK Columns

Replace polymorphic `referenceId` with separate nullable FK columns.

```sql
-- Add new columns
ALTER TABLE "SpinLog" 
  ADD COLUMN "purchaseId" UUID NULL,
  ADD COLUMN "adWatchLogId" UUID NULL,
  ADD COLUMN "giftId" UUID NULL,
  ADD COLUMN "referralId" UUID NULL;

-- Add FK constraints
ALTER TABLE "SpinLog" 
  ADD CONSTRAINT "fk_spinlog_purchase"
    FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id")
    ON DELETE SET NULL;

ALTER TABLE "SpinLog" 
  ADD CONSTRAINT "fk_spinlog_adwatchlog"
    FOREIGN KEY ("adWatchLogId") REFERENCES "AdWatchLog"("id")
    ON DELETE SET NULL;

ALTER TABLE "SpinLog" 
  ADD CONSTRAINT "fk_spinlog_gift"
    FOREIGN KEY ("giftId") REFERENCES "Gift"("id")
    ON DELETE SET NULL;

ALTER TABLE "SpinLog" 
  ADD CONSTRAINT "fk_spinlog_referral"
    FOREIGN KEY ("referralId") REFERENCES "Referral"("id")
    ON DELETE SET NULL;

-- Drop polymorphic columns (after data migration)
-- NOTE: Migrate existing data first!
-- UPDATE "SpinLog" SET "purchaseId" = "referenceId" WHERE "referenceType" = 'PURCHASE';
-- UPDATE "SpinLog" SET "adWatchLogId" = "referenceId" WHERE "referenceType" = 'AD_WATCH';
-- etc.

ALTER TABLE "SpinLog" 
  DROP COLUMN "referenceType",
  DROP COLUMN "referenceId";
```

---

### P0.2: RestaurantVisit - Fix Partner Paradox

Make `partnerId` nullable for corporate visits.

```sql
-- Make partnerId nullable
ALTER TABLE "RestaurantVisit" 
  ALTER COLUMN "partnerId" DROP NOT NULL;

-- Add CHECK constraint for consistency
ALTER TABLE "RestaurantVisit"
  ADD CONSTRAINT "chk_partner_consistency"
  CHECK (
    ("partnerId" IS NOT NULL AND "partnerType" = 'RESTAURANT') OR
    ("partnerId" IS NULL AND "partnerType" = 'CORPORATE')
  );

-- Add partnerType column if not exists
ALTER TABLE "RestaurantVisit"
  ADD COLUMN "partnerType" ENUM('RESTAURANT', 'CORPORATE') NULL;
```

---

### P0.3: Group.hostId - Membership Enforcement

Add application-level or trigger-based enforcement.

```sql
-- Option A: Trigger (PostgreSQL)
CREATE OR REPLACE FUNCTION check_host_is_member()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "GroupMember" 
    WHERE "groupId" = NEW.id 
    AND "userId" = NEW."hostId" 
    AND status = 'ACCEPTED'
  ) THEN
    RAISE EXCEPTION 'Group host must be a member with ACCEPTED status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_host_is_member
  BEFORE INSERT OR UPDATE ON "Group"
  FOR EACH ROW EXECUTE FUNCTION check_host_is_member();

-- Option B: Application Layer (Recommended)
-- Validate in API/service layer before insert/update
```

---

### P0.4: SpinWallet - Balance Trigger

Add trigger to enforce non-negative balance.

```sql
-- PostgreSQL Trigger
CREATE OR REPLACE FUNCTION prevent_negative_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'Balance cannot be negative (userId: %)', NEW."userId";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_balance_not_negative
  BEFORE UPDATE ON "SpinWallet"
  FOR EACH ROW EXECUTE FUNCTION prevent_negative_balance();

-- Also check on INSERT
CREATE TRIGGER trg_balance_insert_check
  BEFORE INSERT ON "SpinWallet"
  FOR EACH ROW EXECUTE FUNCTION prevent_negative_balance();
```

---

### P0.5: Add Missing Audit Fields

```sql
-- Friendship
ALTER TABLE "Friendship" ADD COLUMN "updatedAt" DATETIME NULL;
CREATE INDEX "idx_friendship_updated" ON "Friendship"("updatedAt");

-- GroupMember
ALTER TABLE "GroupMember" ADD COLUMN "updatedAt" DATETIME NULL;
CREATE INDEX "idx_groupmember_updated" ON "GroupMember"("updatedAt");

-- Vote
ALTER TABLE "Vote" ADD COLUMN "updatedAt" DATETIME NULL;
CREATE INDEX "idx_vote_updated" ON "Vote"("updatedAt");

-- CheckIn
ALTER TABLE "CheckIn" ADD COLUMN "createdAt" DATETIME NOT NULL DEFAULT NOW();
ALTER TABLE "CheckIn" ADD COLUMN "updatedAt" DATETIME NULL;
CREATE INDEX "idx_checkin_created" ON "CheckIn"("createdAt");

-- Review
ALTER TABLE "Review" ADD COLUMN "updatedAt" DATETIME NULL;
CREATE INDEX "idx_review_updated" ON "Review"("updatedAt");

-- Commitment
ALTER TABLE "Commitment" ADD COLUMN "updatedAt" DATETIME NULL;
ALTER TABLE "Commitment" ADD COLUMN "completedAt" DATETIME NULL;
ALTER TABLE "Commitment" ADD COLUMN "brokenAt" DATETIME NULL;

-- AdWatchLog
ALTER TABLE "AdWatchLog" ADD COLUMN "updatedAt" DATETIME NULL;
```

---

## P1 - Before Production

### P1.1: Missing Indexes

```sql
-- CheckIn indexes
CREATE INDEX "idx_checkin_user_created" ON "CheckIn"("userId", "createdAt");

-- Review indexes
CREATE INDEX "idx_review_user_created" ON "Review"("userId", "createdAt");

-- Locket indexes
CREATE INDEX "idx_locket_user_captured" ON "Locket"("userId", "capturedAt");

-- Restaurant indexes
CREATE INDEX "idx_restaurant_status_category" ON "Restaurant"("status", "category");

-- GroupMember indexes
CREATE INDEX "idx_groupmember_group_status" ON "GroupMember"("groupId", "status");

-- SpinSession indexes
CREATE INDEX "idx_spinsession_initiator" ON "SpinSession"("initiatorId");
```

---

### P1.2: CheckIn Verification Enhancement

```sql
ALTER TABLE "CheckIn" 
  ADD COLUMN "verifiedAt" DATETIME NULL,
  ADD COLUMN "verificationMethod" ENUM('GPS_ONLY', 'GPS_PLUS_LOCKET', 'MANUAL') NULL;

-- Update existing records
UPDATE "CheckIn" SET "verifiedAt" = NOW() WHERE verified = TRUE;
UPDATE "CheckIn" SET "verificationMethod" = 'GPS_ONLY' WHERE verified = TRUE;
```

---

### P1.3: AdWatchLog.watchDate

```sql
ALTER TABLE "AdWatchLog" 
  ADD COLUMN "watchDate" DATE NOT NULL DEFAULT CURRENT_DATE;

-- Backfill from watchedAt
UPDATE "AdWatchLog" SET "watchDate" = DATE("watchedAt");

-- Update trigger for new records
CREATE OR REPLACE FUNCTION set_watch_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW."watchDate" := DATE(NEW."watchedAt");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_watch_date
  BEFORE INSERT ON "AdWatchLog"
  FOR EACH ROW EXECUTE FUNCTION set_watch_date();

-- Replace old index
DROP INDEX "idx_adwatchlog_user_dailycap";
CREATE INDEX "idx_adwatchlog_user_watchdate" ON "AdWatchLog"("userId", "watchDate");
```

---

### P1.4: User.passwordHash Documentation

```sql
-- Rename column for clarity
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";

-- Note: Use bcrypt with cost factor 12 or argon2
-- Hashing should happen at application layer
-- Never store plain text passwords

-- Add password version for session invalidation (optional P2)
ALTER TABLE "User" ADD COLUMN "passwordVersion" INT DEFAULT 1;
ALTER TABLE "User" ADD COLUMN "passwordChangedAt" DATETIME NULL;
```

---

### P1.5: TasteBoardItem Locket Ownership

```sql
-- Application-level validation required
-- When inserting TasteBoardItem with locketId:
-- 1. Verify locket.userId matches tasteBoard.ownerId
-- 2. Return error if not matching

-- Example validation query:
SELECT 1 FROM "Locket" l
JOIN "TasteBoard" tb ON l."userId" = tb."ownerId"
WHERE l.id = @locketId AND tb.id = @boardId
```

---

## P2 - Technical Debt

### P2.1: SpinSessionCandidate Junction Table

```sql
CREATE TABLE "SpinSessionCandidate" (
  "spinSessionId" UUID NOT NULL REFERENCES "SpinSession"("id") ON DELETE CASCADE,
  "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "addedAt" DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("spinSessionId", "restaurantId")
);

CREATE INDEX "idx_ssc_session" ON "SpinSessionCandidate"("spinSessionId");
CREATE INDEX "idx_ssc_restaurant" ON "SpinSessionCandidate"("restaurantId");

-- Migration: Convert JSON candidates to junction table
-- Do this in application layer with batch processing
```

---

### P2.2: RestaurantRatingSummary (Denormalization)

```sql
CREATE TABLE "RestaurantRatingSummary" (
  "restaurantId" UUID PRIMARY KEY REFERENCES "Restaurant"("id") ON DELETE CASCADE,
  "avgRating" FLOAT NOT NULL DEFAULT 0,
  "totalReviews" INT NOT NULL DEFAULT 0,
  "updatedAt" DATETIME NOT NULL DEFAULT NOW()
);

-- Populate initial data
INSERT INTO "RestaurantRatingSummary" ("restaurantId", "avgRating", "totalReviews")
SELECT 
  "restaurantId",
  AVG(rating)::FLOAT,
  COUNT(*)
FROM "Review"
GROUP BY "restaurantId";

-- Create trigger to update on new review
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE "RestaurantRatingSummary"
    SET 
      "avgRating" = (
        SELECT AVG(rating)::FLOAT 
        FROM "Review" 
        WHERE "restaurantId" = NEW."restaurantId"
      ),
      "totalReviews" = (
        SELECT COUNT(*) 
        FROM "Review" 
        WHERE "restaurantId" = NEW."restaurantId"
      ),
      "updatedAt" = NOW()
    WHERE "restaurantId" = NEW."restaurantId";
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE "RestaurantRatingSummary"
    SET 
      "avgRating" = COALESCE((
        SELECT AVG(rating)::FLOAT 
        FROM "Review" 
        WHERE "restaurantId" = OLD."restaurantId"
      ), 0),
      "totalReviews" = (
        SELECT COUNT(*) 
        FROM "Review" 
        WHERE "restaurantId" = OLD."restaurantId"
      ),
      "updatedAt" = NOW()
    WHERE "restaurantId" = OLD."restaurantId";
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating_summary
  AFTER INSERT OR DELETE ON "Review"
  FOR EACH ROW EXECUTE FUNCTION update_restaurant_rating();
```

---

### P2.3: Partitioning Strategy

```sql
-- Locket partitioning by month
CREATE TABLE "Locket" (
  -- ... existing columns ...
) PARTITION BY RANGE ("capturedAt");

CREATE TABLE "Locket_2024_01" PARTITION OF "Locket"
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE "Locket_2024_02" PARTITION OF "Locket"
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for each month ...

-- CheckIn partitioning by month
CREATE TABLE "CheckIn" (
  -- ... existing columns ...
) PARTITION BY RANGE ("createdAt");

-- Review partitioning by hash (for even distribution)
CREATE TABLE "Review" (
  -- ... existing columns ...
) PARTITION BY HASH ("restaurantId");
CREATE TABLE "Review_partition_0" PARTITION OF "Review"
  FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE "Review_partition_1" PARTITION OF "Review"
  FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE "Review_partition_2" PARTITION OF "Review"
  FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE "Review_partition_3" PARTITION OF "Review"
  FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- SpinLog partitioning by month
CREATE TABLE "SpinLog" (
  -- ... existing columns ...
) PARTITION BY RANGE ("createdAt");

-- AdWatchLog partitioning by day
CREATE TABLE "AdWatchLog" (
  -- ... existing columns ...
) PARTITION BY RANGE ("watchedAt");
CREATE TABLE "AdWatchLog_2024_01_01" PARTITION OF "AdWatchLog"
  FOR VALUES FROM ('2024-01-01') TO ('2024-01-02');
-- ... daily partitions for active period ...
```

---

### P2.4: CorporateMember Status Field

```sql
ALTER TABLE "CorporateMember" 
  ADD COLUMN "status" ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE';

-- Update existing records
UPDATE "CorporateMember" 
SET "status" = 'ACTIVE' 
WHERE "leftAt" IS NULL;

UPDATE "CorporateMember" 
SET "status" = 'INACTIVE' 
WHERE "leftAt" IS NOT NULL;

-- Create trigger to sync status with leftAt
CREATE OR REPLACE FUNCTION sync_member_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."leftAt" IS NOT NULL AND OLD."leftAt" IS NULL THEN
    NEW."status" := 'INACTIVE';
  ELSIF NEW."leftAt" IS NULL AND OLD."leftAt" IS NOT NULL THEN
    NEW."status" := 'ACTIVE';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_member_status
  BEFORE UPDATE ON "CorporateMember"
  FOR EACH ROW EXECUTE FUNCTION sync_member_status();
```

---

## Rollback Scripts

### Rollback P0.1: Restore Polymorphic FK

```sql
-- Restore polymorphic columns
ALTER TABLE "SpinLog" 
  ADD COLUMN "referenceType" ENUM('PURCHASE', 'AD_WATCH', 'GIFT', 'REFERRAL') NULL,
  ADD COLUMN "referenceId" UUID NULL;

-- Migrate data back
UPDATE "SpinLog" SET "referenceType" = 'PURCHASE', "referenceId" = "purchaseId" WHERE "purchaseId" IS NOT NULL;
UPDATE "SpinLog" SET "referenceType" = 'AD_WATCH', "referenceId" = "adWatchLogId" WHERE "adWatchLogId" IS NOT NULL;
UPDATE "SpinLog" SET "referenceType" = 'GIFT', "referenceId" = "giftId" WHERE "giftId" IS NOT NULL;
UPDATE "SpinLog" SET "referenceType" = 'REFERRAL', "referenceId" = "referralId" WHERE "referralId" IS NOT NULL;

-- Drop separate FKs
ALTER TABLE "SpinLog" DROP CONSTRAINT IF EXISTS "fk_spinlog_purchase";
ALTER TABLE "SpinLog" DROP CONSTRAINT IF EXISTS "fk_spinlog_adwatchlog";
ALTER TABLE "SpinLog" DROP CONSTRAINT IF EXISTS "fk_spinlog_gift";
ALTER TABLE "SpinLog" DROP CONSTRAINT IF EXISTS "fk_spinlog_referral";

ALTER TABLE "SpinLog" DROP COLUMN "purchaseId";
ALTER TABLE "SpinLog" DROP COLUMN "adWatchLogId";
ALTER TABLE "SpinLog" DROP COLUMN "giftId";
ALTER TABLE "SpinLog" DROP COLUMN "referralId";
```

---

## Testing Checklist

After each migration:

- [ ] Verify all new columns exist with correct types
- [ ] Test FK constraints with valid and invalid data
- [ ] Verify triggers fire correctly
- [ ] Check index performance with EXPLAIN
- [ ] Test application integration
- [ ] Verify rollback scripts work (staging only)

---

*Document Version: 1.1 | ERD: v3.0 (4NF Normalized) | Date: 2026-08-06*

---

## P0.5: Restaurant - 4NF Normalization (v3.0)

Extract `openingHours` JSON and `photos` JSON to separate tables.

### Migration Steps

```sql
-- ============================================
-- PHASE 1: Create new tables
-- ============================================

-- Create RestaurantHours table
CREATE TABLE "RestaurantHours" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "restaurantId" UUID NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  "dayOfWeek" INT NOT NULL CHECK ("dayOfWeek" BETWEEN 0 AND 6),
  "openTime" TIME NULL,
  "closeTime" TIME NULL,
  "isClosed" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("restaurantId", "dayOfWeek")
);

CREATE INDEX idx_restaurant_hours_restaurant ON "RestaurantHours"("restaurantId");

-- Create RestaurantPhoto table
CREATE TABLE "RestaurantPhoto" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "restaurantId" UUID NOT NULL REFERENCES "Restaurant"(id) ON DELETE CASCADE,
  "photoUrl" VARCHAR(500) NOT NULL,
  "displayOrder" INT DEFAULT 0,
  "caption" VARCHAR(255),
  "uploadedBy" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("restaurantId", "photoUrl")
);

CREATE INDEX idx_restaurant_photo_order ON "RestaurantPhoto"("restaurantId", "displayOrder");
```

### Migration Steps (continued)

```sql
-- ============================================
-- PHASE 2: Migrate openingHours data
-- ============================================

-- PostgreSQL: Migrate JSON openingHours to RestaurantHours
INSERT INTO "RestaurantHours" ("restaurantId", "dayOfWeek", "openTime", "closeTime", "isClosed")
SELECT 
  id AS "restaurantId",
  (data->>'day')::INT AS "dayOfWeek",
  (data->>'open')::TIME AS "openTime",
  (data->>'close')::TIME AS "closeTime",
  COALESCE((data->>'closed')::BOOLEAN, FALSE) AS "isClosed"
FROM "Restaurant", 
     jsonb_array_elements("openingHours") WITH ORDINALITY AS arr(data, ordinality)
WHERE "openingHours" IS NOT NULL;

-- ============================================
-- PHASE 3: Migrate photos data
-- ============================================

-- PostgreSQL: Migrate JSON photos to RestaurantPhoto
INSERT INTO "RestaurantPhoto" ("restaurantId", "photoUrl", "displayOrder", "caption")
SELECT 
  id AS "restaurantId",
  (p->>'url')::VARCHAR(500) AS "photoUrl",
  COALESCE((p->>'order')::INT, 0) AS "displayOrder",
  p->>'caption' AS "caption"
FROM "Restaurant", 
     jsonb_array_elements(photos) WITH ORDINALITY AS arr(p, ordinality)
WHERE photos IS NOT NULL;
```

### Migration Steps (continued)

```sql
-- ============================================
-- PHASE 4: Drop JSON columns from Restaurant
-- ============================================

-- WARNING: Ensure all data is migrated before dropping!

-- Option A: PostgreSQL
ALTER TABLE "Restaurant" 
  DROP COLUMN IF EXISTS "openingHours",
  DROP COLUMN IF EXISTS "photos";

-- Option B: MySQL (if using MySQL)
-- ALTER TABLE `Restaurant` 
--   DROP COLUMN `openingHours`,
--   DROP COLUMN `photos`;

-- ============================================
-- PHASE 5: Update application code
-- ============================================

-- Update Restaurant model to remove openingHours and photos fields
-- Add RestaurantHours and RestaurantPhoto models
-- Update API endpoints to query separate tables
```

### Rollback Script

```sql
-- ============================================
-- ROLLBACK: Restore JSON columns
-- ============================================

-- Add columns back
ALTER TABLE "Restaurant" 
  ADD COLUMN "openingHours" JSON NULL,
  ADD COLUMN "photos" JSON NULL;

-- Restore openingHours data
WITH hours_data AS (
  SELECT 
    "restaurantId",
    jsonb_agg(
      jsonb_build_object(
        'day', "dayOfWeek",
        'open', "openTime"::TEXT,
        'close', "closeTime"::TEXT,
        'closed', "isClosed"
      ) ORDER BY "dayOfWeek"
    ) AS hours
  FROM "RestaurantHours"
  GROUP BY "restaurantId"
)
UPDATE "Restaurant" r
SET "openingHours" = h.hours
FROM hours_data h
WHERE r.id = h."restaurantId";

-- Restore photos data
WITH photos_data AS (
  SELECT 
    "restaurantId",
    jsonb_agg(
      jsonb_build_object(
        'url', "photoUrl",
        'order', "displayOrder",
        'caption', "caption"
      ) ORDER BY "displayOrder"
    ) AS photo_list
  FROM "RestaurantPhoto"
  GROUP BY "restaurantId"
)
UPDATE "Restaurant" r
SET photos = p.photo_list
FROM photos_data p
WHERE r.id = p."restaurantId";

-- Drop migrated tables (WARNING: Data loss!)
DROP TABLE IF EXISTS "RestaurantPhoto";
DROP TABLE IF EXISTS "RestaurantHours";
```

### 4NF Explanation

| Multi-Valued Dependency | Before (JSON) | After (Normalized) |
|-------------------------|---------------|-------------------|
| `Restaurant →→ dayOfWeek` | Multiple days in one JSON | One row per day |
| `Restaurant →→ photoUrl` | Multiple photos in one JSON | One row per photo |
| Query by day | Requires JSON parsing | Direct WHERE clause |
| Order photos | Re-sort entire JSON | Update displayOrder |
| Index on day | Full table scan | B-tree index |

---

## v5.1 Locket/Profile Field Additions (2026-08-10)

### Summary
Added missing fields to `Locket` model for content storage and user profile `bio` field.

### Changes

#### Locket table
| Field | Type | Description |
|-------|------|-------------|
| `thumbnail_url` | VARCHAR(500) NULL | Thumbnail image URL |
| `dish_name` | VARCHAR(200) NULL | Dish/food name |
| `note` | TEXT NULL | User note/caption |
| `rating` | SMALLINT NULL | Rating 1-5 (CHECK constraint) |
| `tags` | JSON NULL | Array of tag strings |
| `group_id` | VARCHAR(36) NULL | Group association |
| `status` | ENUM('ACTIVE','REMOVED','REPORTED') | Soft delete support |
| `updated_at` | TIMESTAMP | Auto-updated timestamp |

#### Users table
| Field | Type | Description |
|-------|------|-------------|
| `bio` | VARCHAR(500) NULL | User biography |

### New API Endpoints

#### Profile
- `GET /api/v1/profile/me` - Get own profile (auth required)
- `PATCH /api/v1/profile` - Update profile (auth required)
- `GET /api/v1/profiles/:publicId` - Get public profile

#### Locket (updated)
- `POST /api/v1/lockets` - Create locket (real Prisma, was mock)
- `GET /api/v1/lockets/feed` - Feed with visibility filtering
- `GET /api/v1/lockets/me` - My lockets
- `GET /api/v1/lockets/:id` - Get by ID with visibility check
- `PATCH /api/v1/lockets/:id` - Update (owner only)
- `DELETE /api/v1/lockets/:id` - Soft delete (owner only)

### Authorization
- Visibility-based access control (PRIVATE/FRIENDS/PUBLIC)
- Owner-only enforcement for update/delete
- Public profile excludes `displayNamePrivate` and `email`

### Migration File
- Legacy reference: `backend/prisma/sql/main-merge/v5.1_locket_profile/001_add_locket_fields.sql`

---

*Document Version: 1.1 | ERD: v3.0 (4NF Normalized) | Date: 2026-08-06*

---

## v5.2 Friendship & Notification APIs (2026-08-10)

### Summary
Added dedicated Friendship Management API (`/api/v1/friends`) and Notification System (`/api/v1/notifications`).

### Database Changes
- Added `notifications` table (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `created_at`)
- Added `NotificationType` ENUM (`FRIEND_REQUEST`, `FRIEND_ACCEPTED`, `GROUP_INVITE`, `LOCKET_NEW`, `SYSTEM`)

### New API Endpoints

#### Friendship APIs (`/api/v1/friends`)
- `POST /api/v1/friends/request` - Send friend request (by `targetPublicId` or `addresseeId`)
- `POST /api/v1/friends/:friendshipId/accept` - Accept friend request
- `POST /api/v1/friends/:friendshipId/reject` - Reject friend request
- `DELETE /api/v1/friends/:friendshipId` - Unfriend / Remove request
- `GET /api/v1/friends` - Get list of accepted friends
- `GET /api/v1/friends/pending` - Get list of pending incoming & outgoing requests

#### Notification APIs (`/api/v1/notifications`)
- `GET /api/v1/notifications` - Get user notifications (paginated)
- `GET /api/v1/notifications/unread-count` - Get count of unread notifications
- `PATCH /api/v1/notifications/:id/read` - Mark single notification as read
- `PATCH /api/v1/notifications/read-all` - Mark all notifications as read

### Migration File
- Legacy reference: `backend/prisma/sql/main-merge/v5.2_friends_notifications/001_add_notifications.sql`
- Canonical Prisma migration: `backend/prisma/migrations/20260810131814_add_main_modules/migration.sql`
