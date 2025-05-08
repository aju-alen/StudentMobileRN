/*
  Warnings:

  - Made the column `bookingHours` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bookingMinutes` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bookingZoomId` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Booking` MODIFY `bookingHours` INTEGER NOT NULL,
    MODIFY `bookingMinutes` INTEGER NOT NULL,
    MODIFY `bookingZoomId` INTEGER NOT NULL;
