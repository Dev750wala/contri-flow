/*
  Warnings:

  - A unique constraint covering the columns `[repository_id,pr_number]` on the table `Reward` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reward_repository_id_pr_number_key" ON "Reward"("repository_id", "pr_number");
