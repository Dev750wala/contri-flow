import { objectType, extendType, nonNull, stringArg, booleanArg } from 'nexus';
import { Organization } from 'nexus-prisma';
import { RepositoryType } from './repository';

export const OrganizationType = objectType({
  name: Organization.$name,
  description: Organization.$description,
  definition(t) {
    t.nonNull.field(Organization.id);
    t.nonNull.field(Organization.name);
    t.nonNull.field(Organization.github_org_id);
    t.nonNull.field(Organization.installation_id);
    t.nonNull.field(Organization.app_installed);
    t.field(Organization.app_uninstalled_at);
    t.nonNull.field(Organization.suspended);

    t.nonNull.field(Organization.created_at);
    t.nonNull.field(Organization.updated_at);

    // Relations
    t.list.field('repositories', {
      type: RepositoryType,
    });

    // t.list.field('members', {
    //   type: OrganizationMemberType,
    // });
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
