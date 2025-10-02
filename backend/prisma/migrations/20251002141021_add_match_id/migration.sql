/*
  Warnings:

  - Added the required column `matchId` to the `PlayerScore` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PlayerScore" DROP CONSTRAINT "PlayerScore_id_fkey";

-- AlterTable
ALTER TABLE "public"."PlayerScore" ADD COLUMN     "matchId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PlayerScore" ADD CONSTRAINT "PlayerScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
