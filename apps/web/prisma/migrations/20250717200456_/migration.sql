/*
  Warnings:

  - You are about to drop the `OrganizationMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMember" DROP CONSTRAINT "OrganizationMember_user_id_fkey";

-- DropTable
DROP TABLE "OrganizationMember";
