-- DropForeignKey
ALTER TABLE `BlockedTeacher` DROP FOREIGN KEY `BlockedTeacher_blockedTeacherId_fkey`;

-- DropForeignKey
ALTER TABLE `BlockedTeacher` DROP FOREIGN KEY `BlockedTeacher_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_teacherId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityMessage` DROP FOREIGN KEY `CommunityMessage_communityId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityMessage` DROP FOREIGN KEY `CommunityMessage_senderId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityUser` DROP FOREIGN KEY `CommunityUser_communityId_fkey`;

-- DropForeignKey
ALTER TABLE `CommunityUser` DROP FOREIGN KEY `CommunityUser_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Conversation` DROP FOREIGN KEY `Conversation_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `Conversation` DROP FOREIGN KEY `Conversation_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Conversation` DROP FOREIGN KEY `Conversation_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ConversationMessage` DROP FOREIGN KEY `ConversationMessage_conversationId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ReviewVote` DROP FOREIGN KEY `ReviewVote_reviewId_fkey`;

-- DropForeignKey
ALTER TABLE `ReviewVote` DROP FOREIGN KEY `ReviewVote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedSubject` DROP FOREIGN KEY `SavedSubject_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `SavedSubject` DROP FOREIGN KEY `SavedSubject_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Subject` DROP FOREIGN KEY `Subject_userId_fkey`;

-- DropIndex
DROP INDEX `BlockedTeacher_blockedTeacherId_fkey` ON `BlockedTeacher`;

-- DropIndex
DROP INDEX `Booking_studentId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `Booking_subjectId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `Booking_teacherId_fkey` ON `Booking`;

-- DropIndex
DROP INDEX `CommunityMessage_communityId_fkey` ON `CommunityMessage`;

-- DropIndex
DROP INDEX `CommunityMessage_senderId_fkey` ON `CommunityMessage`;

-- DropIndex
DROP INDEX `CommunityUser_communityId_fkey` ON `CommunityUser`;

-- DropIndex
DROP INDEX `CommunityUser_userId_fkey` ON `CommunityUser`;

-- DropIndex
DROP INDEX `Conversation_clientId_fkey` ON `Conversation`;

-- DropIndex
DROP INDEX `Conversation_subjectId_fkey` ON `Conversation`;

-- DropIndex
DROP INDEX `Conversation_userId_fkey` ON `Conversation`;

-- DropIndex
DROP INDEX `ConversationMessage_conversationId_fkey` ON `ConversationMessage`;

-- DropIndex
DROP INDEX `Report_subjectId_fkey` ON `Report`;

-- DropIndex
DROP INDEX `Report_userId_fkey` ON `Report`;

-- DropIndex
DROP INDEX `ReviewVote_reviewId_fkey` ON `ReviewVote`;

-- DropIndex
DROP INDEX `SavedSubject_userId_fkey` ON `SavedSubject`;

-- DropIndex
DROP INDEX `Subject_userId_fkey` ON `Subject`;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationMessage` ADD CONSTRAINT `ConversationMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityUser` ADD CONSTRAINT `CommunityUser_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityUser` ADD CONSTRAINT `CommunityUser_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `Community`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_communityId_fkey` FOREIGN KEY (`communityId`) REFERENCES `Community`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunityMessage` ADD CONSTRAINT `CommunityMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSubject` ADD CONSTRAINT `SavedSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedSubject` ADD CONSTRAINT `SavedSubject_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedTeacher` ADD CONSTRAINT `BlockedTeacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlockedTeacher` ADD CONSTRAINT `BlockedTeacher_blockedTeacherId_fkey` FOREIGN KEY (`blockedTeacherId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
