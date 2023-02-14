-- CreateTable
CREATE TABLE `tbl_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'STAFF',
    `display_name` VARCHAR(191) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tbl_user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_password_reset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,

    INDEX `tbl_password_reset_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `title` VARCHAR(64) NULL,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `email` VARCHAR(191) NULL,
    `contact_pref` VARCHAR(32) NULL DEFAULT 'raven',
    `lair_address` TEXT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `tbl_customer_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_monster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `species` VARCHAR(100) NULL,
    `owner_id` INTEGER NULL,
    `birth_date` DATE NULL,
    `temperament` VARCHAR(100) NULL,
    `quirks` TEXT NULL,
    `history` TEXT NULL,
    `photo_url` VARCHAR(255) NULL,
    `status` VARCHAR(32) NULL DEFAULT 'IN_RESIDENCE',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `tbl_monster_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_stay` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monster_id` INTEGER NOT NULL,
    `customer_id` INTEGER NOT NULL,
    `reason` VARCHAR(32) NOT NULL,
    `status` VARCHAR(32) NULL DEFAULT 'BOOKED',
    `start_date` DATE NULL,
    `expected_pickup` DATE NULL,
    `checked_in_at` DATETIME(0) NULL,
    `checked_out_at` DATETIME(0) NULL,
    `daily_rate` DECIMAL(10, 2) NULL DEFAULT 10.00,
    `notes` TEXT NULL,

    INDEX `tbl_stay_monster_id_idx`(`monster_id`),
    INDEX `tbl_stay_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stay_id` INTEGER NULL,
    `customer_id` INTEGER NOT NULL,
    `issued_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `due_date` DATE NULL,
    `total` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `status` VARCHAR(16) NULL DEFAULT 'UNPAID',

    INDEX `tbl_invoice_stay_id_idx`(`stay_id`),
    INDEX `tbl_invoice_customer_id_idx`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_invoice_line` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `description` VARCHAR(255) NULL,
    `qty` INTEGER NULL DEFAULT 1,
    `unit_price` DECIMAL(10, 2) NULL,
    `amount` DECIMAL(10, 2) NULL,
    `kind` VARCHAR(16) NULL DEFAULT 'OTHER',

    INDEX `tbl_invoice_line_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `method` VARCHAR(16) NULL DEFAULT 'GOLD',
    `paid_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `tbl_payment_invoice_id_idx`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_raven` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NOT NULL,
    `subject` VARCHAR(255) NULL,
    `body` TEXT NULL,
    `status` VARCHAR(16) NULL DEFAULT 'QUEUED',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `sent_at` DATETIME(0) NULL,

    INDEX `tbl_raven_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tbl_tournament_match` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monster_a_id` INTEGER NOT NULL,
    `monster_b_id` INTEGER NOT NULL,
    `contest` VARCHAR(32) NULL DEFAULT 'ROAR',
    `scheduled_at` DATETIME(0) NULL,
    `winner_id` INTEGER NULL,
    `score_a` INTEGER NULL,
    `score_b` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

