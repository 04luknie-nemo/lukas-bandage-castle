-- CreateTable
CREATE TABLE `intake_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stay_id` INTEGER NOT NULL,
    `monster_id` INTEGER NOT NULL,
    `condition_on_arrival` VARCHAR(16) NOT NULL,
    `weight_kg` DECIMAL(8, 2) NULL,
    `injuries` TEXT NULL,
    `behaviour_notes` TEXT NULL,
    `belongings` TEXT NULL,
    `received_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `intake_forms_stay_id_key`(`stay_id`),
    INDEX `intake_forms_monster_id_idx`(`monster_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

