-- AlterTable
ALTER TABLE `Subject` ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL;
