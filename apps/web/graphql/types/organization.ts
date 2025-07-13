import { objectType, extendType, nonNull, stringArg, booleanArg } from 'nexus';

export const Organization = objectType({
  name: 'Organization',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('github_org_id');
    t.nonNull.string('installation_id');
    t.nonNull.boolean('app_installed');
    t.string('app_uninstalled_at');
    t.nonNull.boolean('suspended');
    t.nonNull.string('created_at');
    t.nonNull.string('updated_at');
    
    // Relations
    t.list.field('repositories', {
      type: 'Repository',
      resolve(parent, _args, ctx) {
        return ctx.prisma.repository.findMany({
          where: {
            organization_id: parent.id,
            is_removed: false,
          },
        });
      },
    });
    
    t.list.field('members', {
      type: 'User',
      resolve(parent, _args, ctx) {
        return ctx.prisma.organizationMember.findMany({
          where: {
            organization_id: parent.id,
          },
          include: {
            user: true,
          },
        }).then((members: any[]) => members.map((member: any) => member.user));
      },
    });
  },
});

export const OrganizationQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('organization', {
      type: 'Organization',
      args: {
        id: nonNull(stringArg()),
      },
      resolve(_root, args, ctx) {
        return ctx.prisma.organization.findUnique({
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
      resolve(_root, args, ctx) {
        return ctx.prisma.organization.findUnique({
          where: {
            github_org_id: args.githubOrgId,
          },
        });
      },
    });
    
    t.list.field('organizations', {
      type: 'Organization',
      resolve(_root, _args, ctx) {
        return ctx.prisma.organization.findMany({
          where: {
            app_installed: true,
            suspended: false,
          },
        });
      },
    });
  },
});
