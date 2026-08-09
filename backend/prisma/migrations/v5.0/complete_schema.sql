-- ============================================================
-- Food Roulette v5.0 - COMPLETE SCHEMA (ALL IN ONE FILE)
-- DROP + CREATE + SEED
-- Run this ONLY ONCE in MySQL Workbench
-- v5.0 | 2026-08-06
-- ============================================================

-- Step 1: DROP & RECREATE DATABASE
DROP DATABASE IF EXISTS food_roulette;
CREATE DATABASE food_roulette CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_roulette;

-- ============================================================
-- 1. users (P0 - Authentication & Profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                     CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email                  VARCHAR(255) NOT NULL,
    password_hash          VARCHAR(255) NOT NULL,
    password_version       INT DEFAULT 1,
    display_name_private   VARCHAR(50) NOT NULL,
    display_name_public    VARCHAR(50) NOT NULL,
    public_id              VARCHAR(20) NOT NULL,
    avatar_url             VARCHAR(500) NULL,
    bio                    VARCHAR(160) NULL,
    phone                  VARCHAR(20) NULL,
    role                   ENUM('USER', 'STEWARD', 'ADMIN') DEFAULT 'USER',
    subscription_tier      ENUM('FREE', 'PREMIUM') DEFAULT 'FREE',
    is_onboarded           BOOLEAN DEFAULT FALSE,
    last_active_at         DATETIME NULL,
    saved_restaurants      JSON NULL COMMENT 'P2: TasteBoard',
    created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at             DATETIME NULL,

    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_public_id (public_id),
    INDEX idx_users_subscription_tier (subscription_tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. friendships (P0 - Social Foundation)
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    requester_id  CHAR(36) NOT NULL,
    addressee_id  CHAR(36) NOT NULL,
    status        ENUM('PENDING', 'ACCEPTED', 'BLOCKED') DEFAULT 'PENDING',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_friendships_requester_addressee (requester_id, addressee_id),
    INDEX idx_friendships_requester_status (requester_id, status),
    INDEX idx_friendships_addressee_status (addressee_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. restaurants (P0 - Main Entity with Geo)
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurants (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(255) NOT NULL,
    address         VARCHAR(500) NULL,
    lat             FLOAT NULL,
    lng             FLOAT NULL,
    source          ENUM('GOOGLE_PLACES', 'USER_SUBMITTED') DEFAULT 'USER_SUBMITTED',
    category        VARCHAR(100) NULL,
    price_level     INT NULL COMMENT '1-4',
    rating          DECIMAL(2,1) NULL COMMENT '0.0-5.0',
    phone           VARCHAR(20) NULL,
    google_place_id VARCHAR(100) NULL,
    status          ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL,

    UNIQUE KEY uk_restaurants_google_place_id (google_place_id),
    INDEX idx_restaurants_status (status),
    INDEX idx_restaurants_source (source),
    INDEX idx_restaurants_category (category),
    INDEX idx_restaurants_status_category (status, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. restaurant_hours (4NF)
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_hours (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    day_of_week   TINYINT NOT NULL COMMENT '0=Sunday, 6=Saturday',
    open_time     TIME NULL,
    close_time    TIME NULL,
    is_closed     BOOLEAN DEFAULT FALSE,

    UNIQUE KEY uk_restaurant_hours_day (restaurant_id, day_of_week),
    INDEX idx_restaurant_hours_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. restaurant_photos
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_photos (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    restaurant_id CHAR(36) NOT NULL,
    photo_url     VARCHAR(500) NOT NULL,
    is_primary    BOOLEAN DEFAULT FALSE,
    uploaded_by   CHAR(36) NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_restaurant_photos_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. spin_groups (P0 - Group Spin)
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_groups (
    id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name        VARCHAR(100) NULL,
    creator_id  CHAR(36) NULL,
    invite_code VARCHAR(20) NOT NULL,
    status      ENUM('WAITING', 'SPINNING', 'VOTING', 'DONE', 'CANCELLED') DEFAULT 'WAITING',
    max_members INT DEFAULT 20,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ended_at    DATETIME NULL,
    deleted_at  DATETIME NULL,

    UNIQUE KEY uk_spin_groups_invite_code (invite_code),
    INDEX idx_spin_groups_invite_code (invite_code),
    INDEX idx_spin_groups_status (status),
    INDEX idx_spin_groups_creator (creator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. group_members (P0 - Membership with host role)
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
    id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id   CHAR(36) NOT NULL,
    user_id    CHAR(36) NOT NULL,
    role       ENUM('MEMBER', 'HOST', 'CREATOR') DEFAULT 'MEMBER',
    status     ENUM('PENDING', 'ACCEPTED', 'VETO', 'DECLINED') DEFAULT 'PENDING',
    joined_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_group_members_group_user (group_id, user_id),
    INDEX idx_group_members_group_status (group_id, status),
    INDEX idx_group_members_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. spin_sessions (P0 - Spin Core)
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_sessions (
    id                   CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    group_id             CHAR(36) NULL COMMENT 'null = personal spin',
    user_id              CHAR(36) NULL COMMENT 'null = group spin',
    creator_id           CHAR(36) NOT NULL,
    selected_restaurant_id CHAR(36) NULL,
    candidate_ids        JSON NULL,
    type                 ENUM('PERSONAL', 'GROUP') DEFAULT 'PERSONAL',
    status               ENUM('ACTIVE', 'VOTING', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
    is_final             BOOLEAN DEFAULT FALSE COMMENT 'true = final choice',
    created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at         DATETIME NULL,

    INDEX idx_spin_sessions_group (group_id),
    INDEX idx_spin_sessions_creator (creator_id),
    INDEX idx_spin_sessions_status (status),
    INDEX idx_spin_sessions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. spin_session_candidates
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_session_candidates (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id    CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    is_winner     BOOLEAN DEFAULT FALSE,
    added_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_session_restaurant (session_id, restaurant_id),
    INDEX idx_candidates_session (session_id),
    INDEX idx_candidates_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. votes (P0 - Voting)
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id    CHAR(36) NOT NULL,
    voter_id      CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    vote_type     ENUM('ACCEPT', 'REJECT') NOT NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_votes_session_voter (session_id, voter_id),
    INDEX idx_votes_session (session_id),
    INDEX idx_votes_voter (voter_id),
    INDEX idx_votes_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. spin_packs (P0 - Virtual Items)
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_packs (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name          VARCHAR(100) NOT NULL,
    description   VARCHAR(500) NULL,
    spins_count   INT NOT NULL COMMENT '-1 = unlimited',
    price_usd     DECIMAL(10,2) DEFAULT 0.00,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_spin_packs_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. spin_wallets (P0 - Balance tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_wallets (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id       CHAR(36) NOT NULL,
    balance       INT NOT NULL DEFAULT 0 COMMENT 'Free spins remaining',
    purchased_spins INT NOT NULL DEFAULT 0 COMMENT 'Spins bought',
    total_spins   INT NOT NULL DEFAULT 0 COMMENT 'All-time spins',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_spin_wallets_user (user_id),
    INDEX idx_spin_wallets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. spin_logs (Audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS spin_logs (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id       CHAR(36) NOT NULL,
    session_id    CHAR(36) NULL,
    restaurant_id CHAR(36) NULL,
    spin_type     ENUM('PERSONAL', 'GROUP') NOT NULL,
    result        ENUM('SELECTED', 'REJECTED', 'CANCELLED') NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_spin_logs_user (user_id),
    INDEX idx_spin_logs_session (session_id),
    INDEX idx_spin_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. lockets (P0 - Camera-only photos)
-- ============================================================
CREATE TABLE IF NOT EXISTS lockets (
    id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id          CHAR(36) NOT NULL,
    restaurant_id    CHAR(36) NULL,
    image_url        VARCHAR(500) NOT NULL,
    dish_name        VARCHAR(80) NOT NULL,
    restaurant_name  VARCHAR(120) NULL,
    note             VARCHAR(280) NULL,
    rating           INT NULL,
    tags             JSON NOT NULL DEFAULT (JSON_ARRAY()),
    exif_stripped    BOOLEAN NOT NULL DEFAULT FALSE,
    lat              DECIMAL(10,8) NULL,
    lng              DECIMAL(11,8) NULL,
    visibility       ENUM('PRIVATE', 'FRIENDS', 'PUBLIC') DEFAULT 'FRIENDS',
    device_hash      VARCHAR(64) NOT NULL,
    captured_at      DATETIME NOT NULL COMMENT 'Must be within 60s of server time',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at       DATETIME NULL,

    INDEX idx_lockets_user_captured (user_id, captured_at),
    INDEX idx_lockets_restaurant (restaurant_id),
    INDEX idx_lockets_visibility_captured (visibility, captured_at),
    INDEX idx_lockets_deleted_at (deleted_at),
    CONSTRAINT chk_lockets_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. check_ins (P0 - Restaurant verification)
-- ============================================================
CREATE TABLE IF NOT EXISTS check_ins (
    id            CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id       CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    status        ENUM('PENDING', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
    check_in_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at    DATETIME NULL,
    expires_at     DATETIME NOT NULL COMMENT 'Auto-cancel after 2 hours',
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_checkins_user (user_id),
    INDEX idx_checkins_restaurant (restaurant_id),
    INDEX idx_checkins_status (status),
    INDEX idx_checkins_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- FOREIGN KEYS (added after all tables exist)
-- ============================================================

ALTER TABLE friendships
    ADD CONSTRAINT fk_friendships_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_friendships_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE restaurant_hours
    ADD CONSTRAINT fk_restaurant_hours_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE restaurant_photos
    ADD CONSTRAINT fk_restaurant_photos_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_restaurant_photos_uploader FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE spin_groups
    ADD CONSTRAINT fk_spin_groups_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE group_members
    ADD CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES spin_groups(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_group_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE spin_sessions
    ADD CONSTRAINT fk_spin_sessions_group FOREIGN KEY (group_id) REFERENCES spin_groups(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_spin_sessions_creator FOREIGN KEY (creator_id) REFERENCES users(id),
    ADD CONSTRAINT fk_spin_sessions_restaurant FOREIGN KEY (selected_restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL;

ALTER TABLE spin_session_candidates
    ADD CONSTRAINT fk_candidates_session FOREIGN KEY (session_id) REFERENCES spin_sessions(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_candidates_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE votes
    ADD CONSTRAINT fk_votes_session FOREIGN KEY (session_id) REFERENCES spin_sessions(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_votes_voter FOREIGN KEY (voter_id) REFERENCES users(id),
    ADD CONSTRAINT fk_votes_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;

ALTER TABLE spin_wallets
    ADD CONSTRAINT fk_spin_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE spin_logs
    ADD CONSTRAINT fk_spin_logs_user FOREIGN KEY (user_id) REFERENCES users(id),
    ADD CONSTRAINT fk_spin_logs_session FOREIGN KEY (session_id) REFERENCES spin_sessions(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_spin_logs_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);

ALTER TABLE lockets
    ADD CONSTRAINT fk_lockets_user FOREIGN KEY (user_id) REFERENCES users(id),
    ADD CONSTRAINT fk_lockets_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL;

ALTER TABLE check_ins
    ADD CONSTRAINT fk_checkins_user FOREIGN KEY (user_id) REFERENCES users(id),
    ADD CONSTRAINT fk_checkins_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);

-- ============================================================
-- CHECK CONSTRAINTS
-- ============================================================

ALTER TABLE restaurants
    ADD CONSTRAINT chk_restaurants_price_level CHECK (price_level IS NULL OR (price_level BETWEEN 1 AND 4)),
    ADD CONSTRAINT chk_restaurants_rating CHECK (rating IS NULL OR (rating BETWEEN 0 AND 5));

ALTER TABLE restaurant_hours
    ADD CONSTRAINT chk_restaurant_hours_day CHECK (day_of_week BETWEEN 0 AND 6);

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //
CREATE TRIGGER trg_spin_wallet_balance_check
BEFORE UPDATE ON spin_wallets
FOR EACH ROW
BEGIN
    IF NEW.balance < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SpinWallet balance cannot be negative';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_group_member_limit_insert
BEFORE INSERT ON group_members
FOR EACH ROW
BEGIN
    DECLARE member_count INT;
    SELECT COUNT(*) INTO member_count FROM group_members
    WHERE group_id = NEW.group_id AND status NOT IN ('DECLINED', 'VETO');
    IF member_count >= 20 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Group cannot have more than 20 members';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER trg_locket_captured_at_validation
BEFORE INSERT ON lockets
FOR EACH ROW
BEGIN
    DECLARE time_diff INT;
    SET time_diff = ABS(TIMESTAMPDIFF(SECOND, NEW.captured_at, NOW()));
    IF time_diff > 60 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Locket captured_at must be within 60 seconds of server time';
    END IF;
END//
DELIMITER ;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Spin Packs
INSERT INTO spin_packs (id, name, description, spins_count, price_usd, is_active) VALUES
    (UUID(), 'Free Daily', 'Daily free spins - no purchase required', 3, 0.00, TRUE),
    (UUID(), 'Starter Pack', '10 spins to get you started', 10, 0.99, TRUE),
    (UUID(), 'Basic Pack', '25 spins for casual players', 25, 1.99, TRUE),
    (UUID(), 'Party Pack', '50 spins for group gatherings', 50, 3.49, TRUE),
    (UUID(), 'Premium Pack', '100 spins for spin enthusiasts', 100, 5.99, TRUE),
    (UUID(), 'Unlimited Monthly', 'Unlimited spins for 30 days', -1, 9.99, TRUE);

-- Sample Restaurants
INSERT INTO restaurants (id, name, address, lat, lng, source, category, price_level, rating, status) VALUES
    (UUID(), 'Phở Hàng Bè', '123 Nguyễn Trãi, Q1, HCMC', 10.7629, 106.6934, 'USER_SUBMITTED', 'Phở', 2, 4.5, 'APPROVED'),
    (UUID(), 'Bún Chả Hương', '45 Lê Lợi, Q1, HCMC', 10.7694, 106.6992, 'USER_SUBMITTED', 'Bún Chả', 2, 4.3, 'APPROVED'),
    (UUID(), 'Cơm Tấm Kiều Giang', '78 Pasteur, Q1, HCMC', 10.7762, 106.6996, 'USER_SUBMITTED', 'Cơm Tấm', 1, 4.1, 'APPROVED'),
    (UUID(), 'Bánh Mì Huỳnh Hoa', '26 Lê Thị Riêng, Q1, HCMC', 10.7678, 106.6976, 'USER_SUBMITTED', 'Bánh Mì', 1, 4.7, 'APPROVED'),
    (UUID(), 'Hủ Tiếu Nam Vang', '90 Đề Thám, Q1, HCMC', 10.7645, 106.6955, 'USER_SUBMITTED', 'Hủ Tiếu', 1, 4.2, 'APPROVED'),
    (UUID(), 'Sushi Kei', '88 Đồng Khởi, Q1, HCMC', 10.7718, 106.7042, 'USER_SUBMITTED', 'Sushi', 4, 4.6, 'APPROVED'),
    (UUID(), 'Kichi Kichi', '60 Lê Lai, Q1, HCMC', 10.7732, 106.6865, 'USER_SUBMITTED', 'Lẩu Nhật', 3, 4.3, 'APPROVED'),
    (UUID(), 'Dookki', '88 Lê Lai, Q1, HCMC', 10.7732, 106.6865, 'USER_SUBMITTED', 'Nướng', 3, 4.5, 'APPROVED');

-- Default Admin
INSERT INTO users (id, email, password_hash, password_version, display_name_private, display_name_public, public_id, role, subscription_tier, is_onboarded)
VALUES (UUID(), 'admin@foodroulette.vn', '$2b$10$placeholder', 1, 'Admin', 'FoodRoulette Admin', 'FRADM001', 'ADMIN', 'PREMIUM', TRUE);

-- Default Steward
INSERT INTO users (id, email, password_hash, password_version, display_name_private, display_name_public, public_id, role, subscription_tier, is_onboarded)
VALUES (UUID(), 'steward@foodroulette.vn', '$2b$10$placeholder', 1, 'Steward', 'Food Steward', 'FRSTW001', 'STEWARD', 'PREMIUM', TRUE);

-- Admin Spin Wallet
INSERT INTO spin_wallets (user_id, balance, purchased_spins, total_spins)
SELECT id, 10, 0, 10 FROM users WHERE email = 'admin@foodroulette.vn';

-- Restaurant Hours for Phở Hàng Bè
SET @pho_id = (SELECT id FROM restaurants WHERE name = 'Phở Hàng Bè' LIMIT 1);
INSERT INTO restaurant_hours (id, restaurant_id, day_of_week, open_time, close_time, is_closed) VALUES
    (UUID(), @pho_id, 0, '06:00:00', '14:00:00', FALSE),
    (UUID(), @pho_id, 1, '06:00:00', '21:00:00', FALSE),
    (UUID(), @pho_id, 2, '06:00:00', '21:00:00', FALSE),
    (UUID(), @pho_id, 3, '06:00:00', '21:00:00', FALSE),
    (UUID(), @pho_id, 4, '06:00:00', '21:00:00', FALSE),
    (UUID(), @pho_id, 5, '06:00:00', '22:00:00', FALSE),
    (UUID(), @pho_id, 6, '06:00:00', '22:00:00', FALSE);

SELECT 'Migration completed successfully!' AS result;
