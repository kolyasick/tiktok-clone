-- CreateIndex
CREATE INDEX "ActivationLink_userId_idx" ON "ActivationLink"("userId");

-- CreateIndex
CREATE INDEX "Block_userId_idx" ON "Block"("userId");

-- CreateIndex
CREATE INDEX "Chat_user1Id_idx" ON "Chat"("user1Id");

-- CreateIndex
CREATE INDEX "Chat_user2Id_idx" ON "Chat"("user2Id");

-- CreateIndex
CREATE INDEX "Follows_userId_idx" ON "Follows"("userId");

-- CreateIndex
CREATE INDEX "Follows_friendId_idx" ON "Follows"("friendId");

-- CreateIndex
CREATE INDEX "Like_videoId_idx" ON "Like"("videoId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Profile_name_idx" ON "Profile"("name");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Role_title_idx" ON "Role"("title");

-- CreateIndex
CREATE INDEX "Status_title_idx" ON "Status"("title");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");

-- CreateIndex
CREATE INDEX "Video_id_idx" ON "Video"("id");

-- CreateIndex
CREATE INDEX "Video_randomSort_idx" ON "Video"("randomSort");
