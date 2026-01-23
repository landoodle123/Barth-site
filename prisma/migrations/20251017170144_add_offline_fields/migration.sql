-- AlterTable
ALTER TABLE "public"."GameState" ADD COLUMN     "offlineClickerCost" BIGINT NOT NULL DEFAULT 500,
ADD COLUMN     "offlineClickerCount" BIGINT NOT NULL DEFAULT 0;
