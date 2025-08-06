/*
  Warnings:

  - The values [MAINTAINER] on the enum `RepositoryRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RepositoryRole_new" AS ENUM ('ADMIN', 'MAINTAIN', 'READ', 'TRIAGE', 'WRITE');
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" TYPE "RepositoryRole_new" USING ("role"::text::"RepositoryRole_new");
ALTER TYPE "RepositoryRole" RENAME TO "RepositoryRole_old";
ALTER TYPE "RepositoryRole_new" RENAME TO "RepositoryRole";
DROP TYPE "RepositoryRole_old";
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" SET DEFAULT 'MAINTAIN';
COMMIT;

-- AlterTable
ALTER TABLE "RepositoryMaintainer" ALTER COLUMN "role" SET DEFAULT 'MAINTAIN';
