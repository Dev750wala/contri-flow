import { objectType, extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';
import { Repository } from 'nexus-prisma';
import { OrganizationType } from './organization';
import { RewardType } from './reward';

export const RepositoryType = objectType({
  name: Repository.$name,
  description: Repository.$description,
  definition(t) {
    t.nonNull.field(Repository.id);
    t.nonNull.field(Repository.name);
    t.nonNull.field(Repository.github_repo_id);

    t.nonNull.field(Repository.is_removed);
    t.field(Repository.removed_at);

    t.nonNull.field(Repository.created_at);
    t.nonNull.field(Repository.updated_at);

    t.field('organization', {
      type: OrganizationType,
    });

    t.list.field('rewards', {
      type: RewardType,
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

    t.field('repositoryByGithubRepoId', {
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

    t.field('repositoriesByOrganizationId', {
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
  },
});
