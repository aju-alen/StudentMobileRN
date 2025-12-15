/*
  Warnings:

  - A unique constraint covering the columns `[courseEnrollmentId]` on the table `StripePurchases` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_bookingId_fkey`;

-- AlterTable
ALTER TABLE `StripePurchases` ADD COLUMN `courseEnrollmentId` VARCHAR(191) NULL,
    MODIFY `bookingId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Subject` ADD COLUMN `courseType` ENUM('SINGLE_STUDENT', 'MULTI_STUDENT') NOT NULL DEFAULT 'SINGLE_STUDENT',
    ADD COLUMN `currentEnrollment` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `maxCapacity` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `scheduledDateTime` DATETIME(3) NULL,
    ADD COLUMN `zoomMeetingId` INTEGER NULL,
    ADD COLUMN `zoomMeetingPassword` VARCHAR(191) NULL,
    ADD COLUMN `zoomMeetingUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CourseEnrollment` (
    `id` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `enrollmentStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CourseEnrollment_subjectId_idx`(`subjectId`),
    INDEX `CourseEnrollment_studentId_idx`(`studentId`),
    UNIQUE INDEX `CourseEnrollment_subjectId_studentId_key`(`subjectId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `StripePurchases_courseEnrollmentId_key` ON `StripePurchases`(`courseEnrollmentId`);

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_courseEnrollmentId_fkey` FOREIGN KEY (`courseEnrollmentId`) REFERENCES `CourseEnrollment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollment` ADD CONSTRAINT `CourseEnrollment_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseEnrollment` ADD CONSTRAINT `CourseEnrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
