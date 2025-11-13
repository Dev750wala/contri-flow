/*
  Warnings:

  - Added the required column `signature_hash` to the `Payout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "signature_hash" TEXT NOT NULL;
