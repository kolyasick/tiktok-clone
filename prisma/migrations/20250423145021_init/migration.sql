/*
  Warnings:

  - Made the column `url` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "preview" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "profileId" INTEGER NOT NULL,
    "randomSort" REAL NOT NULL DEFAULT 0.0,
    "statusId" INTEGER NOT NULL,
    "blockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Video_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Video_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Video" ("blockReason", "createdAt", "id", "isBlocked", "profileId", "randomSort", "statusId", "title", "updatedAt", "url") SELECT "blockReason", "createdAt", "id", "isBlocked", "profileId", "randomSort", "statusId", "title", "updatedAt", "url" FROM "Video";
DROP TABLE "Video";
ALTER TABLE "new_Video" RENAME TO "Video";
CREATE INDEX "Video_id_idx" ON "Video"("id");
CREATE INDEX "Video_randomSort_idx" ON "Video"("randomSort");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
