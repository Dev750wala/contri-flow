import { extendType, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { OrganizationType } from '../types';

export const OrganizationQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('organization', {
      type: 'Organization',
      args: {
        id: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        return await ctx.prisma.organization.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    t.field('organizationByGithubId', {
      type: 'Organization',
      args: {
        githubOrgId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        return await ctx.prisma.organization.findUnique({
          where: {
            github_org_id: args.githubOrgId,
          },
        });
      },
    });

    t.list.field('organizations', {
      type: 'Organization',
      async resolve(_root, _args, ctx: Context) {
        return await ctx.prisma.organization.findMany({
          where: {
            app_installed: true,
            suspended: false,
          },
        });
      },
    });

    t.list.field('listOrganizationsForOwner', {
      type: 'Organization',
      async resolve(_root, _args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }
        const orgs = await ctx.prisma.organization.findMany({
          where: {
            owner_id: ctx.session.user.userId,
          },
        });
        return orgs;
      },
    });
  },
});

export const OrganizationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('enableSyncMaintainers', {
      type: OrganizationType,
      args: {
        organizationId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        if (!ctx.session || !ctx.session.user || !ctx.session.user.userId) {
          throw new Error('Not authenticated');
        }
        const currentUser = await ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.userId },
        });
        if (!currentUser) {
          throw new Error('User not found');
        }

        return await ctx.prisma.organization.update({
          where: { id: args.organizationId },
          data: { sync_maintainers: true },
        });
      },
    });
  },
});
