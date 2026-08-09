-- B2B Restaurant Partner Tables Migration
-- Version: 6.0 | Date: 2026-08-09
-- Tables: restaurant_partners, restaurant_visits, promo_codes, corporate_accounts, corporate_members

-- ============================================================
-- Restaurant Partners
-- ============================================================

CREATE TABLE IF NOT EXISTS `restaurant_partners` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `restaurant_id` CHAR(36) NOT NULL,
  `owner_name` VARCHAR(100) NOT NULL,
  `owner_email` VARCHAR(255) NOT NULL,
  `owner_phone` VARCHAR(20),
  `tier` ENUM('BASIC', 'BRONZE', 'SILVER', 'GOLD') NOT NULL DEFAULT 'BASIC',
  `fixed_fee_vnd` INT NOT NULL DEFAULT 0,
  `ppv_rate_vnd` INT NOT NULL DEFAULT 0,
  `status` ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL') NOT NULL DEFAULT 'ACTIVE',
  `referral_code` VARCHAR(20) UNIQUE,
  `subscription_start` DATETIME,
  `subscription_end` DATETIME,
  `analytics` JSON DEFAULT ('{}'),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_partner_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE,
  UNIQUE INDEX `idx_partner_restaurant` (`restaurant_id`),
  INDEX `idx_partner_tier` (`tier`),
  INDEX `idx_partner_status` (`status`),
  INDEX `idx_partner_subscription_end` (`subscription_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Restaurant Visits (Pay-per-visit tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS `restaurant_visits` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `partner_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `check_in_id` CHAR(36),
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `accuracy` FLOAT,
  `verified_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `billing_month` VARCHAR(7) NOT NULL,
  `billed` BOOLEAN NOT NULL DEFAULT FALSE,
  `billed_at` DATETIME,
  
  CONSTRAINT `fk_visit_partner` FOREIGN KEY (`partner_id`) REFERENCES `restaurant_partners`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_visit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_visit_partner_month` (`partner_id`, `billing_month`),
  INDEX `idx_visit_billed` (`billed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Promo Codes
-- ============================================================

CREATE TABLE IF NOT EXISTS `promo_codes` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `partner_id` CHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` VARCHAR(255),
  `discount_type` ENUM('PERCENTAGE', 'FIXED_VND') NOT NULL DEFAULT 'PERCENTAGE',
  `discount_value` INT NOT NULL,
  `min_order_vnd` INT NOT NULL DEFAULT 0,
  `max_uses` INT NOT NULL DEFAULT 100,
  `used_count` INT NOT NULL DEFAULT 0,
  `valid_from` DATETIME NOT NULL,
  `valid_until` DATETIME NOT NULL,
  `status` ENUM('ACTIVE', 'EXPIRED', 'DEPLETED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_promo_partner` FOREIGN KEY (`partner_id`) REFERENCES `restaurant_partners`(`id`) ON DELETE CASCADE,
  INDEX `idx_promo_partner` (`partner_id`),
  INDEX `idx_promo_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Corporate Accounts
-- ============================================================

CREATE TABLE IF NOT EXISTS `corporate_accounts` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `company_email` VARCHAR(255) NOT NULL,
  `company_phone` VARCHAR(20),
  `tax_id` VARCHAR(20) UNIQUE,
  `address` VARCHAR(500),
  `tier` ENUM('BASIC', 'PROFESSIONAL', 'ENTERPRISE') NOT NULL DEFAULT 'BASIC',
  `max_seats` INT NOT NULL DEFAULT 10,
  `status` ENUM('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
  `subscription_start` DATETIME,
  `subscription_end` DATETIME,
  `billing_monthly` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_corporate_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Corporate Members
-- ============================================================

CREATE TABLE IF NOT EXISTS `corporate_members` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `account_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL UNIQUE,
  `role` ENUM('USER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'USER',
  `status` ENUM('ACTIVE', 'EXPIRED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATETIME,
  
  CONSTRAINT `fk_member_account` FOREIGN KEY (`account_id`) REFERENCES `corporate_accounts`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_member_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_member_account_status` (`account_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Verification: Restaurant Partner Tier
-- ============================================================

DELIMITER //

CREATE TRIGGER IF NOT EXISTS `trg_partner_tier_check`
BEFORE INSERT ON `restaurant_partners`
FOR EACH ROW
BEGIN
  -- Ensure tier boost matches fixed fee
  IF NEW.tier = 'BRONZE' AND NEW.fixed_fee_vnd != 99000 THEN
    SET NEW.fixed_fee_vnd = 99000;
    SET NEW.ppv_rate_vnd = 5000;
  ELSEIF NEW.tier = 'SILVER' AND NEW.fixed_fee_vnd != 199000 THEN
    SET NEW.fixed_fee_vnd = 199000;
    SET NEW.ppv_rate_vnd = 4000;
  ELSEIF NEW.tier = 'GOLD' AND NEW.fixed_fee_vnd != 399000 THEN
    SET NEW.fixed_fee_vnd = 399000;
    SET NEW.ppv_rate_vnd = 3000;
  END IF;
END //

DELIMITER ;

-- ============================================================
-- Verification: Visit Distance (Application-level check)
-- Note: Haversine distance check is done in application layer
-- Required: distance <= 100 meters for verification
-- ============================================================

-- ============================================================
-- Seed Data: Partner Tiers
-- ============================================================

-- Insert default subscription plans for reference
-- (Note: These are informational, not stored in DB)

/*
| Tier   | Fixed Fee | PPV Rate | Break-even Visits |
|--------|-----------|----------|------------------|
| BASIC  | 0         | 0        | N/A              |
| BRONZE | 99,000    | 5,000    | 20/month         |
| SILVER | 199,000   | 4,000    | 50/month         |
| GOLD   | 399,000   | 3,000    | 133/month        |
*/
