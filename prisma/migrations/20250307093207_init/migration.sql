/*
  Warnings:

  - Added the required column `statusId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reason" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Block_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "roleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "roleId", "updatedAt") SELECT "createdAt", "email", "id", "password", "roleId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "profileId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Video_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("createdAt", "id", "profileId", "title", "updatedAt", "url") SELECT "createdAt", "id", "profileId", "title", "updatedAt", "url" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Block_userId_key" ON "Block"("userId");
