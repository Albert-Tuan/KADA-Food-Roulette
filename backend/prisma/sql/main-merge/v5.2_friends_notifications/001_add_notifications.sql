-- Migration v5.2: Add Notifications table & NotificationType enum
-- Date: 2026-08-10
-- Description: Notification System for friend requests, accepts, and system alerts

CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `type` ENUM('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'GROUP_INVITE', 'LOCKET_NEW', 'SYSTEM') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `idx_notifications_user_is_read` (`user_id`, `is_read`),
    INDEX `idx_notifications_user_created` (`user_id`, `created_at`),
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
