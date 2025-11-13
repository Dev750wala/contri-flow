import { extendType, list, nonNull, objectType, stringArg } from 'nexus';
import { Context } from '../context';
import config from '@/config';
import { RepositoryType } from '../types/repository';
import { logActivities } from '@/lib/activityLogger';

export const repositoryMutationResponse = objectType({
  name: 'RepositoryMutationResponse',
  definition(t) {
    t.nonNull.boolean('success');
    t.nullable.string('error');  }
})

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
    t.field('enableRewardsOnRepository', {
      type: repositoryMutationResponse,
      args: {
        repositoryId: nonNull(list(nonNull(stringArg()))), // repos id should be provided of DB, not of github
      },
      resolve: async (_parent, args, ctx: Context) => {
        const { repositoryId } = args;
        try {
          // Fetch repositories to get organization info for activity logging
          const repositories = await ctx.prisma.repository.findMany({
            where: {
              id: { in: repositoryId },
            },
            include: {
              organization: true,
            },
          });

          const something = await ctx.prisma.repository.updateMany({
            where: {
              id: { in: repositoryId },
            },
            data: {
              enabled_rewards: true,
            },
          });
          console.log("something", something);

          // Log activities for rewards enabled
          const activities = repositories.map((repo) => ({
            organizationId: repo.organization.id,
            activityType: 'REWARDS_ENABLED' as const,
            title: `Rewards Enabled: ${repo.name}`,
            description: `Rewards were enabled for repository ${repo.name}`,
            repositoryId: repo.id,
            metadata: {
              repoName: repo.name,
              githubRepoId: repo.github_repo_id,
            },
          }));

          await logActivities(activities);
          

          return something.count > 0 ? { success: true, error: null } : { success: false, error: 'No repositories updated' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
    });
  },
});