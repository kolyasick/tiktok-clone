/*
  Warnings:

  - You are about to drop the column `userId` on the `ActivationCode` table. All the data in the column will be lost.
  - Added the required column `email` to the `ActivationCode` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "ActivationCode_email_fkey" FOREIGN KEY ("email") REFERENCES "User" ("email") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActivationCode" ("code", "id") SELECT "code", "id" FROM "ActivationCode";
DROP TABLE "ActivationCode";
ALTER TABLE "new_ActivationCode" RENAME TO "ActivationCode";
CREATE UNIQUE INDEX "ActivationCode_code_key" ON "ActivationCode"("code");
CREATE UNIQUE INDEX "ActivationCode_email_key" ON "ActivationCode"("email");
CREATE INDEX "ActivationCode_email_idx" ON "ActivationCode"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
