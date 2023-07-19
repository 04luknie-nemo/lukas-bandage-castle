-- CreateTable
CREATE TABLE `supplies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(16) NOT NULL,
    `unit` VARCHAR(32) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `low_stock_threshold` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `supplier` VARCHAR(191) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `supplies_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supply_movements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `supply_id` INTEGER NOT NULL,
    `change` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(16) NOT NULL,
    `note` VARCHAR(255) NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `supply_movements_supply_id_idx`(`supply_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

