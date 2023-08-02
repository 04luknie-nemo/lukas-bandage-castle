-- CreateTable
CREATE TABLE `stay_extensions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stay_id` INTEGER NOT NULL,
    `old_pickup` DATE NOT NULL,
    `new_pickup` DATE NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stay_extensions_stay_id_idx`(`stay_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

