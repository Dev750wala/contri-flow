/*
  Warnings:

  - You are about to drop the column `repository_maintainer_id` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `issuar_id` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_repository_maintainer_id_fkey";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "repository_maintainer_id",
ADD COLUMN     "issuar_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_issuar_id_fkey" FOREIGN KEY ("issuar_id") REFERENCES "RepositoryMaintainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
