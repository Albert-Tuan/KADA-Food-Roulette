-- CreateTable
CREATE TABLE `locket_likes` (
    `locket_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `locket_likes_user_id_created_at_idx`(`user_id`, `created_at`),
    PRIMARY KEY (`locket_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `locket_likes` ADD CONSTRAINT `locket_likes_locket_id_fkey`
    FOREIGN KEY (`locket_id`) REFERENCES `lockets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `locket_likes` ADD CONSTRAINT `locket_likes_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
