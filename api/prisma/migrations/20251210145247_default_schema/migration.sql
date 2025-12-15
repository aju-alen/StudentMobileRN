/*
  Warnings:

  - You are about to drop the column `courseEnrollmentId` on the `StripePurchases` table. All the data in the column will be lost.
  - You are about to drop the column `courseType` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `currentEnrollment` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `maxCapacity` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledDateTime` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `zoomMeetingId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `zoomMeetingPassword` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `zoomMeetingUrl` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the `CourseEnrollment` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `bookingId` on table `StripePurchases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CourseEnrollment` DROP FOREIGN KEY `CourseEnrollment_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `CourseEnrollment` DROP FOREIGN KEY `CourseEnrollment_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_courseEnrollmentId_fkey`;

-- DropIndex
DROP INDEX `StripePurchases_courseEnrollmentId_key` ON `StripePurchases`;

-- AlterTable
ALTER TABLE `StripePurchases` DROP COLUMN `courseEnrollmentId`,
    MODIFY `bookingId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subject` DROP COLUMN `courseType`,
    DROP COLUMN `currentEnrollment`,
    DROP COLUMN `maxCapacity`,
    DROP COLUMN `scheduledDateTime`,
    DROP COLUMN `zoomMeetingId`,
    DROP COLUMN `zoomMeetingPassword`,
    DROP COLUMN `zoomMeetingUrl`;

-- DropTable
DROP TABLE `CourseEnrollment`;

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
