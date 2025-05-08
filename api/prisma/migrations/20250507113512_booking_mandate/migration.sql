/*
  Warnings:

  - Made the column `bookingId` on table `StripePurchases` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_bookingId_fkey`;

-- AlterTable
ALTER TABLE `StripePurchases` MODIFY `bookingId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
