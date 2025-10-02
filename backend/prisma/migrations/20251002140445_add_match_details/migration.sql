/*
  Warnings:

  - You are about to drop the column `totalRus` on the `Match` table. All the data in the column will be lost.
  - Added the required column `totalRuns` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Match" DROP COLUMN "totalRus",
ADD COLUMN     "totalRuns" INTEGER NOT NULL;
