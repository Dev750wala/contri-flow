import { objectType } from 'nexus';
import { Context } from '../context';
import { OrganizationType } from './organization';
import { Organization } from '@prisma/client';


export const OrganizationWithDetailsType = objectType({
  name: 'OrganizationWithDetails',
  definition(t) {
    t.nonNull.string('id', {
      resolve: (parent: any) => parent.id,
    });
    t.nonNull.string('name', {
      resolve: (parent: any) => parent.name,
    });
    t.nonNull.string('githubOrgId', {
      resolve: (parent: any) => parent.github_org_id,
    });
    t.nonNull.string('installationId', {
      resolve: (parent: any) => parent.installation_id,
    });
    t.nonNull.boolean('appInstalled', {
      resolve: (parent: any) => parent.app_installed,
    });
    t.nonNull.boolean('suspended', {
      resolve: (parent: any) => parent.suspended,
    });
    t.nonNull.string('ownerGithubId', {
      resolve: (parent: any) => parent.owner_github_id,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
      resolve: (parent: any) => parent.created_at,
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
      resolve: (parent: any) => parent.updated_at,
    });

    t.field('owner', {
      type: 'User',
      description: 'Organization owner',
      resolve: async (parent: any, _args, ctx: Context) => {
        if (!parent.owner_id) return null;
        return await ctx.prisma.user.findUnique({
          where: { id: parent.owner_id },
        });
      },
    });

    t.nonNull.list.nonNull.field('repositories', {
      type: 'Repository',
      description: 'All repositories for this organization',
      resolve: async (parent: any, _args, ctx: Context) => {
        return await ctx.prisma.repository.findMany({
          where: { organization_id: parent.id },
        });
      },
    });
  },
});

export const OwnerDashboardDataType = objectType({
  name: 'OwnerDashboardData',
  description: 'Complete dashboard data for organization owner',
  definition(t) {
    t.nonNull.list.nonNull.field('organizations', {
      type: OrganizationWithDetailsType,
      description: 'List of organizations with basic details (fast)',
    });
  },
});
