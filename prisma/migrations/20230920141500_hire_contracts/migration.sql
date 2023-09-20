-- CreateTable
CREATE TABLE `hire_contracts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `application_id` INTEGER NOT NULL,
    `monster_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `reference` VARCHAR(16) NOT NULL,
    `fee` DOUBLE NOT NULL,
    `start_date` DATE NOT NULL,
    `terms` TEXT NOT NULL,
    `signed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `hire_contracts_application_id_key`(`application_id`),
    UNIQUE INDEX `hire_contracts_reference_key`(`reference`),
    INDEX `hire_contracts_monster_id_idx`(`monster_id`),
    INDEX `hire_contracts_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

