import { extendType, nonNull, stringArg, list } from 'nexus';
import { Context } from '../context';
import { GlobalStatsType, OrganizationStatsType, RepositoryStatsType } from '../types';
import { getOrganizationBalance } from '@/lib/contractBalance';
import { formatEther } from 'viem';


export const DashboardStatsQueries = extendType({
  type: 'Query',
  definition(t) {

    t.field('getOrganizationStats', {
      type: OrganizationStatsType,
      description: 'Get aggregated statistics for an organization (SLOW query - use separately)',
      args: {
        organizationId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        // Verify ownership
        const organization = await ctx.prisma.organization.findUnique({
          where: {
            id: args.organizationId,
            owner_id: ctx.session.user.userId,
          },
        });

        if (!organization) {
          throw new Error('Organization not found or access denied');
        }

        const totalRepositories = await ctx.prisma.repository.count({
          where: {
            organization_id: args.organizationId,
          },
        });

        const activeRepositories = await ctx.prisma.repository.count({
          where: {
            organization_id: args.organizationId,
            enabled_rewards: true,
            is_removed: false,
          },
        });

        const allRewards = await ctx.prisma.reward.findMany({
          where: {
            repository: {
              organization_id: args.organizationId,
            },
          },
          select: {
            token_amount: true,
            claimed: true,
            confirmed: true,
            contributor_id: true,
          },
        });

        const claimedRewards = allRewards.filter((r) => r.claimed);
        const totalRewardsDistributed = claimedRewards.reduce(
          (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
          0
        );

        const pendingRewards = allRewards.filter((r) => !r.claimed && r.confirmed);
        const totalPendingAmount = pendingRewards.reduce(
          (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
          0
        );

        const uniqueContributors = new Set(allRewards.map((r) => r.contributor_id)).size;

        // Fetch actual balance from smart contract and convert to ETH
        const balanceInWei = await getOrganizationBalance(organization.github_org_id);
        const totalBalance = parseFloat(formatEther(balanceInWei));

        return {
          totalBalance,
          totalRepositories,
          activeRepositories,
          totalRewardsDistributed,
          totalRewardsClaimed: claimedRewards.length,
          totalRewardsPending: pendingRewards.length,
          totalPendingAmount,
          uniqueContributors,
        };
      },
    });

    t.field('getRepositoryStats', {
      type: RepositoryStatsType,
      description: 'Get aggregated statistics for a repository (SLOW query - use separately)',
      args: {
        repositoryId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const repository = await ctx.prisma.repository.findUnique({
          where: { id: args.repositoryId },
          include: { organization: true },
        });

        if (!repository || repository.organization.owner_id !== ctx.session.user.userId) {
          throw new Error('Repository not found or access denied');
        }

        const allRewards = await ctx.prisma.reward.findMany({
          where: {
            repository_id: args.repositoryId,
          },
          select: {
            token_amount: true,
            claimed: true,
            confirmed: true,
            contributor_id: true,
          },
        });

        const claimedRewards = allRewards.filter((r) => r.claimed);
        const totalDistributed = claimedRewards.reduce(
          (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
          0
        );

        const pendingRewards = allRewards.filter((r) => !r.claimed && r.confirmed);
        const pendingAmount = pendingRewards.reduce(
          (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
          0
        );

        const uniqueContributors = new Set(allRewards.map((r) => r.contributor_id)).size;

        const maintainerCount = await ctx.prisma.repositoryMaintainer.count({
          where: {
            repository_id: args.repositoryId,
          },
        });

        return {
          totalRewards: allRewards.length,
          totalDistributed,
          totalPending: pendingRewards.length,
          pendingAmount,
          uniqueContributors,
          maintainerCount,
        };
      },
    });


    t.field('getGlobalStats', {
      type: GlobalStatsType,
      description: 'Get aggregated statistics across all organizations owned by user (VERY SLOW query)',
      async resolve(_root, _args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const organizations = await ctx.prisma.organization.findMany({
          where: {
            owner_id: ctx.session.user.userId,
          },
          select: {
            id: true,
            github_org_id: true,
          },
        });

        const orgIds = organizations.map((o) => o.id);

        const totalRepositories = await ctx.prisma.repository.count({
          where: {
            organization_id: { in: orgIds },
          },
        });

        const totalActiveRepositories = await ctx.prisma.repository.count({
          where: {
            organization_id: { in: orgIds },
            enabled_rewards: true,
            is_removed: false,
          },
        });

        const allRewards = await ctx.prisma.reward.findMany({
          where: {
            repository: {
              organization_id: { in: orgIds },
            },
          },
          select: {
            token_amount: true,
            claimed: true,
            confirmed: true,
            contributor_id: true,
          },
        });

        const claimedRewards = allRewards.filter((r) => r.claimed);
        const totalRewardsDistributed = claimedRewards.reduce(
          (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
          0
        );

        const pendingRewards = allRewards.filter((r) => !r.claimed && r.confirmed);
        const totalContributors = new Set(allRewards.map((r) => r.contributor_id)).size;

        // Fetch total balance from smart contracts for all organizations
        const orgGithubIds = organizations.map((o) => o.github_org_id);
        const balancePromises = orgGithubIds.map((id) => getOrganizationBalance(id));
        const balances = await Promise.all(balancePromises);
        const totalBalance = balances.reduce(
          (sum, balanceInWei) => sum + parseFloat(formatEther(balanceInWei)),
          0
        );

        return {
          totalBalance,
          totalOrganizations: organizations.length,
          totalRepositories,
          totalActiveRepositories,
          totalContributors,
          totalRewardsDistributed,
          totalPendingRewards: pendingRewards.length,
        };
      },
    });

    t.nonNull.list.nonNull.field('getRepositoryStatsBatch', {
      type: RepositoryStatsType,
      description: 'Get stats for multiple repositories at once (SLOW query)',
      args: {
        repositoryIds: nonNull(list(nonNull(stringArg()))),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const repositoryIds = args.repositoryIds as string[];

        const repositories = await ctx.prisma.repository.findMany({
          where: {
            id: { in: repositoryIds },
            organization: {
              owner_id: ctx.session.user.userId,
            },
          },
          include: { organization: true },
        });

        if (repositories.length !== repositoryIds.length) {
          throw new Error('Some repositories not found or access denied');
        }

        const statsPromises = repositoryIds.map(async (repositoryId) => {
          const allRewards = await ctx.prisma.reward.findMany({
            where: { repository_id: repositoryId },
            select: {
              token_amount: true,
              claimed: true,
              confirmed: true,
              contributor_id: true,
            },
          });

          const claimedRewards = allRewards.filter((r) => r.claimed);
          const totalDistributed = claimedRewards.reduce(
            (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
            0
          );

          const pendingRewards = allRewards.filter((r) => !r.claimed && r.confirmed);
          const pendingAmount = pendingRewards.reduce(
            (sum, r) => sum + parseFloat(formatEther(BigInt(r.token_amount))),
            0
          );

          const uniqueContributors = new Set(allRewards.map((r) => r.contributor_id)).size;

          const maintainerCount = await ctx.prisma.repositoryMaintainer.count({
            where: { repository_id: repositoryId },
          });

          return {
            totalRewards: allRewards.length,
            totalDistributed,
            totalPending: pendingRewards.length,
            pendingAmount,
            uniqueContributors,
            maintainerCount,
          };
        });

        return await Promise.all(statsPromises);
      },
    });
  },
});
