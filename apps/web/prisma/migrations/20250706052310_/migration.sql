-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "github_id" TEXT NOT NULL,
    "wallet_address" TEXT,
    "sign_message_hash" TEXT,
    "installation_id" TEXT,
    "app_installed" BOOLEAN NOT NULL DEFAULT false,
    "app_uninstalled_at" TIMESTAMP(3),
    "suspended" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "github_repo_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_removed" BOOLEAN NOT NULL DEFAULT false,
    "removed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "github_id" TEXT NOT NULL,
    "wallet_address" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "owner_github_id" TEXT NOT NULL,
    "contributor_github_id" TEXT NOT NULL,
    "repo_github_id" TEXT NOT NULL,
    "pr_number" INTEGER NOT NULL,
    "secret" TEXT NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "amount_eth" DOUBLE PRECISION,
    "contributor_id" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "repository_id" TEXT,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_github_id_key" ON "User"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_installation_id_key" ON "User"("installation_id");

-- CreateIndex
CREATE INDEX "User_github_id_idx" ON "User"("github_id");

-- CreateIndex
CREATE INDEX "User_installation_id_idx" ON "User"("installation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_github_repo_id_key" ON "Repository"("github_repo_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_github_id_key" ON "Contributor"("github_id");

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_email_key" ON "Contributor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reward_owner_github_id_repo_github_id_pr_number_key" ON "Reward"("owner_github_id", "repo_github_id", "pr_number");

-- AddForeignKey
ALTER TABLE "Repository" ADD CONSTRAINT "Repository_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "Contributor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "Repository"("id") ON DELETE SET NULL ON UPDATE CASCADE;
