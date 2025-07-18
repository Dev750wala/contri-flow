import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Contributor } from 'nexus-prisma';
import { UserType } from './user';
import { Context } from "../context"
import { RewardType } from './reward';

export const ContributorType = objectType({
  name: Contributor.$name,
  description: Contributor.$description,
  definition(t) {
    t.nonNull.field(Contributor.id);
    t.nonNull.field(Contributor.github_id);
    t.field(Contributor.email);
    t.field(Contributor.wallet_address);

    t.nonNull.field(Contributor.created_at);
    t.nonNull.field(Contributor.updated_at);

    t.list.field('rewards', {
      type: RewardType,
    });

    t.field('user', {
      type: UserType,
    })
  },
});

export const ContributorQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('contributor', {
      type: ContributorType,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.contributor.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    t.field('contributorByGithubId', {
      type: ContributorType,
      args: {
        github_id: nonNull('String'),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.contributor.findUnique({
          where: {
            github_id: args.github_id,
          },
        });
      },
    });
  },
});


export const ContributorMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('linkContributorToUser', {
      type: ContributorType,
      args: {
        userId: nonNull(stringArg()),
        github_id: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { userId, github_id } = args;
        return ctx.prisma.contributor.update({
          where: {
            github_id,
          },
          data: {
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
      },
    });
  },
});