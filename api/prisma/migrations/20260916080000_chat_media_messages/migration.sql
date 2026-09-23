ALTER TABLE `ConversationMessage`
    ADD COLUMN `type` ENUM('TEXT', 'IMAGE', 'AUDIO') NOT NULL DEFAULT 'TEXT',
    ADD COLUMN `mediaUrl` TEXT NULL,
    ADD COLUMN `mediaMime` VARCHAR(191) NULL,
    ADD COLUMN `durationMs` INTEGER NULL,
    MODIFY `text` TEXT NOT NULL;

CREATE UNIQUE INDEX `ConversationMessage_conversationId_messageId_key` ON `ConversationMessage`(`conversationId`, `messageId`);

CREATE INDEX `ConversationMessage_conversationId_createdAt_idx` ON `ConversationMessage`(`conversationId`, `createdAt`);
