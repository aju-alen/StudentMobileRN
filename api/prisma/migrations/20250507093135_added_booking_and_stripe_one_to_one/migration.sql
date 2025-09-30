/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `StripePurchases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingId` to the `StripePurchases` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `StripePurchases` ADD COLUMN `bookingId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `StripePurchases_bookingId_key` ON `StripePurchases`(`bookingId`);

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
