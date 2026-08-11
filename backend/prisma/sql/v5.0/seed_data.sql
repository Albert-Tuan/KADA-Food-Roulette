-- ============================================================
-- Food Roulette v5.0 - SEED DATA
-- Purpose: Sample data for testing queries
-- v5.0 | 2026-08-06
-- ============================================================

USE food_roulette;

-- Clear data (respect FK order)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE check_ins;
TRUNCATE TABLE votes;
TRUNCATE TABLE lockets;
TRUNCATE TABLE spin_sessions;
TRUNCATE TABLE group_members;
TRUNCATE TABLE spin_groups;
TRUNCATE TABLE spin_wallets;
TRUNCATE TABLE restaurant_hours;
TRUNCATE TABLE restaurant_photos;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE friendships;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Disable FK checks for seeding
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- USERS (5 users)
-- ============================================================
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role, subscription_tier, is_onboarded) VALUES
('11111111-1111-1111-1111-111111111111', 'an@gmail.com',         '$2a$10$hash1', 'An Nguyễn',   'an_foodie',    'an001', 'USER',  'FREE',    TRUE),
('22222222-2222-2222-2222-222222222222', 'binh@gmail.com',       '$2a$10$hash2', 'Bình Trần',   'binh_eats',    'binh2', 'USER',  'PREMIUM', TRUE),
('33333333-3333-3333-3333-333333333333', 'chi@gmail.com',        '$2a$10$hash3', 'Chi Lê',      'chi_reviews',  'chi03', 'USER',  'FREE',    TRUE),
('44444444-4444-4444-4444-444444444444', 'duong@gmail.com',      '$2a$10$hash4', 'Dương Phạm',  'duong_tasty',  'duong4', 'USER',  'FREE',    TRUE),
('55555555-5555-5555-5555-555555555555', 'steward@foodroulette', '$2a$10$hash5', ' steward',    'official',     'stw01', 'STEWARD','PREMIUM', TRUE);

