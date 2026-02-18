-- AlterTable
ALTER TABLE `TeacherProfile` ADD COLUMN `organizationRole` ENUM('OWNER', 'TEACHER', 'MANAGER') NULL;
