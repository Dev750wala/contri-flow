/*
  Warnings:

  - You are about to drop the column `source_chain` on the `Payout` table. All the data in the column will be lost.
  - Added the required column `platform_fee` to the `Payout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "source_chain",
ADD COLUMN     "platform_fee" TEXT NOT NULL;
