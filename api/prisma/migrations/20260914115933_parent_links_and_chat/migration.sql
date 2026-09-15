-- CreateTable
CREATE TABLE `ParentStudentLink` (
    `id` VARCHAR(191) NOT NULL,
    `parentProfileId` VARCHAR(191) NOT NULL,
    `studentProfileId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED') NOT NULL DEFAULT 'PENDING',
    `inviteToken` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `respondedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ParentStudentLink_inviteToken_key`(`inviteToken`),
    INDEX `ParentStudentLink_studentProfileId_idx`(`studentProfileId`),
    INDEX `ParentStudentLink_status_idx`(`status`),
    UNIQUE INDEX `ParentStudentLink_parentProfileId_studentProfileId_key`(`parentProfileId`, `studentProfileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParentConversation` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `parentProfileId` VARCHAR(191) NOT NULL,
    `teacherProfileId` VARCHAR(191) NOT NULL,
    `studentProfileId` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,

    INDEX `ParentConversation_teacherProfileId_idx`(`teacherProfileId`),
    INDEX `ParentConversation_parentProfileId_idx`(`parentProfileId`),
    UNIQUE INDEX `ParentConversation_parentProfileId_teacherProfileId_studentP_key`(`parentProfileId`, `teacherProfileId`, `studentProfileId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParentConversationMessage` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `senderType` ENUM('PARENT', 'TEACHER') NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ParentConversationMessage_messageId_key`(`messageId`),
    INDEX `ParentConversationMessage_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ParentStudentLink` ADD CONSTRAINT `ParentStudentLink_parentProfileId_fkey` FOREIGN KEY (`parentProfileId`) REFERENCES `ParentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentStudentLink` ADD CONSTRAINT `ParentStudentLink_studentProfileId_fkey` FOREIGN KEY (`studentProfileId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentConversation` ADD CONSTRAINT `ParentConversation_parentProfileId_fkey` FOREIGN KEY (`parentProfileId`) REFERENCES `ParentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentConversation` ADD CONSTRAINT `ParentConversation_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentConversation` ADD CONSTRAINT `ParentConversation_studentProfileId_fkey` FOREIGN KEY (`studentProfileId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentConversation` ADD CONSTRAINT `ParentConversation_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentConversationMessage` ADD CONSTRAINT `ParentConversationMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `ParentConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
