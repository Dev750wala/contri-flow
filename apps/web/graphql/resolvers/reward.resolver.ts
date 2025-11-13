import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { RewardType } from '../types';
import { logActivity } from '@/lib/activityLogger';

export const RewardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('reward', {
      type: 'Reward',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.reward.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    t.field('rewardsByContributor', {
      type: nonNull(list(nonNull(RewardType))),
      args: {
        contributorGithubId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const contributor = await ctx.prisma.contributor.findUnique({
          where: {
            github_id: args.contributorGithubId,
          },
        });
        if (!contributor) {
          throw new Error('Contributor not found');
        }
        return ctx.prisma.reward.findMany({
          where: {
            contributor_id: contributor.id,
          },
          include: {
            repository: true,
            contributor: true,
          },
        });
      },
    });

    t.field('rewardsByRepository', {
      type: nonNull(list(nonNull(RewardType))),
      args: {
        repoGithubId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const repository = await ctx.prisma.repository.findUnique({
          where: {
            github_repo_id: args.repoGithubId,
          },
        });
        if (!repository) {
          throw new Error('Repository not found');
        }
        return ctx.prisma.reward.findMany({
          where: {
            repository_id: repository.id,
          },
          include: {
            repository: true,
            contributor: true,
          },
        });
      },
    });
  },
});

export const RewardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('claimReward', {
      type: RewardType,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const reward = await ctx.prisma.reward.update({
          where: {
            id: args.id,
          },
          data: {
            claimed: true,
          },
          include: {
            repository: {
              include: {
                organization: true,
              },
            },
            contributor: {
              include: {
                user: true,
              },
            },
          },
        });

        // Log activity for reward claimed
        await logActivity({
          organizationId: reward.repository.organization.id,
          activityType: 'REWARD_CLAIMED',
          title: `Reward Claimed`,
          description: `Reward of ${reward.token_amount} tokens claimed for PR #${reward.pr_number}`,
          repositoryId: reward.repository_id,
          rewardId: reward.id,
          actorId: reward.contributor.user?.id,
          actorName: reward.contributor.user?.name,
          amount: reward.token_amount,
          prNumber: reward.pr_number,
          metadata: {
            contributorGithubId: reward.contributor.github_id,
          },
        });

        return reward;
      },
    });
  },
});
