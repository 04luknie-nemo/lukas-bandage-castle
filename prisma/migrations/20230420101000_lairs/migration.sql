-- CreateTable
CREATE TABLE `lairs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `wing` VARCHAR(32) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `temperature_c` INTEGER NOT NULL,
    `humidity` INTEGER NOT NULL,
    `darkness` INTEGER NOT NULL,
    `notes` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lairs_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lair_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lair_id` INTEGER NOT NULL,
    `monster_id` INTEGER NOT NULL,
    `assigned_by_id` INTEGER NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `released_at` DATETIME(3) NULL,

    INDEX `lair_assignments_lair_id_released_at_idx`(`lair_id`, `released_at`),
    INDEX `lair_assignments_monster_id_idx`(`monster_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

