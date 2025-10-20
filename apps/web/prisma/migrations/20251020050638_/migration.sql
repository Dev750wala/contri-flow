/*
  Warnings:

  - You are about to drop the column `claimed_at` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `destination_address` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `tokenAmount` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `tx_hash` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `token_amount` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "claimed_at",
DROP COLUMN "destination_address",
DROP COLUMN "tokenAmount",
DROP COLUMN "tx_hash",
ADD COLUMN     "token_amount" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "source_chain" TEXT NOT NULL,
    "destination_chain" TEXT NOT NULL,
    "total_amount" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reward_id" TEXT NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_tx_hash_key" ON "Payout"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_reward_id_key" ON "Payout"("reward_id");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
