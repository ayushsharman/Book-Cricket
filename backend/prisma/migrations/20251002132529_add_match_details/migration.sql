/*
  Warnings:

  - Added the required column `oversPlayed` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRus` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wicketsLost` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Match` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Match" DROP CONSTRAINT "Match_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "oversPlayed" INTEGER NOT NULL,
ADD COLUMN     "totalRus" INTEGER NOT NULL,
ADD COLUMN     "wicketsLost" INTEGER NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."PlayerScore" (
    "id" SERIAL NOT NULL,
    "player" TEXT NOT NULL,
    "runs" INTEGER NOT NULL,
    "balls" INTEGER NOT NULL,

    CONSTRAINT "PlayerScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerScore" ADD CONSTRAINT "PlayerScore_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
