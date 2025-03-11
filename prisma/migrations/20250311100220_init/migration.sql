/*
  Warnings:

  - Added the required column `until` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Block` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reason" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "until" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Block_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Block" ("id", "info", "reason", "userId") SELECT "id", "info", "reason", "userId" FROM "Block";
DROP TABLE "Block";
ALTER TABLE "new_Block" RENAME TO "Block";
CREATE UNIQUE INDEX "Block_userId_key" ON "Block"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
