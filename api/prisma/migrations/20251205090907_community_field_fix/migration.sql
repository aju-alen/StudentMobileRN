/*
  Warnings:

  - You are about to drop the column `studentId` on the `CommunityMessage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[communityId,studentId]` on the table `CommunityUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[communityId,teacherId]` on the table `CommunityUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teacherId` to the `CommunityMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CommunityMessage` DROP FOREIGN KEY `CommunityMessage_studentId_fkey`;

-- DropIndex
DROP INDEX `CommunityMessage_studentId_fkey` ON `CommunityMessage`;

-- AlterTable
ALTER TABLE `CommunityMessage` DROP COLUMN `studentId`,
    ADD COLUMN `teacherId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CommunityUser` ADD COLUMN `teacherId` VARCHAR(191) NULL,
    MODIFY `studentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `CommunityUser_teacherId_idx` ON `CommunityUser`(`teacherId`);

-- CreateIndex
CREATE UNIQUE INDEX `CommunityUser_communityId_studentId_key` ON `CommunityUser`(`communityId`, `studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `CommunityUser_communityId_teacherId_key` ON `CommunityUser`(`communityId`, `teacherId`);

-- AddForeignKey
ALTER TABLE `CommunityUser` ADD CONSTRAINT `CommunityUser_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `CommunityUser` RENAME INDEX `CommunityUser_studentId_fkey` TO `CommunityUser_studentId_idx`;
