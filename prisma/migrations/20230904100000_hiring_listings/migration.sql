-- CreateTable
CREATE TABLE `hiring_listings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monster_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `pitch` TEXT NOT NULL,
    `skills` VARCHAR(255) NULL,
    `available_from` DATE NOT NULL,
    `fee_gold` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `hiring_listings_monster_id_idx`(`monster_id`),
    INDEX `hiring_listings_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

