-- ============================================================
-- ENUM VALUES VALIDATION v5.0
-- Test all enum columns accept valid values only
-- ============================================================

USE food_roulette;

-- ============================================================
-- CHECK 4.1: UserRole enum (USER, STEWARD, ADMIN)
-- ============================================================

-- Valid values
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role)
VALUES (UUID(), 'test1@test.com', 'hash', 'name1', 'name1', 'TEST001', 'USER');

INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role)
VALUES (UUID(), 'test2@test.com', 'hash', 'name2', 'name2', 'TEST002', 'STEWARD');

INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role)
VALUES (UUID(), 'test3@test.com', 'hash', 'name3', 'name3', 'TEST003', 'ADMIN');

-- Invalid values - should all fail
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, role)
VALUES (UUID(), 'test4@test.com', 'hash', 'name4', 'name4', 'TEST004', 'INVALID');

-- ============================================================
-- CHECK 4.2: FriendshipStatus enum (PENDING, ACCEPTED, BLOCKED)
-- ============================================================

SET @user1 = (SELECT id FROM users WHERE email = 'test1@test.com');
SET @user2 = (SELECT id FROM users WHERE email = 'test2@test.com');

-- Valid values
INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), @user1, @user2, 'PENDING');

INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), @user2, @user1, 'ACCEPTED');

INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), @user1, @user2, 'BLOCKED');

-- Invalid value - should fail
INSERT INTO friendships (id, requester_id, addressee_id, status)
VALUES (UUID(), @user1, @user2, 'INVALID');

-- ============================================================
-- CHECK 4.3: RestaurantSource enum (GOOGLE_PLACES, USER_SUBMITTED)
-- ============================================================

-- Valid values
INSERT INTO restaurants (id, name, source, status)
VALUES (UUID(), 'Test Restaurant 1', 'GOOGLE_PLACES', 'APPROVED');

INSERT INTO restaurants (id, name, source, status)
VALUES (UUID(), 'Test Restaurant 2', 'USER_SUBMITTED', 'PENDING');

-- Invalid values - should fail
INSERT INTO restaurants (id, name, source, status)
VALUES (UUID(), 'Test Restaurant 3', 'INVALID_SOURCE', 'APPROVED');

-- ============================================================
-- CHECK 4.4: RestaurantStatus enum (PENDING, APPROVED, REJECTED)
-- ============================================================

-- Valid values tested above
-- Invalid value - should fail
INSERT INTO restaurants (id, name, source, status)
VALUES (UUID(), 'Test Restaurant 4', 'GOOGLE_PLACES', 'INVALID_STATUS');

-- ============================================================
-- CHECK 4.5: GroupStatus enum (WAITING, SPINNING, VOTING, DONE, CANCELLED)
-- ============================================================

-- Valid values
INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 1', 'WAITING');

INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 2', 'SPINNING');

INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 3', 'VOTING');

INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 4', 'DONE');

INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 5', 'CANCELLED');

-- Invalid value - should fail
INSERT INTO groups (id, name, status)
VALUES (UUID(), 'Test Group 6', 'INVALID');

-- ============================================================
-- CHECK 4.6: GroupRole enum (MEMBER, HOST)
-- ============================================================

SET @group_id = (SELECT id FROM groups WHERE name = 'Test Group 1' LIMIT 1);

-- Valid values
INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user1, 'MEMBER', 'ACCEPTED');

INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user2, 'HOST', 'ACCEPTED');

-- Invalid value - should fail
INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user1, 'INVALID_ROLE', 'ACCEPTED');

-- ============================================================
-- CHECK 4.7: MemberStatus enum (PENDING, ACCEPTED, VETO)
-- ============================================================

-- Valid values
INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user1, 'MEMBER', 'PENDING');

INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user2, 'MEMBER', 'ACCEPTED');

INSERT INTO group_members (id, group_id, user_id, role, status)
VALUES (UUID(), @group_id, @user1, 'MEMBER', 'VETO');

-- ============================================================
-- CHECK 4.8: SpinStatus enum (ACTIVE, VOTING, COMPLETED, CANCELLED)
-- ============================================================

-- Valid values
INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (UUID(), @user1, 'ACTIVE');

INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (UUID(), @user1, 'VOTING');

INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (UUID(), @user1, 'COMPLETED');

INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (UUID(), @user1, 'CANCELLED');

-- Invalid value - should fail
INSERT INTO spin_sessions (id, initiator_id, status)
VALUES (UUID(), @user1, 'INVALID_STATUS');

-- ============================================================
-- CHECK 4.9: VoteValue enum (ACCEPT, VETO)
-- ============================================================

SET @session_id = (SELECT id FROM spin_sessions LIMIT 1);

-- Valid values
INSERT INTO votes (id, session_id, user_id, vote_type)
VALUES (UUID(), @session_id, @user1, 'ACCEPT');

