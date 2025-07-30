/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "GameState" (
    "userId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "amountGained" INTEGER NOT NULL DEFAULT 1,
    "clickerCount" INTEGER NOT NULL DEFAULT 0,
    "clickerCost" INTEGER NOT NULL DEFAULT 100,
    "multiplierCost" INTEGER NOT NULL DEFAULT 150,
    "clickerMultiplierCost" INTEGER NOT NULL DEFAULT 1000,
    "clickerGain" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameState_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "GameState" ADD CONSTRAINT "GameState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
