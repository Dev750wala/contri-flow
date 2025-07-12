import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.typeName;
    t.nonNull.string('name');
    t.nonNull.string('email');
    t.nonNull.string('github_id');
    t.string('wallet_address');
    t.list.field('repositories', {
      type: 'Repository',
      resolve: async (parent, _args, ctx: Context) => {
        return ctx.prisma.repository.findMany({
          where: {
            organization_id: parent.id,
          },
        });
      },
    });
    t.string('signMessageHash');
    t.string('installation_id');
    t.nonNull.string('created_at');
    t.nonNull.string('updated_at');
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: 'User',
      args: {
        github_id: nonNull(stringArg()),
      },
      resolve: async (_parent, args: { github_id: string }, ctx: Context) => {
        return ctx.prisma.user.findUnique({
          where: {
            github_id: args.github_id,
          },
        });
      },
    });
    t.field('me', {
      type: 'User',
      resolve: async (_parent, _args, ctx: Context) => {
        if (!ctx.token) {
          throw new Error('Not authenticated');
        }
        return ctx.prisma.user.findUnique({
          where: {
            id: ctx.token!.userId as string,
          },
        });
      },
    });
    t.list.field('allUsers', {
      type: 'User',
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        if (!args.token || args.token !== process.env.DEVELOPMENT_TOKEN) {
          throw new Error('Invalid or missing token');
        }
        return ctx.prisma.user.findMany();
      },
    });
  },
});
