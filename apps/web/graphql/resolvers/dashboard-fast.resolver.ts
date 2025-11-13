import { extendType, nonNull, stringArg, intArg } from 'nexus';
import { Context } from '../context';
import { ActivityType, OrganizationWithDetailsType, OwnerDashboardDataType, RewardType } from '../types';

export const DashboardFastQueries = extendType({
  type: 'Query',
  definition(t) {
    /**
     * Get all organizations for the logged-in owner with basic details
     * FAST - Simple query with relations
     */
    t.field('getOwnerDashboard', {
      type: OwnerDashboardDataType,
      description: 'Get all organizations owned by the current user (FAST query)',
      async resolve(_root, _args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const organizations = await ctx.prisma.organization.findMany({
          where: {
            owner_id: ctx.session.user.userId,
          },
          orderBy: {
            created_at: 'desc',
          },
        });

        return {
          organizations,
        };
      },
    });

    t.field('getOrganizationDetails', {
      type: OrganizationWithDetailsType,
      description: 'Get organization details by ID (FAST query)',
      args: {
        organizationId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const organization = await ctx.prisma.organization.findUnique({
          where: {
            id: args.organizationId,
            owner_id: ctx.session.user.userId, // Security: only owner can access
          },
        });

        if (!organization) {
          throw new Error('Organization not found or access denied');
        }

        return organization;
      },
    });

    /**
     * Get recent activities for an organization
     * FAST - Indexed query with limit
     */
    t.nonNull.list.nonNull.field('getOrganizationActivity', {
      type: ActivityType,
      description: 'Get recent activity logs for an organization (FAST query - indexed)',
      args: {
        organizationId: nonNull(stringArg()),
        limit: intArg({ default: 10 }),
        offset: intArg({ default: 0 }),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        // Verify ownership
        const organization = await ctx.prisma.organization.findUnique({
          where: {
            id: args.organizationId,
            owner_id: ctx.session.user.userId,
          },
        });

        if (!organization) {
          throw new Error('Organization not found or access denied');
        }

        // FAST - indexed by organization_id and created_at
        const activities = await ctx.prisma.activity.findMany({
          where: {
            organization_id: args.organizationId,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: args.limit || 10,
          skip: args.offset || 0,
        });

        return activities;
      },
    });

    t.nonNull.list.nonNull.field('getPendingRewards', {
      type: RewardType,
      description: 'Get pending (unclaimed but confirmed) rewards for an organization (FAST query)',
      args: {
        organizationId: nonNull(stringArg()),
        limit: intArg({ default: 10 }),
        offset: intArg({ default: 0 }),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        // Verify ownership
        const organization = await ctx.prisma.organization.findUnique({
          where: {
            id: args.organizationId,
            owner_id: ctx.session.user.userId,
          },
        });

        if (!organization) {
          throw new Error('Organization not found or access denied');
        }

        // FAST - Direct query on indexed columns
        const pendingRewards = await ctx.prisma.reward.findMany({
          where: {
            repository: {
              organization_id: args.organizationId,
            },
            claimed: false,
            confirmed: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: args.limit || 10,
          skip: args.offset || 0,
        });

        return pendingRewards;
      },
    });

    t.nonNull.list.nonNull.field('getRepositoryRewards', {
      type: RewardType,
      description: 'Get all rewards for a repository (FAST query)',
      args: {
        repositoryId: nonNull(stringArg()),
        limit: intArg({ default: 50 }),
        offset: intArg({ default: 0 }),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }

        const repository = await ctx.prisma.repository.findUnique({
          where: { id: args.repositoryId },
          include: { organization: true },
        });

        if (!repository || repository.organization.owner_id !== ctx.session.user.userId) {
          throw new Error('Repository not found or access denied');
        }

        const rewards = await ctx.prisma.reward.findMany({
          where: {
            repository_id: args.repositoryId,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: args.limit || 50,
          skip: args.offset || 0,
        });

        return rewards;
      },
    });
  },
});