-- ============================================================
-- FRIENDSHIPS
-- ============================================================
INSERT INTO friendships (id, requester_id, addressee_id, status) VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ACCEPTED'),
('aaaa2222-aaaa-2222-aaaa-222222222222', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ACCEPTED'),
('aaaa3333-aaaa-3333-aaaa-333333333333', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'ACCEPTED');

-- ============================================================
-- RESTAURANTS (10 quán ở TP.HCM khu vực Q1, Q3)
-- ============================================================
INSERT INTO restaurants (id, name, address, lat, lng, source, category, price_level, rating, google_place_id, status) VALUES
('rest0001-0000-0000-0000-000000000001', 'Phở Hòa Pasteur',     '260C Pasteur, Q1',  10.7860, 106.6910, 'USER_SUBMITTED', 'Phở',          1, 4.5, NULL,                'APPROVED'),
('rest0001-0000-0000-0000-000000000002', 'Bún chả Hà Nội',      '57 Phan Chu Trinh', 10.7720, 106.6990, 'GOOGLE_PLACES',  'Bún',          1, 4.2, 'GPLACE001',         'APPROVED'),
('rest0001-0000-0000-0000-000000000003', 'Cơm tấm Sài Gòn',     '109 Nguyễn Trãi',   10.7690, 106.6930, 'USER_SUBMITTED', 'Cơm',          1, 4.7, NULL,                'APPROVED'),
('rest0001-0000-0000-0000-000000000004', 'Bò kho Mai',           '85 Bùi Viện',       10.7660, 106.6950, 'GOOGLE_PLACES',  'Bò kho',       2, 4.0, 'GPLACE004',         'APPROVED'),
('rest0001-0000-0000-0000-000000000005', 'Lẩu Thái Lan',        '12 Đồng Khởi',     10.7740, 106.7050, 'GOOGLE_PLACES',  'Lẩu',          3, 4.3, 'GPLACE005',         'APPROVED'),
('rest0001-0000-0000-0000-000000000006', 'Pizza Ý',              '20 Nguyễn Huệ',     10.7720, 106.7030, 'USER_SUBMITTED', 'Pizza',        3, 4.1, NULL,                'APPROVED'),
('rest0001-0000-0000-0000-000000000007', 'Bánh mì Huỳnh Thúc',  '57 Nguyễn Văn Cừ', 10.7620, 106.7150, 'USER_SUBMITTED', 'Bánh mì',      1, 4.8, NULL,                'APPROVED'),
('rest0001-0000-0000-0000-000000000008', 'Sushi Nhật Bản',      '30 Lê Lợi',         10.7720, 106.7000, 'GOOGLE_PLACES',  'Sushi',        4, 4.6, 'GPLACE008',         'APPROVED'),
('rest0001-0000-0000-0000-000000000009', 'Cà phê Highlands',    '1 Võ Văn Tần',      10.7740, 106.6980, 'GOOGLE_PLACES',  'Cà phê',       2, 4.4, 'GPLACE009',         'APPROVED'),
('rest0001-0000-0000-0000-000000000010', 'New Cafe pending',    '50 Test Street',     10.7700, 106.7000, 'USER_SUBMITTED', 'Cà phê',       2, NULL, NULL,               'PENDING');

-- ============================================================
-- RESTAURANT HOURS (Mon-Sun for all restaurants)
-- ============================================================
INSERT INTO restaurant_hours (restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
('rest0001-0000-0000-0000-000000000001', 1, '06:00:00', '22:00:00', FALSE),
('rest0001-0000-0000-0000-000000000001', 2, '06:00:00', '22:00:00', FALSE),
('rest0001-0000-0000-0000-000000000001', 3, '06:00:00', '22:00:00', FALSE),
('rest0001-0000-0000-0000-000000000001', 0, '06:00:00', '22:00:00', FALSE),
('rest0001-0000-0000-0000-000000000002', 1, '07:00:00', '21:00:00', FALSE),
('rest0001-0000-0000-0000-000000000002', 2, '07:00:00', '21:00:00', FALSE),
('rest0001-0000-0000-0000-000000000005', 5, '17:00:00', '23:30:00', FALSE),
('rest0001-0000-0000-0000-000000000005', 6, '17:00:00', '23:30:00', FALSE),
('rest0001-0000-0000-0000-000000000009', 1, '07:00:00', '23:00:00', FALSE);

-- ============================================================
-- SPIN GROUPS
-- ============================================================
INSERT INTO spin_groups (id, name, creator_id, max_members, invite_code, status) VALUES
('group001-0000-0000-0000-000000000001', 'Ăn trưa công ty', '11111111-1111-1111-1111-111111111111', 20, 'ABC123', 'WAITING');

INSERT INTO group_members (group_id, user_id, role, status, joined_at) VALUES
('group001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'CREATOR', 'ACCEPTED', NOW()),
('group001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'MEMBER', 'ACCEPTED', NOW()),
('group001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'MEMBER', 'ACCEPTED', NOW()),
('group001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'MEMBER', 'PENDING',  NOW());

-- ============================================================
-- SPIN WALLETS
-- ============================================================
INSERT INTO spin_wallets (user_id, balance, purchased_spins, total_spins) VALUES
('11111111-1111-1111-1111-111111111111', 50, 0, 60),
('22222222-2222-2222-2222-222222222222', 100, 0, 120),
('33333333-3333-3333-3333-333333333333', 30, 0, 30),
('44444444-4444-4444-4444-444444444444', 20, 0, 30);

-- ============================================================
-- SPIN SESSIONS
-- Note: group_id NULL = personal spin, user_id NULL = group spin
-- ============================================================
INSERT INTO spin_sessions (id, group_id, user_id, creator_id, selected_restaurant_id, type, status, is_final, completed_at) VALUES
('sess001-0000-0000-0000000000001', NULL, '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000001', 'PERSONAL', 'COMPLETED', TRUE,  NOW()),
('sess002-0000-0000-0000000000002', NULL, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000002', 'PERSONAL', 'COMPLETED', TRUE,  NOW()),
('sess003-0000-0000-0000000000003', 'group001-0000-0000-0000-000000000001', NULL, '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000005', 'GROUP',    'VOTING',    FALSE, NULL),
('sess004-0000-0000-0000000000004', 'group001-0000-0000-0000-000000000001', NULL, '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000008', 'GROUP',    'COMPLETED', TRUE,  NOW()),
('sess005-0000-0000-0000000000005', 'group001-0000-0000-0000-000000000001', NULL, '11111111-1111-1111-1111-111111111111', NULL,                                       'GROUP',    'CANCELLED', FALSE, NULL);

-- ============================================================
-- VOTES
-- Note: restaurant_id is REQUIRED - the vote is for a specific restaurant
-- ============================================================
INSERT INTO votes (session_id, voter_id, restaurant_id, vote_type) VALUES
('sess003-0000-0000-0000000000003', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000005', 'ACCEPT'),
('sess003-0000-0000-0000000000003', '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000005', 'ACCEPT'),
('sess003-0000-0000-0000000000003', '33333333-3333-3333-3333-333333333333', 'rest0001-0000-0000-0000-000000000005', 'REJECT'),
('sess004-0000-0000-0000000000004', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000008', 'ACCEPT'),
('sess004-0000-0000-0000000000004', '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000008', 'ACCEPT');

-- ============================================================
-- LOCKETS
-- ============================================================
INSERT INTO lockets (id, user_id, restaurant_id, image_url, caption, visibility, captured_at, device_hash) VALUES
('locket01-0000-0000000000001', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000001', 'https://cdn.test/locket1.jpg', 'Bún bò ngon quá!',           'PUBLIC',  NOW(), 'dev_hash_001'),
('locket02-0000-0000000000002', '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000002', 'https://cdn.test/locket2.jpg', 'Phở Hòa xịn',                'PUBLIC',  NOW(), 'dev_hash_002'),
('locket03-0000-0000000000003', '33333333-3333-3333-3333-333333333333', 'rest0001-0000-0000-0000-000000000007', 'https://cdn.test/locket3.jpg', 'Bánh mì xưa',                'FRIENDS', NOW(), 'dev_hash_003'),
('locket04-0000-0000000000004', '44444444-4444-4444-4444-444444444444', NULL,                                      'https://cdn.test/locket4.jpg', 'Hôm nay đi chơi',            'PRIVATE', NOW(), 'dev_hash_004'),
('locket05-0000-0000000000005', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000008', 'https://cdn.test/locket5.jpg', 'Sushi tươi ghê',             'PUBLIC',  NOW(), 'dev_hash_005');

-- ============================================================
-- CHECK-INS
-- Note: expires_at is NOT NULL, must provide value
-- ============================================================
INSERT INTO check_ins (id, user_id, restaurant_id, status, check_in_at, expires_at) VALUES
('check001-0000-0000000000000001', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000001', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR)),
('check002-0000-0000000000000002', '22222222-2222-2222-2222-222222222222', 'rest0001-0000-0000-0000-000000000003', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR)),
('check003-0000-0000000000000003', '11111111-1111-1111-1111-111111111111', 'rest0001-0000-0000-0000-000000000005', 'PENDING',   NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR));

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT 'users'          AS table_name, COUNT(*) AS cnt FROM users
UNION ALL SELECT 'friendships',          COUNT(*) FROM friendships
UNION ALL SELECT 'restaurants',          COUNT(*) FROM restaurants
UNION ALL SELECT 'restaurant_hours',     COUNT(*) FROM restaurant_hours
UNION ALL SELECT 'spin_groups',          COUNT(*) FROM spin_groups
UNION ALL SELECT 'group_members',        COUNT(*) FROM group_members
UNION ALL SELECT 'spin_wallets',         COUNT(*) FROM spin_wallets
UNION ALL SELECT 'spin_sessions',       COUNT(*) FROM spin_sessions
UNION ALL SELECT 'votes',               COUNT(*) FROM votes
UNION ALL SELECT 'lockets',              COUNT(*) FROM lockets
UNION ALL SELECT 'check_ins',            COUNT(*) FROM check_ins;
