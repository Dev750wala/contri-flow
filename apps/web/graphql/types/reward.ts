import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';

export const Reward = objectType({
  name: 'Reward',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('owner_github_id');
    t.nonNull.string('contributor_github_id');
    t.nonNull.string('repo_github_id');
    t.nonNull.int('pr_number');
    t.nonNull.string('secret');
    t.nonNull.float('amount_usd');
    t.nonNull.float('amount_eth');
    t.nonNull.string('created_at');
    t.nonNull.boolean('claimed');
    t.nonNull.string('claimed_at');
    t.nonNull.string('updated_at');
    t.field('repository', {
      type: 'Repository',
      resolve: async (parent, _args, ctx: Context) => {
        return ctx.prisma.repository.findUnique({
          where: {
            id: parent.repository_id,
          },
        });
      },
    });
    t.field('contributor', {
      type: 'Contributor',
      resolve: async (parent, args, ctx: Context) => {
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
  },
});
