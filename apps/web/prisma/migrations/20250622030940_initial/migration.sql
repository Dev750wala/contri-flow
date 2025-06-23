/*
  Warnings:

  - You are about to drop the column `username` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the column `voucherId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `Voucher` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ownerGithubId,repoGithubId,prNumber]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contributorGithubId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerGithubId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repoGithubId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secret` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_contributorId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_voucherId_fkey";

-- DropIndex
DROP INDEX "Reward_voucherId_key";

-- AlterTable
ALTER TABLE "Contributor" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "voucherId",
ADD COLUMN     "contributorGithubId" TEXT NOT NULL,
ADD COLUMN     "ownerGithubId" TEXT NOT NULL,
ADD COLUMN     "repoGithubId" TEXT NOT NULL,
ADD COLUMN     "secret" TEXT NOT NULL,
ALTER COLUMN "contributorId" DROP NOT NULL,
ALTER COLUMN "repositoryId" DROP NOT NULL;

-- DropTable
DROP TABLE "Voucher";

-- CreateIndex
CREATE UNIQUE INDEX "Reward_ownerGithubId_repoGithubId_prNumber_key" ON "Reward"("ownerGithubId", "repoGithubId", "prNumber");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_contributorId_fkey" FOREIGN KEY ("contributorId") REFERENCES "Contributor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
