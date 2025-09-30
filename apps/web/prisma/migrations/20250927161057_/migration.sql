/*
  Warnings:

  - Added the required column `comment` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "comment" TEXT NOT NULL;
