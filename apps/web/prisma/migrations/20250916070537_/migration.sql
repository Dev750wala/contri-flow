/*
  Warnings:

  - You are about to drop the column `issuar_id` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `issuer_id` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_issuar_id_fkey";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "issuar_id",
ADD COLUMN     "issuer_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "RepositoryMaintainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
