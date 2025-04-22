/*
  Warnings:

  - You are about to alter the column `subjectPoints` on the `Subject` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - You are about to alter the column `subjectTags` on the `Subject` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - You are about to alter the column `teacherVerification` on the `Subject` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.
  - You are about to drop the `UserSubject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,communityId]` on the table `CommunityUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CommunityMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reccomendedSubjects` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CommunityUser` DROP FOREIGN KEY `CommunityUser_communityId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_conversationId_fkey`;

-- DropForeignKey
ALTER TABLE `Message` DROP FOREIGN KEY `Message_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubject` DROP FOREIGN KEY `UserSubject_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `UserSubject` DROP FOREIGN KEY `UserSubject_userId_fkey`;

-- DropIndex
DROP INDEX `CommunityMessage_messageId_key` ON `CommunityMessage`;

-- DropIndex
DROP INDEX `CommunityUser_communityId_userId_key` ON `CommunityUser`;

-- DropIndex
DROP INDEX `Message_conversationId_idx` ON `Message`;

-- DropIndex
DROP INDEX `Message_senderId_idx` ON `Message`;

-- AlterTable
ALTER TABLE `CommunityMessage` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `text` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Message` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `text` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Review` MODIFY `description` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Subject` MODIFY `subjectDescription` VARCHAR(191) NOT NULL,
    MODIFY `subjectPoints` JSON NOT NULL,
    MODIFY `subjectTags` JSON NOT NULL,
    MODIFY `teacherVerification` JSON NOT NULL DEFAULT [];

-- AlterTable
ALTER TABLE `User` ADD COLUMN `reccomendedSubjects` JSON NOT NULL;

-- DropTable
DROP TABLE `UserSubject`;

-- CreateTable
CREATE TABLE `ConversationMessage` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `CommunityUser_userId_communityId_key` ON `CommunityUser`(`userId`, `communityId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMessage` ADD CONSTRAINT `ConversationMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
