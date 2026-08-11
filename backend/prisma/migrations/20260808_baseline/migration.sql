-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `password_version` INTEGER NOT NULL DEFAULT 1,
    `display_name_private` VARCHAR(50) NOT NULL,
    `display_name_public` VARCHAR(50) NOT NULL,
    `public_id` VARCHAR(20) NOT NULL,
    `avatar_url` VARCHAR(500) NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('USER', 'STEWARD', 'ADMIN') NOT NULL DEFAULT 'USER',
    `subscription_tier` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    `is_onboarded` BOOLEAN NOT NULL DEFAULT false,
    `last_active_at` DATETIME(3) NULL,
    `saved_restaurants` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_public_id_key`(`public_id`),
    INDEX `users_subscription_tier_idx`(`subscription_tier`),
    INDEX `users_deleted_at_idx`(`deleted_at`),
    INDEX `users_last_active_at_idx`(`last_active_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friendships` (
    `id` VARCHAR(191) NOT NULL,
    `requester_id` VARCHAR(191) NOT NULL,
    `addressee_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `friendships_requester_id_status_idx`(`requester_id`, `status`),
    INDEX `friendships_addressee_id_status_idx`(`addressee_id`, `status`),
    INDEX `friendships_status_idx`(`status`),
    UNIQUE INDEX `friendships_requester_id_addressee_id_key`(`requester_id`, `addressee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurants` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `address` VARCHAR(500) NULL,
    `google_place_id` VARCHAR(191) NULL,
    `lat` DECIMAL(10, 8) NULL,
    `lng` DECIMAL(11, 8) NULL,
    `source` ENUM('GOOGLE_PLACES', 'USER_SUBMITTED') NOT NULL DEFAULT 'USER_SUBMITTED',
    `category` VARCHAR(100) NULL,
    `price_level` INTEGER NULL,
    `rating` DOUBLE NULL DEFAULT 0,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `restaurants_google_place_id_key`(`google_place_id`),
    INDEX `restaurants_status_idx`(`status`),
    INDEX `restaurants_status_category_idx`(`status`, `category`),
    INDEX `restaurants_source_idx`(`source`),
    INDEX `restaurants_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_hours` (
    `id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `day_of_week` INTEGER NOT NULL,
    `openTime` VARCHAR(5) NULL,
    `closeTime` VARCHAR(5) NULL,
    `is_closed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `restaurant_hours_restaurant_id_idx`(`restaurant_id`),
    UNIQUE INDEX `restaurant_hours_restaurant_id_day_of_week_key`(`restaurant_id`, `day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_photos` (
    `id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(500) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `caption` VARCHAR(255) NULL,
    `uploaded_by` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NULL,

    INDEX `restaurant_photos_restaurant_id_display_order_idx`(`restaurant_id`, `display_order`),
    UNIQUE INDEX `restaurant_photos_restaurant_id_photoUrl_key`(`restaurant_id`, `photoUrl`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NULL,
    `max_members` INTEGER NOT NULL DEFAULT 20,
    `status` ENUM('WAITING', 'SPINNING', 'VOTING', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'WAITING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `groups_status_idx`(`status`),
    INDEX `groups_deleted_at_idx`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_members` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `invited_by` VARCHAR(191) NULL,
    `role` ENUM('MEMBER', 'HOST') NOT NULL DEFAULT 'MEMBER',
    `status` ENUM('PENDING', 'ACCEPTED', 'VETO') NOT NULL DEFAULT 'PENDING',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `group_members_group_id_status_idx`(`group_id`, `status`),
    INDEX `group_members_user_id_idx`(`user_id`),
    UNIQUE INDEX `group_members_group_id_user_id_key`(`group_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spin_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NULL,
    `initiator_id` VARCHAR(191) NOT NULL,
    `category_filter` VARCHAR(100) NULL,
    `result_id` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'VOTING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,

    INDEX `spin_sessions_group_id_idx`(`group_id`),
    INDEX `spin_sessions_user_id_idx`(`user_id`),
    INDEX `spin_sessions_initiator_id_idx`(`initiator_id`),
    INDEX `spin_sessions_status_idx`(`status`),
    INDEX `spin_sessions_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spin_session_candidates` (
    `id` VARCHAR(191) NOT NULL,
    `spin_session_id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_selected` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `spin_session_candidates_spin_session_id_idx`(`spin_session_id`),
    INDEX `spin_session_candidates_restaurant_id_idx`(`restaurant_id`),
    UNIQUE INDEX `spin_session_candidates_spin_session_id_restaurant_id_key`(`spin_session_id`, `restaurant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votes` (
    `id` VARCHAR(191) NOT NULL,
    `spin_session_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `value` ENUM('ACCEPT', 'VETO') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `votes_spin_session_id_value_idx`(`spin_session_id`, `value`),
    UNIQUE INDEX `votes_spin_session_id_user_id_key`(`spin_session_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spin_wallets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` BIGINT NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `spin_wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spin_logs` (
    `id` VARCHAR(191) NOT NULL,
    `wallet_id` VARCHAR(191) NOT NULL,
    `amount` BIGINT NOT NULL,
    `source` ENUM('PURCHASE', 'AD_WATCH', 'REFERRAL', 'REWARD') NOT NULL,
    `purchase_id` VARCHAR(191) NULL,
    `ad_watch_log_id` VARCHAR(191) NULL,
    `gift_id` VARCHAR(191) NULL,
    `referral_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `spin_logs_wallet_id_created_at_idx`(`wallet_id`, `created_at`),
    INDEX `spin_logs_purchase_id_idx`(`purchase_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `spin_packs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `spins` INTEGER NOT NULL,
    `price_vnd` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `spin_packs_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lockets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `device_hash` VARCHAR(64) NOT NULL,
    `captured_at` DATETIME(3) NOT NULL,
    `exif_stripped` BOOLEAN NOT NULL DEFAULT false,
    `lat` DECIMAL(10, 8) NULL,
    `lng` DECIMAL(11, 8) NULL,
    `visibility` ENUM('PRIVATE', 'FRIENDS', 'PUBLIC') NOT NULL DEFAULT 'FRIENDS',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lockets_user_id_captured_at_idx`(`user_id`, `captured_at`),
    INDEX `lockets_visibility_captured_at_idx`(`visibility`, `captured_at`),
    INDEX `lockets_restaurant_id_idx`(`restaurant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `check_ins` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `locket_id` VARCHAR(191) NULL,
    `verification_method` ENUM('GPS', 'QR_CODE', 'LOCKET') NOT NULL DEFAULT 'GPS',
    `accuracy` DOUBLE NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'VERIFIED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NOT NULL,

    INDEX `check_ins_user_id_status_expires_at_idx`(`user_id`, `status`, `expires_at`),
    INDEX `check_ins_restaurant_id_created_at_idx`(`restaurant_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `extracted_text` TEXT NULL,
    `confidence` DOUBLE NULL DEFAULT 0,
    `captured_by` VARCHAR(191) NOT NULL,
    `captured_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `menus_restaurant_id_status_idx`(`restaurant_id`, `status`),
    INDEX `menus_captured_by_idx`(`captured_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_items` (
    `id` VARCHAR(191) NOT NULL,
    `menu_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `price_vnd` INTEGER NULL,
    `category` VARCHAR(50) NULL,
    `tags` JSON NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `menu_items_menu_id_idx`(`menu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `cuisine_scores` JSON NOT NULL,
    `price_range` INTEGER NOT NULL DEFAULT 2,
    `dietary_restrictions` JSON NOT NULL,
    `spice_tolerance` VARCHAR(10) NOT NULL DEFAULT 'medium',
    `disliked_ingredients` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_preferences_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `circle_recommendations` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `spin_session_id` VARCHAR(191) NULL,
    `menu_id` VARCHAR(191) NULL,
    `member_scores` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `circle_recommendations_spin_session_id_key`(`spin_session_id`),
    INDEX `circle_recommendations_group_id_idx`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_addressee_id_fkey` FOREIGN KEY (`addressee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_hours` ADD CONSTRAINT `restaurant_hours_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_photos` ADD CONSTRAINT `restaurant_photos_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_photos` ADD CONSTRAINT `restaurant_photos_uploaded_by_fkey` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_members` ADD CONSTRAINT `group_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_sessions` ADD CONSTRAINT `spin_sessions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_sessions` ADD CONSTRAINT `spin_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_sessions` ADD CONSTRAINT `spin_sessions_initiator_id_fkey` FOREIGN KEY (`initiator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_sessions` ADD CONSTRAINT `spin_sessions_result_id_fkey` FOREIGN KEY (`result_id`) REFERENCES `restaurants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_session_candidates` ADD CONSTRAINT `spin_session_candidates_spin_session_id_fkey` FOREIGN KEY (`spin_session_id`) REFERENCES `spin_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_session_candidates` ADD CONSTRAINT `spin_session_candidates_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_spin_session_id_fkey` FOREIGN KEY (`spin_session_id`) REFERENCES `spin_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_wallets` ADD CONSTRAINT `spin_wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_logs` ADD CONSTRAINT `spin_logs_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `spin_wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `spin_logs` ADD CONSTRAINT `spin_logs_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `spin_packs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lockets` ADD CONSTRAINT `lockets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lockets` ADD CONSTRAINT `lockets_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `check_ins` ADD CONSTRAINT `check_ins_locket_id_fkey` FOREIGN KEY (`locket_id`) REFERENCES `lockets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_captured_by_fkey` FOREIGN KEY (`captured_by`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `circle_recommendations` ADD CONSTRAINT `circle_recommendations_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `circle_recommendations` ADD CONSTRAINT `circle_recommendations_spin_session_id_fkey` FOREIGN KEY (`spin_session_id`) REFERENCES `spin_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
