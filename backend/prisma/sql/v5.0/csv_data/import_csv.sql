-- ============================================================
-- Food Roulette v5.0 - CSV Import Script
-- Use this to import CSV files into MySQL
-- v5.0 | 2026-08-06
-- ============================================================

-- Set path to CSV files (adjust for your environment)
SET @csv_path = 'D:/1_Project/AI-FullStack/KADA-Food-Roulette/backend/prisma/sql/v5.0/csv_data/';

-- ============================================================
-- 1. Import Users
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '001_users.csv')
INTO TABLE users
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, email, password_hash, password_version, display_name_private, display_name_public, public_id, avatar_url, phone, role, subscription_tier, is_onboarded, last_active_at, saved_restaurants, created_at, updated_at, deleted_at);

-- ============================================================
-- 2. Import Restaurants
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '002_restaurants.csv')
INTO TABLE restaurants
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name, address, lat, lng, source, category, price_level, rating, phone, status, created_at, updated_at, deleted_at);

-- ============================================================
-- 3. Import Spin Packs
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '003_spin_packs.csv')
INTO TABLE spin_packs
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name, description, spins_count, price_usd, is_active, created_at);

-- ============================================================
-- 4. Import Spin Groups
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '004_groups.csv')
INTO TABLE spin_groups
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, name, creator_id, invite_code, status, max_members, created_at, updated_at, ended_at);

-- ============================================================
-- 5. Import Group Members
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '005_group_members.csv')
INTO TABLE group_members
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, group_id, user_id, status, role, joined_at, updated_at);

-- ============================================================
-- 6. Import Friendships
-- ============================================================
LOAD DATA INFILE CONCAT(@csv_path, '006_friendships.csv')
INTO TABLE friendships
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, requester_id, addressee_id, status, created_at, updated_at);

SELECT '✅ CSV data imported successfully!' AS result;
