-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('DEPOSIT', 'REWARD_ISSUED', 'REWARD_CLAIMED', 'PR_MERGED', 'ISSUE_CREATED', 'ISSUE_CLOSED', 'REPO_ADDED', 'REPO_REMOVED', 'REWARDS_ENABLED', 'REWARDS_DISABLED', 'MAINTAINER_ADDED', 'MAINTAINER_REMOVED', 'APP_INSTALLED', 'APP_UNINSTALLED', 'ORG_SUSPENDED', 'ORG_REACTIVATED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "repository_id" TEXT,
    "reward_id" TEXT,
    "actor_id" TEXT,
    "actor_name" TEXT,
    "amount" TEXT,
    "pr_number" INTEGER,
    "issue_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_organization_id_idx" ON "Activity"("organization_id");

-- CreateIndex
CREATE INDEX "Activity_activity_type_idx" ON "Activity"("activity_type");

-- CreateIndex
CREATE INDEX "Activity_created_at_idx" ON "Activity"("created_at");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
