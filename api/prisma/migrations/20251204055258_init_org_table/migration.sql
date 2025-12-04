/*
  Warnings:

  - You are about to drop the column `blockedTeacherId` on the `BlockedTeacher` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `BlockedTeacher` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `CommunityMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CommunityUser` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ReviewVote` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SavedSubject` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StripePurchases` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isTeacher` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reccomendedSubjects` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedBoard` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedGrade` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zoomAccountCreated` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zoomUserAcceptedInvite` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserSubject` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,teacherId]` on the table `BlockedTeacher` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,reviewId]` on the table `ReviewVote` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectId,studentId]` on the table `SavedSubject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,teacherId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,subjectId]` on the table `UserSubject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `BlockedTeacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `BlockedTeacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `CommunityMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `CommunityUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderType` to the `ConversationMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `ReviewVote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `SavedSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `StripePurchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `UserSubject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `BlockedTeacher` DROP FOREIGN KEY `BlockedTeacher_blockedTeacherId_fkey`;

-- DropForeignKey
ALTER TABLE `BlockedTeacher` DROP FOREIGN KEY `BlockedTeacher_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityMessage` DROP FOREIGN KEY `CommunityMessage_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityUser` DROP FOREIGN KEY `CommunityUser_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Conversation` DROP FOREIGN KEY `Conversation_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Conversation` DROP FOREIGN KEY `Conversation_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ReviewVote` DROP FOREIGN KEY `ReviewVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedSubject` DROP FOREIGN KEY `SavedSubject_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedSubject` DROP FOREIGN KEY `SavedSubject_userId_fkey`;

-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Subject` DROP FOREIGN KEY `Subject_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubject` DROP FOREIGN KEY `UserSubject_userId_fkey`;

-- DropIndex
DROP INDEX `BlockedTeacher_blockedTeacherId_fkey` ON `BlockedTeacher`;

-- DropIndex
DROP INDEX `BlockedTeacher_userId_blockedTeacherId_key` ON `BlockedTeacher`;

-- DropIndex
DROP INDEX `Booking_studentId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `Booking_teacherId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `CommunityMessage_senderId_fkey` ON `CommunityMessage`;

-- DropIndex
DROP INDEX `CommunityUser_userId_fkey` ON `CommunityUser`;

-- DropIndex
DROP INDEX `Conversation_clientId_fkey` ON `Conversation`;

-- DropIndex
DROP INDEX `Conversation_userId_fkey` ON `Conversation`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `Report`;

-- DropIndex
DROP INDEX `Review_userId_idx` ON `Review`;

-- DropIndex
DROP INDEX `ReviewVote_userId_reviewId_key` ON `ReviewVote`;

-- DropIndex
DROP INDEX `SavedSubject_subjectId_userId_key` ON `SavedSubject`;

-- DropIndex
DROP INDEX `SavedSubject_userId_fkey` ON `SavedSubject`;

-- DropIndex
DROP INDEX `StripePurchases_userId_fkey` ON `StripePurchases`;

-- DropIndex
DROP INDEX `Subject_id_userId_key` ON `Subject`;

-- DropIndex
DROP INDEX `Subject_userId_fkey` ON `Subject`;

-- DropIndex
DROP INDEX `UserSubject_userId_subjectId_key` ON `UserSubject`;

-- AlterTable
ALTER TABLE `BlockedTeacher` DROP COLUMN `blockedTeacherId`,
    DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `teacherId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CommunityMessage` DROP COLUMN `senderId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CommunityUser` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Conversation` DROP COLUMN `clientId`,
    DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `teacherId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ConversationMessage` ADD COLUMN `senderType` ENUM('STUDENT', 'TEACHER') NOT NULL;

-- AlterTable
ALTER TABLE `Report` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Review` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ReviewVote` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `SavedSubject` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `StripePurchases` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subject` DROP COLUMN `userId`,
    ADD COLUMN `teacherId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `isAdmin`,
    DROP COLUMN `isTeacher`,
    DROP COLUMN `reccomendedSubjects`,
    DROP COLUMN `recommendedBoard`,
    DROP COLUMN `recommendedGrade`,
    DROP COLUMN `zoomAccountCreated`,
    DROP COLUMN `zoomUserAcceptedInvite`,
    ADD COLUMN `userType` ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL;

-- AlterTable
ALTER TABLE `UserSubject` DROP COLUMN `userId`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `Message`;

-- DropTable
DROP TABLE `SuperAdmin`;

-- CreateTable
CREATE TABLE `StudentProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `recommendedBoard` VARCHAR(191) NULL,
    `recommendedGrade` INTEGER NULL,
    `reccomendedSubjects` JSON NOT NULL,

    UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `zoomAccountCreated` BOOLEAN NOT NULL DEFAULT false,
    `zoomUserAcceptedInvite` BOOLEAN NOT NULL DEFAULT false,
    `isTeamLead` BOOLEAN NOT NULL DEFAULT false,
    `organizationId` VARCHAR(191) NULL,

    UNIQUE INDEX `TeacherProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'SUPERADMIN',
    `permissions` JSON NOT NULL,

    UNIQUE INDEX `AdminProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `orgName` VARCHAR(191) NOT NULL,
    `orgWebsite` VARCHAR(191) NULL,
    `orgLicense` VARCHAR(191) NULL,
    `orgCapacity` INTEGER NOT NULL DEFAULT 3,
    `teamLeadId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_teamLeadId_key`(`teamLeadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BlockedTeacher_studentId_teacherId_key` ON `BlockedTeacher`(`studentId`, `teacherId`);

-- CreateIndex
CREATE INDEX `Review_studentId_idx` ON `Review`(`studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `ReviewVote_studentId_reviewId_key` ON `ReviewVote`(`studentId`, `reviewId`);

-- CreateIndex
CREATE UNIQUE INDEX `SavedSubject_subjectId_studentId_key` ON `SavedSubject`(`subjectId`, `studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `Subject_id_teacherId_key` ON `Subject`(`id`, `teacherId`);

-- CreateIndex
CREATE UNIQUE INDEX `UserSubject_studentId_subjectId_key` ON `UserSubject`(`studentId`, `subjectId`);

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_teamLeadId_fkey` FOREIGN KEY (`teamLeadId`) REFERENCES `TeacherProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityUser` ADD CONSTRAINT `CommunityUser_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSubject` ADD CONSTRAINT `SavedSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSubject` ADD CONSTRAINT `SavedSubject_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedTeacher` ADD CONSTRAINT `BlockedTeacher_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedTeacher` ADD CONSTRAINT `BlockedTeacher_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSubject` ADD CONSTRAINT `UserSubject_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
