import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { RewardType } from '../types';

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
        return ctx.prisma.reward.update({
          where: {
            id: args.id,
          },
          data: {
            claimed: true,
            claimed_at: new Date(),
          },
        });
      },
    });
  },
});
