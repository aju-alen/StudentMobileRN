-- AlterTable
ALTER TABLE `User` ADD COLUMN `passwordResetAttempts` INTEGER NOT NULL DEFAULT 0;
