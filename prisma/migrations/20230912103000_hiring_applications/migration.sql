-- CreateTable
CREATE TABLE `hiring_applications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `listing_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `lair_description` TEXT NULL,
    `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decided_at` DATETIME(3) NULL,
    `decided_by_id` INTEGER NULL,

    INDEX `hiring_applications_listing_id_idx`(`listing_id`),
    INDEX `hiring_applications_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hire_references` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `application_id` INTEGER NOT NULL,
    `referee_name` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,

    INDEX `hire_references_application_id_idx`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

