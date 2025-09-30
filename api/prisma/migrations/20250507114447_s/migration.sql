-- DropForeignKey
ALTER TABLE `StripePurchases` DROP FOREIGN KEY `StripePurchases_bookingId_fkey`;

-- AddForeignKey
ALTER TABLE `StripePurchases` ADD CONSTRAINT `StripePurchases_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
