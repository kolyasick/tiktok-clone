/*
  Warnings:

  - You are about to drop the column `isFollowing` on the `Follows` table. All the data in the column will be lost.
  - You are about to drop the column `isFriend` on the `Follows` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Follows" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Follows_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Follows" ("createdAt", "friendId", "id", "status", "updatedAt", "userId") SELECT "createdAt", "friendId", "id", "status", "updatedAt", "userId" FROM "Follows";
DROP TABLE "Follows";
ALTER TABLE "new_Follows" RENAME TO "Follows";
CREATE UNIQUE INDEX "Follows_userId_friendId_key" ON "Follows"("userId", "friendId");
CREATE UNIQUE INDEX "Follows_friendId_userId_key" ON "Follows"("friendId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
