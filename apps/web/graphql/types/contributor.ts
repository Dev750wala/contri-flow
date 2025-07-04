import { objectType, extendType, nonNull } from 'nexus';

export const Contributor = objectType({
  name: 'Contributor',
  description: 'A contributor to the project, identified by their GitHub ID.',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('github_id');
    t.string('wallet_address');
    t.nonNull.string('created_at');
    t.nonNull.string('updated_at');
    t.list.field('rewards', {
      type: 'Reward',
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.reward.findMany({
          where: {
            contributor_github_id: parent.github_id,
          },
        });
      },
    });
  },
});

export const ContributorQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('contributor', {
      type: 'Contributor',
      args: {
        github_id: nonNull('String'),
      },
      resolve: async (_parent, args, ctx) => {
        return ctx.prisma.contributor.findUnique({
          where: {
            github_id: args.github_id,
          },
        });
      },
    });
  },
});
