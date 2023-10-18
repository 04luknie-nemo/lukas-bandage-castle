-- CreateTable
CREATE TABLE `couriers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `kind` VARCHAR(16) NOT NULL,
    `max_load_kg` INTEGER NOT NULL,
    `speed` INTEGER NOT NULL DEFAULT 20,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courier_jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stay_id` INTEGER NULL,
    `monster_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `direction` VARCHAR(16) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `distance_leagues` DECIMAL(6, 1) NOT NULL,
    `weight_kg` INTEGER NOT NULL,
    `scheduled_for` DATETIME(3) NOT NULL,
    `duration_min` INTEGER NOT NULL,
    `courier_id` INTEGER NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'REQUESTED',
    `fee` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivered_at` DATETIME(3) NULL,

    INDEX `courier_jobs_scheduled_for_idx`(`scheduled_for`),
    INDEX `courier_jobs_stay_id_idx`(`stay_id`),
    INDEX `courier_jobs_courier_id_idx`(`courier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

