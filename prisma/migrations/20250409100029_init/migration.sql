/*
  Warnings:

  - A unique constraint covering the columns `[profileId,videoId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Like_profileId_videoId_key" ON "Like"("profileId", "videoId");
