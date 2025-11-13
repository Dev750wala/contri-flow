import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { RepositoryMaintainerType } from '../types';
import { logActivity } from '@/lib/activityLogger';

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
        
        const newMaintainer = await ctx.prisma.repositoryMaintainer.create({
          data: {
            repository_id: repositoryId,
            user_id: userId,
            role,
            github_id: args.github_id,
          },
          include: {
            repository: {
              include: {
                organization: true,
              },
            },
            user: true,
          },
        });

        // Log activity for maintainer addition
        await logActivity({
          organizationId: newMaintainer.repository.organization.id,
          activityType: 'MAINTAINER_ADDED',
          title: `Maintainer Added: ${newMaintainer.user?.name || args.github_id}`,
          description: `${newMaintainer.user?.name || args.github_id} was added as ${role} maintainer for ${newMaintainer.repository.name}`,
          repositoryId: newMaintainer.repository_id,
          actorId: userId,
          actorName: newMaintainer.user?.name,
          metadata: {
            role: role,
            maintainerGithubId: args.github_id,
          },
        });

        return newMaintainer;
      },
    });

    t.field('removeRepositoryMaintainer', {
      type: 'Boolean',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_root, args, ctx: Context) => {
        const { id } = args;
        
        // Get maintainer info before deletion for logging
        const maintainer = await ctx.prisma.repositoryMaintainer.findUnique({
          where: { id },
          include: {
            repository: {
              include: {
                organization: true,
              },
            },
            user: true,
          },
        });

        if (!maintainer) {
          throw new Error('Maintainer not found');
        }

        await ctx.prisma.repositoryMaintainer.delete({
          where: { id },
        });

        // Log activity for maintainer removal
        await logActivity({
          organizationId: maintainer.repository.organization.id,
          activityType: 'MAINTAINER_REMOVED',
          title: `Maintainer Removed: ${maintainer.user?.name || maintainer.github_id}`,
          description: `${maintainer.user?.name || maintainer.github_id} was removed as maintainer from ${maintainer.repository.name}`,
          repositoryId: maintainer.repository_id,
          actorId: maintainer.user_id || undefined,
          actorName: maintainer.user?.name || undefined,
          metadata: {
            maintainerGithubId: maintainer.github_id,
          },
        });

        return true;
      },
    });
  },
});
