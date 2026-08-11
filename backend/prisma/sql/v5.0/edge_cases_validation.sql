-- ============================================================
-- EDGE CASES VALIDATION v5.0
-- Test boundary conditions and edge cases
-- ============================================================

USE food_roulette;

-- ============================================================
-- CHECK 6.1: NULL handling
-- ============================================================

-- Query with NULL in WHERE clause (should return empty, not error)
SELECT * FROM restaurants WHERE lat IS NULL;
SELECT * FROM restaurants WHERE lng IS NULL;
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE avatar_url IS NULL;

-- Query with NULL in optional relations
SELECT * FROM spin_sessions WHERE group_id IS NULL;  -- Personal spins
SELECT * FROM lockets WHERE restaurant_id IS NULL;  -- Locket not at restaurant

-- ============================================================
-- CHECK 6.2: Empty results handling
-- ============================================================

-- Query with no results (should return empty, not error)
SELECT * FROM restaurants WHERE name = 'NONEXISTENT_RESTAURANT_XYZ123';
SELECT * FROM users WHERE email = 'nonexistent@nonexistent.com';
SELECT * FROM votes WHERE session_id = 'NONEXISTENT_SESSION';

-- Count with no results
SELECT COUNT(*) AS zero_count FROM restaurants WHERE name = 'NONEXISTENT';

-- ============================================================
-- CHECK 6.3: Boundary values
-- ============================================================

-- String length boundaries
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id)
VALUES (UUID(), 'boundary@test.com', 'hash1234567890123456789012345678901234567890123456789012345678901234567890', 
        'a', 'a', 'BOUND01');
-- Min length display_name (1 char) should succeed

-- Group member count boundary (20 max)
SET @boundary_group_id = UUID();
INSERT INTO groups (id, name) VALUES (@boundary_group_id, 'Boundary Test Group');

-- Add 20 members (should succeed)
INSERT INTO group_members (id, group_id, user_id, role, status)
SELECT UUID(), @boundary_group_id, id, 'MEMBER', 'ACCEPTED' FROM users LIMIT 20;

-- Check count
SELECT COUNT(*) AS member_count FROM group_members WHERE group_id = @boundary_group_id AND status = 'ACCEPTED';
-- Expected: 20

-- ============================================================
-- CHECK 6.4: Concurrent operations (simulated)
-- ============================================================

-- Race condition: Two users try to be host of same group
SET @user1 = (SELECT id FROM users LIMIT 1 OFFSET 0);
SET @user2 = (SELECT id FROM users LIMIT 1 OFFSET 1);

-- Both try to set themselves as HOST
-- Transaction 1
START TRANSACTION;
UPDATE group_members SET role = 'HOST' WHERE group_id = @boundary_group_id AND user_id = @user1;
COMMIT;

-- Transaction 2 (should not change, already has host)
START TRANSACTION;
UPDATE group_members SET role = 'HOST' WHERE group_id = @boundary_group_id AND user_id = @user2;
COMMIT;

-- Check: Should have exactly 1 HOST
SELECT role, COUNT(*) AS count FROM group_members WHERE group_id = @boundary_group_id GROUP BY role;
-- Expected: 1 HOST, 19 MEMBER

-- Cleanup
DELETE FROM group_members WHERE group_id = @boundary_group_id;
DELETE FROM groups WHERE id = @boundary_group_id;

-- ============================================================
-- CHECK 6.5: Decimal precision (lat/lng)
-- ============================================================

SET @precision_restaurant_id = UUID();
INSERT INTO restaurants (id, name, lat, lng, status)
VALUES (@precision_restaurant_id, 'Precision Test', 10.76262200, 106.66017200, 'APPROVED');

-- Verify precision preserved
SELECT name, lat, lng, 
       LENGTH(lat) AS lat_stored_length,
       LENGTH(lng) AS lng_stored_length
FROM restaurants WHERE id = @precision_restaurant_id;
-- Expected: 10.76262200, 106.66017200

-- Cleanup
DELETE FROM restaurants WHERE id = @precision_restaurant_id;

-- ============================================================
-- CHECK 6.6: Time boundaries
-- ============================================================

-- Check-in expiration (exactly at boundary)
SET @expiring_checkin_id = UUID();
SET @boundary_user = (SELECT id FROM users LIMIT 1);
SET @boundary_restaurant = (SELECT id FROM restaurants LIMIT 1);

-- Insert check-in expiring in 1 second
INSERT INTO check_ins (id, user_id, restaurant_id, expires_at)
VALUES (@expiring_checkin_id, @boundary_user, @boundary_restaurant, DATE_ADD(NOW(), INTERVAL 1 SECOND));

-- Immediately query (should be ACTIVE)
SELECT id, status, expires_at FROM check_ins WHERE id = @expiring_checkin_id;
-- Expected: status = 'ACTIVE'

-- Wait 2 seconds then query again (should be EXPIRED if auto-expire exists)
-- Note: This requires EVENT_SCHEDULER to be ON
-- SELECT SLEEP(2);
-- SELECT status FROM check_ins WHERE id = @expiring_checkin_id;

-- Cleanup
DELETE FROM check_ins WHERE id = @expiring_checkin_id;

-- ============================================================
-- CHECK 6.7: BigInt overflow prevention
-- ============================================================

SET @wallet_user_id = (SELECT id FROM users WHERE email = 'boundary@test.com');
IF @wallet_user_id IS NULL THEN
    SET @wallet_user_id = UUID();
    INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id)
    VALUES (@wallet_user_id, 'boundary@test.com', 'hash', 'boundary', 'boundary', 'BOUNDW1');
END IF;

INSERT INTO spin_wallets (id, user_id, balance)
VALUES (UUID(), @wallet_user_id, 0);

SET @wallet_id = (SELECT id FROM spin_wallets WHERE user_id = @wallet_user_id LIMIT 1);

-- Test: Large BigInt values
INSERT INTO spin_logs (id, wallet_id, amount, source)
VALUES (UUID(), @wallet_id, 9223372036854775807, 'PURCHASE');

SELECT balance, amount FROM spin_wallets w
JOIN spin_logs l ON w.id = l.wallet_id
WHERE w.id = @wallet_id;
-- Expected: Large number stored correctly

-- Cleanup
DELETE FROM spin_logs WHERE wallet_id = @wallet_id;
DELETE FROM spin_wallets WHERE user_id = @wallet_user_id;
DELETE FROM users WHERE id = @wallet_user_id;

-- ============================================================
-- CHECK 6.8: JSON field handling (saved_restaurants)
-- ============================================================

SET @json_user_id = (SELECT id FROM users LIMIT 1);

-- Update JSON field
UPDATE users SET saved_restaurants = '["restaurant1", "restaurant2"]' WHERE id = @json_user_id;

-- Query JSON field
SELECT id, saved_restaurants FROM users WHERE id = @json_user_id;
-- Expected: JSON array returned correctly

-- Update with complex JSON
UPDATE users SET saved_restaurants = '{"favorites": ["r1", "r2"], "lastVisit": "2024-01-01"}' WHERE id = @json_user_id;

-- Query JSON with WHERE clause (MySQL 8.0+)
SELECT id, saved_restaurants FROM users 
WHERE JSON_EXTRACT(saved_restaurants, '$.favorites[0]') = '"r1"';
-- Expected: User returned

-- ============================================================
-- Expected results:
-- - All NULL queries return empty, not errors
-- - Boundary values handled correctly
-- - BigInt values stored correctly
-- - JSON fields readable and queryable
-- ============================================================
