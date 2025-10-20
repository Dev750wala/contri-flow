/*
  Warnings:

  - You are about to drop the column `wallet_address` on the `Contributor` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contributor" DROP COLUMN "wallet_address";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "wallet_address";
