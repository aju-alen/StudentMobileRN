-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `subjectTopicId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_subjectTopicId_fkey` FOREIGN KEY (`subjectTopicId`) REFERENCES `SubjectTopic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
