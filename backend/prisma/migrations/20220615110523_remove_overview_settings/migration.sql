/*
  Warnings:

  - You are about to drop the column `showActionPlan` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `showClosed` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `showFaq` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `showNotes` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `showOngoing` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `showOrgInfo` on the `UserSettings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "feedbackLifespan" TEXT NOT NULL
);
INSERT INTO "new_UserSettings" ("feedbackLifespan", "id", "userId") SELECT "feedbackLifespan", "id", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
