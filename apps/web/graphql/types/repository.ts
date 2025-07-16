import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';

export const Repository = objectType({
  name: 'Repository',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('github_repo_id');
    t.nonNull.string('created_at');
    t.nonNull.string('updated_at');
    t.field('organization', {
      type: 'Organization',
      resolve: async (parent, _args, ctx: Context) => {
        return ctx.prisma.organization.findUnique({
          where: {
            id: parent.organization_id,
          },
        });
      },
    });
    t.list.field('rewards', {
      type: 'Reward',
      resolve: async (parent, args, ctx: Context) => {
        return ctx.prisma.reward.findMany({
          where: {
            repository_id: parent.id,
          },
        });
      },
    });
  },
});

export const RepositoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('repository', {
      type: 'Repository',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.repository.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });
    t.list.field('allRepositories', {
      type: 'Repository',
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        if (!args.token || args.token !== config.DEVELOPMENT_TOKEN) {
          throw new Error('Invalid or missing token');
        }
        return ctx.prisma.repository.findMany();
      },
    });
    t.field('repositoryByGithubId', {
      type: 'Repository',
      args: {
        githubRepoId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.repository.findUnique({
          where: {
            github_repo_id: args.githubRepoId,
          },
        });
      },
    });
    t.list.field('repositoriesByOrganizationId', {
      type: 'Repository',
      args: {
        organizationId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.repository.findMany({
          where: {
            organization_id: args.organizationId,
          },
        });
      },
    });
  },
});
