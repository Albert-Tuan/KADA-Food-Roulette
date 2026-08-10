-- ============================================================
-- CONSTRAINTS ENFORCEMENT VALIDATION v5.0
-- Test that DB constraints work correctly
-- ============================================================

USE food_roulette;

-- ============================================================
-- CHECK 3.1: NOT NULL constraints
-- ============================================================

-- Test: Insert user without required fields
-- Expected: ERROR 1048
INSERT INTO users (id, email) VALUES (UUID(), NULL);
-- Should fail: Column 'email' cannot be null

-- Test: Insert spin_session without initiator_id
-- Expected: ERROR 1048
INSERT INTO spin_sessions (id, status) VALUES (UUID(), 'ACTIVE');
-- Should fail: Column 'initiator_id' cannot be null

-- ============================================================
-- CHECK 3.2: UNIQUE constraints
-- ============================================================

-- Get first user
SET @email = (SELECT email FROM users LIMIT 1);
SET @public_id = (SELECT public_id FROM users LIMIT 1);

-- Test: Duplicate email
-- Expected: ERROR 1062 Duplicate entry
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id)
VALUES (UUID(), @email, 'hash', 'name1', 'name1', UUID());
-- Should fail: Duplicate email

-- Test: Duplicate public_id
-- Expected: ERROR 1062 Duplicate entry
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id)
VALUES (UUID(), CONCAT('new_', @email), 'hash', 'name2', 'name2', @public_id);
-- Should fail: Duplicate public_id

-- ============================================================
-- CHECK 3.3: FOREIGN KEY constraints
-- ============================================================

-- Test: Insert vote with non-existent session
-- Expected: ERROR 1452 (child row)
INSERT INTO votes (id, session_id, user_id, vote_type)
VALUES (UUID(), UUID(), UUID(), 'ACCEPT');
-- Should fail: No session exists

-- Test: Insert locket with non-existent user
-- Expected: ERROR 1452 (child row)
INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at, latitude, longitude)
VALUES (UUID(), UUID(), 'http://test.com', 'abc123', NOW(), 10.7626, 106.6602);
-- Should fail: No user exists

-- ============================================================
-- CHECK 3.4: CHECK constraints (if supported)
-- MySQL 8.0+ supports CHECK constraints
-- ============================================================

-- Test: Invalid enum value
-- Expected: ERROR for invalid enum
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role)
VALUES (UUID(), 'invalid@test.com', 'hash', 'name', 'name', UUID(), 'INVALID_ROLE');
-- Should fail: Invalid role value

-- Test: Invalid friendship status
INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), UUID(), UUID(), 'INVALID_STATUS');
-- Should fail: Invalid status value

-- ============================================================
-- CHECK 3.5: Group member limit (20 max)
-- NOTE: This requires TRIGGER implementation
-- See docs/DB_SCHEMA_REVIEW_v5.0.md
-- ============================================================

-- Create a test group
SET @group_id = UUID();
INSERT INTO groups (id, name, max_members) VALUES (@group_id, 'Test Group', 20);

-- Add 19 members (PENDING status first)
INSERT INTO group_members (id, group_id, user_id, role, status)
SELECT UUID(), @group_id, id, 'MEMBER', 'ACCEPTED' FROM users LIMIT 19;

-- Test: 20th member should succeed
INSERT INTO group_members (id, group_id, user_id, role, status)
SELECT UUID(), @group_id, id, 'MEMBER', 'ACCEPTED' FROM users LIMIT 1 OFFSET 19;

-- Test: 21st member (should fail via trigger if implemented)
INSERT INTO group_members (id, group_id, user_id, role, status)
SELECT UUID(), @group_id, id, 'MEMBER', 'ACCEPTED' FROM users LIMIT 1 OFFSET 20;
-- Expected: ERROR if trigger exists

-- Cleanup
DELETE FROM group_members WHERE group_id = @group_id;
DELETE FROM groups WHERE id = @group_id;

-- ============================================================
-- Expected results:
-- - All invalid inserts should fail with appropriate errors
-- - Valid inserts should succeed
-- ============================================================
