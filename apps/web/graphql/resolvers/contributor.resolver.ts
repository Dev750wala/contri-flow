import { extendType, nonNull, stringArg } from "nexus";
import { Context } from "../context";
import { ContributorType } from "../types";

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