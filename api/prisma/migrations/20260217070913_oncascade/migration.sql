-- DropForeignKey
ALTER TABLE `Organization` DROP FOREIGN KEY `Organization_teamLeadId_fkey`;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_teamLeadId_fkey` FOREIGN KEY (`teamLeadId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
