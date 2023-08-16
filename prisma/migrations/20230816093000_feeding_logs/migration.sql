-- CreateTable
CREATE TABLE `feeding_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monster_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `meal_time` VARCHAR(5) NOT NULL,
    `fed_by_id` INTEGER NOT NULL,
    `fed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `note` VARCHAR(255) NULL,

    UNIQUE INDEX `feeding_logs_monster_id_date_meal_time_key`(`monster_id`, `date`, `meal_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

