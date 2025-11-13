import { objectType } from 'nexus';
import { Context } from '../context';
import { OrganizationType } from './organization';
import { Organization } from '@prisma/client';


export const OrganizationWithDetailsType = objectType({
  name: 'OrganizationWithDetails',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('githubOrgId');
    t.nonNull.string('installationId');
    t.nonNull.boolean('appInstalled');
    t.nonNull.boolean('suspended');
    t.nonNull.string('ownerGithubId');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('owner', {
      type: 'User',
      description: 'Organization owner',
      resolve: async (parent: Organization, _args, ctx: Context) => {
        if (!parent.owner_id) return null;
        return await ctx.prisma.user.findUnique({
          where: { id: parent.owner_id },
        });
      },
    });

    t.nonNull.list.nonNull.field('repositories', {
      type: 'Repository',
      description: 'All repositories for this organization',
      resolve: async (parent: Organization, _args, ctx: Context) => {
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
