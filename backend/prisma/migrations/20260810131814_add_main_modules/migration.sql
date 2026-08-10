-- AlterTable
ALTER TABLE `lockets` MODIFY `updated_at` DATETIME(3) NOT NULL,
    MODIFY `deleted_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `restaurant_partners` (
    `id` VARCHAR(191) NOT NULL,
    `restaurant_id` VARCHAR(191) NOT NULL,
    `owner_name` VARCHAR(100) NOT NULL,
    `owner_email` VARCHAR(255) NOT NULL,
    `owner_phone` VARCHAR(20) NULL,
    `tier` ENUM('BASIC', 'BRONZE', 'SILVER', 'GOLD') NOT NULL DEFAULT 'BASIC',
    `fixed_fee_vnd` INTEGER NOT NULL DEFAULT 0,
    `ppv_rate_vnd` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL') NOT NULL DEFAULT 'ACTIVE',
    `referral_code` VARCHAR(20) NULL,
    `subscription_start` DATETIME(3) NULL,
    `subscription_end` DATETIME(3) NULL,
    `analytics` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `restaurant_partners_restaurant_id_key`(`restaurant_id`),
    UNIQUE INDEX `restaurant_partners_referral_code_key`(`referral_code`),
    INDEX `restaurant_partners_tier_idx`(`tier`),
    INDEX `restaurant_partners_status_idx`(`status`),
    INDEX `restaurant_partners_subscription_end_idx`(`subscription_end`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_visits` (
    `id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `check_in_id` VARCHAR(191) NULL,
    `lat` DECIMAL(10, 8) NOT NULL,
    `lng` DECIMAL(11, 8) NOT NULL,
    `accuracy` DOUBLE NULL,
    `verified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `billing_month` VARCHAR(7) NOT NULL,
    `billed` BOOLEAN NOT NULL DEFAULT false,
    `billed_at` DATETIME(3) NULL,

    INDEX `restaurant_visits_partner_id_billing_month_idx`(`partner_id`, `billing_month`),
    INDEX `restaurant_visits_billed_idx`(`billed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promo_codes` (
    `id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `description` VARCHAR(255) NULL,
    `discountType` ENUM('PERCENTAGE', 'FIXED_VND') NOT NULL DEFAULT 'PERCENTAGE',
    `discount_value` INTEGER NOT NULL,
    `min_order_vnd` INTEGER NOT NULL DEFAULT 0,
    `max_uses` INTEGER NOT NULL DEFAULT 100,
    `used_count` INTEGER NOT NULL DEFAULT 0,
    `valid_from` DATETIME(3) NOT NULL,
    `valid_until` DATETIME(3) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'DEPLETED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `promo_codes_code_key`(`code`),
    INDEX `promo_codes_partner_id_idx`(`partner_id`),
    INDEX `promo_codes_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `corporate_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(255) NOT NULL,
    `company_email` VARCHAR(255) NOT NULL,
    `company_phone` VARCHAR(20) NULL,
    `tax_id` VARCHAR(20) NULL,
    `address` VARCHAR(500) NULL,
    `tier` ENUM('BASIC', 'PROFESSIONAL', 'ENTERPRISE') NOT NULL DEFAULT 'BASIC',
    `max_seats` INTEGER NOT NULL DEFAULT 10,
    `status` ENUM('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'TRIAL',
    `subscription_start` DATETIME(3) NULL,
    `subscription_end` DATETIME(3) NULL,
    `billing_monthly` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `corporate_accounts_tax_id_key`(`tax_id`),
    INDEX `corporate_accounts_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `corporate_members` (
    `id` VARCHAR(191) NOT NULL,
    `account_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'EXPIRED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,

    UNIQUE INDEX `corporate_members_user_id_key`(`user_id`),
    INDEX `corporate_members_account_id_status_idx`(`account_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'GROUP_INVITE', 'LOCKET_NEW', 'SYSTEM') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_is_read_idx`(`user_id`, `is_read`),
    INDEX `notifications_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `restaurant_partners` ADD CONSTRAINT `restaurant_partners_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_visits` ADD CONSTRAINT `restaurant_visits_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `restaurant_partners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restaurant_visits` ADD CONSTRAINT `restaurant_visits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promo_codes` ADD CONSTRAINT `promo_codes_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `restaurant_partners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `corporate_members` ADD CONSTRAINT `corporate_members_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `corporate_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `corporate_members` ADD CONSTRAINT `corporate_members_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `lockets` RENAME INDEX `idx_lockets_deleted_at` TO `lockets_deleted_at_idx`;
