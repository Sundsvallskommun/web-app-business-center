-- CreateTable
CREATE TABLE "UserSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "feedbackLifespan" TEXT NOT NULL,
    "showOrgInfo" BOOLEAN NOT NULL,
    "showOngoing" BOOLEAN NOT NULL,
    "showClosed" BOOLEAN NOT NULL,
    "showActionPlan" BOOLEAN NOT NULL,
    "showNotes" BOOLEAN NOT NULL,
    "showFaq" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
