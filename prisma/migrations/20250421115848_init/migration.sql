-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivationCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ActivationCode" ("code", "createdAt", "email", "id") SELECT "code", "createdAt", "email", "id" FROM "ActivationCode";
DROP TABLE "ActivationCode";
ALTER TABLE "new_ActivationCode" RENAME TO "ActivationCode";
CREATE UNIQUE INDEX "ActivationCode_code_key" ON "ActivationCode"("code");
CREATE UNIQUE INDEX "ActivationCode_email_key" ON "ActivationCode"("email");
CREATE INDEX "ActivationCode_email_idx" ON "ActivationCode"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
