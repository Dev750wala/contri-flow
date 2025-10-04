/*
  Warnings:

  - Added the required column `owner_github_id` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Organization" DROP CONSTRAINT "Organization_owner_id_fkey";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "owner_github_id" TEXT NOT NULL,
ALTER COLUMN "owner_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
