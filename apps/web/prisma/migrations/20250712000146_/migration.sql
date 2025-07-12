/*
  Warnings:

  - The `role` column on the `OrganizationMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `RepositoryMaintainer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RepositoryRole" AS ENUM ('ADMIN', 'MAINTAINER', 'TRIAGE');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'MEMBER');

-- AlterTable
ALTER TABLE "OrganizationMember" DROP COLUMN "role",
ADD COLUMN     "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "RepositoryMaintainer" DROP COLUMN "role",
ADD COLUMN     "role" "RepositoryRole" NOT NULL DEFAULT 'MAINTAINER';
