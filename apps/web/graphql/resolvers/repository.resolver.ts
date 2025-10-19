import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';
import { RepositoryType } from '../types/repository';

export const RepositoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('repository', {
      type: RepositoryType,
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
      type: RepositoryType,
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
      type: RepositoryType,
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
      type: RepositoryType,
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


export const RepositoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('enableRewardOnRepository', {
      type: list(nonNull(RepositoryType)),
      args: {
        repositoryId: nonNull(list(nonNull(stringArg()))),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const { repositoryId } = args;
        try {
                  return ctx.prisma.repository.updateMany({
          where: {
            id: {
              in: repositoryId,
            },
          },
          data: {
            rewardsEnabled: true,
          },
        });

        } catch (error) {
          
        }
      },
    });
  },
});