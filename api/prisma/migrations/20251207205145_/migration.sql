/*
  Warnings:

  - You are about to drop the `TeacherAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherAvailabilitySlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TeacherAvailability` DROP FOREIGN KEY `TeacherAvailability_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `TeacherAvailabilitySlot` DROP FOREIGN KEY `TeacherAvailabilitySlot_availabilityId_fkey`;

-- DropTable
DROP TABLE `TeacherAvailability`;

-- DropTable
DROP TABLE `TeacherAvailabilitySlot`;
