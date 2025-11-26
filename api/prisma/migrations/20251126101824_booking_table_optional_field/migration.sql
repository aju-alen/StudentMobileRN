-- AlterTable
ALTER TABLE `Booking` MODIFY `bookingDate` DATETIME(3) NULL,
    MODIFY `bookingTime` VARCHAR(191) NULL,
    MODIFY `bookingPrice` DOUBLE NULL,
    MODIFY `bookingPaymentCompleted` BOOLEAN NULL DEFAULT false,
    MODIFY `bookingHours` INTEGER NULL,
    MODIFY `bookingMinutes` INTEGER NULL,
    MODIFY `bookingZoomId` INTEGER NULL;
