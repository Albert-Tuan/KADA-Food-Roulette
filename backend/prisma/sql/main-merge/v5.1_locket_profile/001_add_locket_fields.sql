-- Migration v5.1: Locket/Profile field additions
-- Date: 2026-08-10
-- Description: Add missing fields to Locket model and User.bio

-- Locket: add content fields
ALTER TABLE `lockets` ADD COLUMN `thumbnail_url` VARCHAR(500) NULL AFTER `image_url`;
ALTER TABLE `lockets` ADD COLUMN `dish_name` VARCHAR(200) NULL AFTER `thumbnail_url`;
ALTER TABLE `lockets` ADD COLUMN `note` TEXT NULL AFTER `dish_name`;
ALTER TABLE `lockets` ADD COLUMN `rating` SMALLINT NULL AFTER `note`;
ALTER TABLE `lockets` ADD COLUMN `tags` JSON NULL DEFAULT ('[]') AFTER `rating`;

-- Locket: add group and status fields
ALTER TABLE `lockets` ADD COLUMN `group_id` VARCHAR(36) NULL AFTER `visibility`;
ALTER TABLE `lockets` ADD COLUMN `status` ENUM('ACTIVE', 'REMOVED', 'REPORTED') NOT NULL DEFAULT 'ACTIVE' AFTER `group_id`;
ALTER TABLE `lockets` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Locket: add rating constraint
ALTER TABLE `lockets` ADD CONSTRAINT `chk_locket_rating` CHECK (`rating` IS NULL OR (`rating` >= 1 AND `rating` <= 5));

-- Locket: add indexes for new fields
CREATE INDEX `idx_lockets_status` ON `lockets` (`status`);
CREATE INDEX `idx_lockets_group_id` ON `lockets` (`group_id`);

-- User: add bio field
ALTER TABLE `users` ADD COLUMN `bio` VARCHAR(500) NULL AFTER `avatar_url`;
