/*
  Warnings:

  - A unique constraint covering the columns `[orgInvite]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `orgInvite` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Organization_orgInvite_key` ON `Organization`(`orgInvite`);
