import { extendType, list, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { RewardType } from "../types";

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
        return ctx.prisma.reward.findMany({
          where: {
            contributor_github_id: args.contributorGithubId,
          },
          include: {
            repository: true,
            contributor: true,
          },
        });
      }
    });

    t.field('rewardsByRepository', {
      type: nonNull(list(nonNull(RewardType))),
      args: {
        repoGithubId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.reward.findMany({
          where: {
            repo_github_id: args.repoGithubId,
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