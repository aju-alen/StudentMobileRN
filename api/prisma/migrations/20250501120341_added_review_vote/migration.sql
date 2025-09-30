-- AlterTable
ALTER TABLE `Review` ADD COLUMN `downvotes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `upvotes` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `ReviewVote` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `voteType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ReviewVote_userId_reviewId_key`(`userId`, `reviewId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Review` RENAME INDEX `Review_subjectId_fkey` TO `Review_subjectId_idx`;

-- RenameIndex
ALTER TABLE `Review` RENAME INDEX `Review_userId_fkey` TO `Review_userId_idx`;
