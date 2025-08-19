/*
  Warnings:

  - The values [READ,TRIAGE,WRITE] on the enum `RepositoryRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `contributor_github_id` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `owner_github_id` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `repo_github_id` on the `Reward` table. All the data in the column will be lost.
  - Added the required column `reward_issuer_github_id` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RepositoryRole_new" AS ENUM ('ADMIN', 'MAINTAIN');
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" TYPE "RepositoryRole_new" USING ("role"::text::"RepositoryRole_new");
ALTER TYPE "RepositoryRole" RENAME TO "RepositoryRole_old";
ALTER TYPE "RepositoryRole_new" RENAME TO "RepositoryRole";
DROP TYPE "RepositoryRole_old";
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" SET DEFAULT 'MAINTAIN';
COMMIT;

-- DropIndex
DROP INDEX "Reward_owner_github_id_repo_github_id_pr_number_key";

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "contributor_github_id",
DROP COLUMN "owner_github_id",
DROP COLUMN "repo_github_id",
ADD COLUMN     "reward_issuer_github_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "OrganizationRole";
