/*
  Warnings:

  - A unique constraint covering the columns `[repository_id,github_id]` on the table `RepositoryMaintainer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RepositoryMaintainer_repository_id_github_id_key" ON "RepositoryMaintainer"("repository_id", "github_id");