INSERT INTO votes (id, session_id, user_id, vote_type)
VALUES (UUID(), @session_id, @user2, 'VETO');

-- Invalid value - should fail
INSERT INTO votes (id, session_id, user_id, vote_type)
VALUES (UUID(), @session_id, @user1, 'INVALID_VOTE');

-- ============================================================
-- CHECK 4.10: SpinSource enum (PURCHASE, AD_WATCH, REFERRAL, REWARD)
-- ============================================================

-- Valid values - tested in data imports

-- ============================================================
-- CHECK 4.11: SubTier enum (FREE, PREMIUM)
-- ============================================================

-- Valid values
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, subscription_tier)
VALUES (UUID(), 'premium@test.com', 'hash', 'premium', 'premium', 'PREM001', 'FREE');

INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, subscription_tier)
VALUES (UUID(), 'premium2@test.com', 'hash', 'premium2', 'premium2', 'PREM002', 'PREMIUM');

-- Invalid value - should fail
INSERT INTO users (id, email, password_hash, display_name_private, display_name_public, public_id, subscription_tier)
VALUES (UUID(), 'premium3@test.com', 'hash', 'premium3', 'premium3', 'PREM003', 'INVALID_TIER');

-- ============================================================
-- CHECK 4.12: LocketVisibility enum (PRIVATE, FRIENDS, PUBLIC)
-- ============================================================

-- Valid values
INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at, visibility)
VALUES (UUID(), @user1, 'http://test.com/1.jpg', 'abc123', NOW(), 'PRIVATE');

INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at, visibility)
VALUES (UUID(), @user1, 'http://test.com/2.jpg', 'def456', NOW(), 'FRIENDS');

INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at, visibility)
VALUES (UUID(), @user1, 'http://test.com/3.jpg', 'ghi789', NOW(), 'PUBLIC');

-- Invalid value - should fail
INSERT INTO lockets (id, user_id, image_url, device_hash, captured_at, visibility)
VALUES (UUID(), @user1, 'http://test.com/4.jpg', 'jkl012', NOW(), 'INVALID_VISIBILITY');

-- ============================================================
-- CHECK 4.13: CheckInStatus enum (ACTIVE, EXPIRED, VERIFIED)
-- ============================================================

SET @restaurant_id = (SELECT id FROM restaurants LIMIT 1);

-- Valid values
INSERT INTO check_ins (id, user_id, restaurant_id, verification_method, status, expires_at)
VALUES (UUID(), @user1, @restaurant_id, 'GPS', 'ACTIVE', DATE_ADD(NOW(), INTERVAL 1 HOUR));

INSERT INTO check_ins (id, user_id, restaurant_id, verification_method, status, expires_at)
VALUES (UUID(), @user1, @restaurant_id, 'GPS', 'EXPIRED', DATE_SUB(NOW(), INTERVAL 1 HOUR));

INSERT INTO check_ins (id, user_id, restaurant_id, verification_method, status, expires_at)
VALUES (UUID(), @user1, @restaurant_id, 'GPS', 'VERIFIED', DATE_ADD(NOW(), INTERVAL 1 HOUR));

-- Invalid value - should fail
INSERT INTO check_ins (id, user_id, restaurant_id, verification_method, status, expires_at)
VALUES (UUID(), @user1, @restaurant_id, 'GPS', 'INVALID_STATUS', DATE_ADD(NOW(), INTERVAL 1 HOUR));

-- ============================================================
-- CHECK 4.14: CheckInMethod enum (GPS, QR_CODE, LOCKET)
-- ============================================================

-- Valid values tested above
-- Invalid value - should fail
INSERT INTO check_ins (id, user_id, restaurant_id, verification_method, status, expires_at)
VALUES (UUID(), @user1, @restaurant_id, 'INVALID_METHOD', 'ACTIVE', DATE_ADD(NOW(), INTERVAL 1 HOUR));

-- ============================================================
-- CLEANUP: Remove test data
-- ============================================================
DELETE FROM votes WHERE session_id = @session_id;
DELETE FROM spin_sessions WHERE id = @session_id;
DELETE FROM check_ins WHERE user_id IN (@user1, @user2);
DELETE FROM lockets WHERE user_id = @user1;
DELETE FROM group_members WHERE group_id = @group_id;
DELETE FROM groups WHERE name LIKE 'Test Group%';
DELETE FROM friendships WHERE requester_id IN (@user1, @user2) OR addressee_id IN (@user1, @user2);
DELETE FROM restaurants WHERE name LIKE 'Test Restaurant%';
DELETE FROM users WHERE email IN ('test1@test.com', 'test2@test.com', 'test3@test.com', 'test4@test.com', 'premium@test.com', 'premium2@test.com', 'premium3@test.com');
