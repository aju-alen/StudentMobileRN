-- CreateTable
CREATE TABLE `ClassReminderDispatch` (
    `id` VARCHAR(191) NOT NULL,
    `sourceType` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClassReminderDispatch_startsAt_idx`(`startsAt`),
    UNIQUE INDEX `ClassReminderDispatch_sourceType_sourceId_startsAt_key`(`sourceType`, `sourceId`, `startsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
