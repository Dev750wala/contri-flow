/*
  Warnings:

  - You are about to drop the column `amount_eth` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `amount_usd` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `tokenAmount` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "amount_eth",
DROP COLUMN "amount_usd",
ADD COLUMN     "tokenAmount" TEXT NOT NULL;
