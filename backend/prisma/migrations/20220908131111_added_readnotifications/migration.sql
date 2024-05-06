-- CreateTable
CREATE TABLE "UserReadNotification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    CONSTRAINT "UserReadNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserSettings" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "feedbackLifespan" TEXT NOT NULL,
    "readNotificationsClearedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_UserSettings" ("feedbackLifespan", "id", "userId") SELECT "feedbackLifespan", "id", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
