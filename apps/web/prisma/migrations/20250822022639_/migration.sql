/*
  Warnings:

  - You are about to drop the column `reward_issuer_github_id` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `repository_maintainer_id` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "reward_issuer_github_id",
ADD COLUMN     "repository_maintainer_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_repository_maintainer_id_fkey" FOREIGN KEY ("repository_maintainer_id") REFERENCES "RepositoryMaintainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
