-- AlterTable
ALTER TABLE `Subject` MODIFY `courseType` ENUM('SINGLE_STUDENT', 'MULTI_STUDENT', 'SINGLE_PACKAGE', 'MULTI_PACKAGE') NOT NULL DEFAULT 'SINGLE_STUDENT';

-- CreateTable
CREATE TABLE `SubjectTopic` (
    `id` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `orderIndex` INTEGER NOT NULL,
    `topicTitle` VARCHAR(191) NOT NULL,
    `hours` INTEGER NOT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SubjectTopic_subjectId_idx`(`subjectId`),
    INDEX `SubjectTopic_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubjectTopic` ADD CONSTRAINT `SubjectTopic_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
