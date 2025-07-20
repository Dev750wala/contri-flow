import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';
import { User } from 'nexus-prisma';
import { RepositoryMaintainerType } from './repository-maintainer';
import { ContributorType } from './contributor';

export const UserType = objectType({
  name: 'User',
  description: User.$description,
  definition(t) {
    t.nonNull.field(User.id);
    t.nonNull.field(User.name);
    t.field(User.email);
    t.nonNull.field(User.github_id);
    t.field(User.wallet_address);

    t.nonNull.field(User.created_at);
    t.nonNull.field(User.updated_at);

    t.list.field('maintenances', {
      type: RepositoryMaintainerType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.repositoryMaintainer.findMany({
          where: {
            user_id: parent.id,
          },
        });
      },
    });

    t.list.field('contributor', {
      type: ContributorType,
      resolve(parent, _args, ctx: Context) {
        return ctx.prisma.contributor.findMany({
          where: {
            user_id: parent.id,
          },
        });
      },
    });
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: 'User',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args: { id: string }, ctx: Context) => {
        return ctx.prisma.user.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    t.field('userByGithubId', {
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

    t.field('userByEmail', {
      type: 'User',
      args: {
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, args: { email: string }, ctx: Context) => {
        return ctx.prisma.user.findUnique({
          where: {
            email: args.email,
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
        if (!args.token || args.token !== config.DEVELOPMENT_TOKEN) {
          throw new Error('Invalid or missing token');
        }
        return ctx.prisma.user.findMany();
      },
    });
  },
});
