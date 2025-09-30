-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `bookingHours` INTEGER NULL DEFAULT 0,
    ADD COLUMN `bookingMinutes` INTEGER NULL DEFAULT 0,
    ADD COLUMN `bookingZoomPassword` VARCHAR(191) NULL DEFAULT '',
    ADD COLUMN `bookingZoomUrl` VARCHAR(191) NULL DEFAULT '';
