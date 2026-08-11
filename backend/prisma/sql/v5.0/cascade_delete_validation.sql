-- ============================================================
-- CASCADE DELETE VALIDATION v5.0
-- Test that foreign keys cascade correctly on delete
-- ============================================================

USE food_roulette;

-- ============================================================
-- CHECK 5.1: Delete User -> cascades to related tables
-- Tables: friendships, group_members, lockets, check_ins, votes, spin_wallet, spin_logs
-- ============================================================

-- Create test user
SET @test_user_id = UUID();
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id)
VALUES (@test_user_id, 'cascade_test@test.com', 'hash', 'cascade', 'cascade', 'CASC001');

-- Create related records
INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), @test_user_id, (SELECT id FROM users LIMIT 1), 'PENDING');

INSERT INTO spin_wallets (id, user_id, balance)
VALUES (UUID(), @test_user_id, 0);

INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at)
VALUES (UUID(), @test_user_id, 'http://test.com/cascade.jpg', 'cascade_hash', NOW());

-- Delete user (should cascade)
DELETE FROM users WHERE id = @test_user_id;

-- Verify: Check friendships deleted
SELECT COUNT(*) AS friendships_remaining FROM friendships 
WHERE requester_id = @test_user_id OR addressee_id = @test_user_id;
-- Expected: 0

-- Verify: Check lockets deleted
SELECT COUNT(*) AS lockets_remaining FROM lockets WHERE user_id = @test_user_id;
-- Expected: 0

-- Verify: Check spin_wallet deleted
SELECT COUNT(*) AS wallet_remaining FROM spin_wallets WHERE user_id = @test_user_id;
-- Expected: 0

-- ============================================================
-- CHECK 5.2: Delete Restaurant -> cascades to related tables
-- Tables: restaurant_hours, restaurant_photos, lockets, check_ins, spin_session_candidates
-- ============================================================

SET @test_restaurant_id = UUID();
INSERT INTO restaurants (id, name, status)
VALUES (@test_restaurant_id, 'Cascade Test Restaurant', 'APPROVED');

INSERT INTO restaurant_hours (id, restaurant_id, day_of_week, open_time, close_time)
VALUES (UUID(), @test_restaurant_id, 1, '09:00', '22:00');

INSERT INTO restaurant_photos (id, restaurant_id, photo_url)
VALUES (UUID(), @test_restaurant_id, 'http://test.com/cascade_photo.jpg');

INSERT INTO lockets (id, user_id, restaurant_id, image_url, device_hash, captured_at)
VALUES (UUID(), (SELECT id FROM users LIMIT 1), @test_restaurant_id, 'http://test.com/locket_cascade.jpg', 'locket_hash', NOW());

-- Delete restaurant
DELETE FROM restaurants WHERE id = @test_restaurant_id;

-- Verify: Check restaurant_hours deleted
SELECT COUNT(*) AS hours_remaining FROM restaurant_hours WHERE restaurant_id = @test_restaurant_id;
-- Expected: 0

-- Verify: Check restaurant_photos deleted
SELECT COUNT(*) AS photos_remaining FROM restaurant_photos WHERE restaurant_id = @test_restaurant_id;
-- Expected: 0

-- Verify: Check lockets set to NULL (NOT CASCADE for restaurant_id)
SELECT restaurant_id FROM lockets WHERE restaurant_id IS NULL;
-- Expected: 1 (set to NULL, not cascade delete)

-- ============================================================
-- CHECK 5.3: Delete Group -> cascades to group_members
-- ============================================================

SET @test_group_id = UUID();
INSERT INTO groups (id, name)
VALUES (@test_group_id, 'Cascade Test Group');

INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @test_group_id, (SELECT id FROM users LIMIT 1), 'HOST', 'ACCEPTED');

-- Delete group
DELETE FROM groups WHERE id = @test_group_id;

-- Verify: Check group_members deleted
SELECT COUNT(*) AS members_remaining FROM group_members WHERE group_id = @test_group_id;
-- Expected: 0

-- ============================================================
-- CHECK 5.4: Delete SpinSession -> cascades to votes
-- ============================================================

SET @test_session_id = UUID();
INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (@test_session_id, (SELECT id FROM users LIMIT 1), 'ACTIVE');

INSERT INTO votes (id, session_id, user_id, vote_type)
VALUES (UUID(), @test_session_id, (SELECT id FROM users LIMIT 1), 'ACCEPT');

-- Delete spin session
DELETE FROM spin_sessions WHERE id = @test_session_id;

-- Verify: Check votes deleted
SELECT COUNT(*) AS votes_remaining FROM votes WHERE session_id = @test_session_id;
-- Expected: 0

-- ============================================================
-- CHECK 5.5: Soft Delete behavior (deleted_at IS NOT NULL)
-- ============================================================

-- Check that soft-deleted users still exist in DB but are filtered out
-- Expected: queries with WHERE deleted_at IS NULL exclude soft-deleted records

SELECT COUNT(*) AS active_users FROM users WHERE deleted_at IS NULL;
SELECT COUNT(*) AS active_restaurants FROM restaurants WHERE deleted_at IS NULL;
SELECT COUNT(*) AS active_groups FROM groups WHERE deleted_at IS NULL;

-- ============================================================
-- Expected results:
-- - All hard deletes should cascade correctly
-- - Foreign keys with ON DELETE SET NULL should set NULL
-- - Soft deletes should filter records from normal queries
-- ============================================================
