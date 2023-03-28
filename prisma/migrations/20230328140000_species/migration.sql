-- AlterTable
ALTER TABLE `tbl_monster` ADD COLUMN `species_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `species` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `diet` VARCHAR(255) NOT NULL,
    `diet_type` VARCHAR(32) NOT NULL,
    `meals_per_day` INTEGER NOT NULL DEFAULT 2,
    `portion_kg` DECIMAL(6, 2) NOT NULL DEFAULT 1.00,
    `danger_level` INTEGER NOT NULL,
    `temp_min_c` INTEGER NOT NULL,
    `temp_max_c` INTEGER NOT NULL,
    `humidity_min` INTEGER NOT NULL,
    `humidity_max` INTEGER NOT NULL,
    `darkness` INTEGER NOT NULL,
    `lifespan_years` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `species_name_key`(`name`),
    UNIQUE INDEX `species_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `species_compatibility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `species_id` INTEGER NOT NULL,
    `incompatible_species_id` INTEGER NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `species_compatibility_incompatible_species_id_idx`(`incompatible_species_id`),
    UNIQUE INDEX `species_compatibility_species_id_incompatible_species_id_key`(`species_id`, `incompatible_species_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `tbl_monster_species_id_idx` ON `tbl_monster`(`species_id`);


-- Link existing monsters to their species by name where we can.
UPDATE `tbl_monster` m JOIN `species` s ON LOWER(TRIM(m.`species`)) = LOWER(s.`name`) SET m.`species_id` = s.`id`;
