/*
  Warnings:

  - Added the required column `github_id` to the `RepositoryMaintainer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RepositoryMaintainer" ADD COLUMN     "github_id" TEXT NOT NULL;
