import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { RepositoryMaintainerType } from '../types';

export const RepositoryMaintainerQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('repositoryMaintainers', {
      type: nonNull(list(nonNull('RepositoryMaintainer'))),
      args: {
        repositoryId: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { repositoryId } = args;
        return ctx.prisma.repositoryMaintainer.findMany({
          where: { repository_id: repositoryId },
        });
      },
    });
  },
});

export const RepositoryMaintainerMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addRepositoryMaintainer', {
      type: nonNull(RepositoryMaintainerType),
      args: {
        repositoryId: nonNull(stringArg()),
        userId: nonNull(stringArg()),
        role: nonNull('RepositoryRole'),
        github_id: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { repositoryId, userId, role } = args;
        return ctx.prisma.repositoryMaintainer.create({
          data: {
            repository_id: repositoryId,
            user_id: userId,
            role,
            github_id: args.github_id,
          },
        });
      },
    });

    t.field('removeRepositoryMaintainer', {
      type: 'Boolean',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { id } = args;
        await ctx.prisma.repositoryMaintainer.delete({
          where: { id },
        });
        return true;
      },
    });
  },
});
