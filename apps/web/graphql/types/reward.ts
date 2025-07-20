import { objectType, extendType, nonNull, stringArg, list } from 'nexus';
import { Context } from '../context';
import { Reward } from 'nexus-prisma';
import { RepositoryType } from './repository';
import { ContributorType } from './contributor';

export const RewardType = objectType({
  name: Reward.$name,
  description: Reward.$description,
  definition(t) {
    t.nonNull.field(Reward.id);
    t.nonNull.field(Reward.owner_github_id);
    t.nonNull.field(Reward.contributor_github_id);
    t.nonNull.field(Reward.repo_github_id);
    t.nonNull.field(Reward.pr_number);
    t.nonNull.field(Reward.secret);
    t.nonNull.field(Reward.amount_usd);
    t.nonNull.field(Reward.amount_eth);
    t.nonNull.field(Reward.created_at);
    t.nonNull.field(Reward.claimed);
    t.nonNull.field(Reward.claimed_at);
    t.nonNull.field(Reward.updated_at);
    
    t.field('repository', {
      type: RepositoryType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repository.findUnique({
          where: {
            github_repo_id: parent.repo_github_id,
          },
        });
      },
    });
    t.field('contributor', {
      type: ContributorType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.contributor.findUnique({
          where: {
            github_id: parent.contributor_github_id,
          },
        });
      },
    });
  },
});

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