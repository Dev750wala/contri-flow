/*
  Warnings:

  - You are about to drop the column `user_id` on the `Repository` table. All the data in the column will be lost.
  - You are about to drop the column `app_installed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `app_uninstalled_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `installation_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sign_message_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `suspended` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `Contributor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organization_id` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Made the column `repository_id` on table `Reward` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_repository_id_fkey";

-- DropIndex
DROP INDEX "User_installation_id_idx";

-- DropIndex
DROP INDEX "User_installation_id_key";

-- AlterTable
ALTER TABLE "Contributor" ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "user_id",
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" ALTER COLUMN "repository_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "app_installed",
DROP COLUMN "app_uninstalled_at",
DROP COLUMN "installation_id",
DROP COLUMN "sign_message_hash",
DROP COLUMN "suspended",
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "github_org_id" TEXT NOT NULL,
    "installation_id" TEXT NOT NULL,
    "app_installed" BOOLEAN NOT NULL DEFAULT false,
    "app_uninstalled_at" TIMESTAMP(3),
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryMaintainer" (
    "id" TEXT NOT NULL,
    "repository_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'maintainer',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryMaintainer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_github_org_id_key" ON "Organization"("github_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_installation_id_key" ON "Organization"("installation_id");

-- CreateIndex
CREATE INDEX "Organization_github_org_id_idx" ON "Organization"("github_org_id");

-- CreateIndex
CREATE INDEX "Organization_installation_id_idx" ON "Organization"("installation_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_user_id_organization_id_key" ON "OrganizationMember"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryMaintainer_repository_id_user_id_key" ON "RepositoryMaintainer"("repository_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_user_id_key" ON "Contributor"("user_id");

-- CreateIndex
CREATE INDEX "Repository_github_repo_id_idx" ON "Repository"("github_repo_id");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryMaintainer" ADD CONSTRAINT "RepositoryMaintainer_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryMaintainer" ADD CONSTRAINT "RepositoryMaintainer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contributor" ADD CONSTRAINT "Contributor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
