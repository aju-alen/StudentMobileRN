/*
  Warnings:

  - A unique constraint covering the columns `[subjectId,userId]` on the table `SavedSubject` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SavedSubject_subjectId_userId_key` ON `SavedSubject`(`subjectId`, `userId`);
