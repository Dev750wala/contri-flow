import { extendType, nonNull, objectType, stringArg } from 'nexus';
import { Context } from '../context';
import { OrganizationType, RepositoryMaintainerType, RepositoryType } from '../types';
import { createAppJWT } from '@/lib/utils';
import { logActivity } from '@/lib/activityLogger';

export const CheckInstallationData = objectType({
  name: 'CheckInstallationData',
  definition(t) {
    t.nullable.field('type', { type: 'String' });
    t.nonNull.list.nonNull.field('repositories', { type: RepositoryType });
    t.nullable.field('organization', { type: OrganizationType });
  },
});

export const CheckInstallationResponse = objectType({
  name: 'CheckInstallationResponse',
  definition(t) {
    t.nullable.field('error', { type: 'String' });
    t.nullable.field('data', { type: CheckInstallationData });
    t.nonNull.field("success", { type: "Boolean" });
  },
})

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
        console.log("HERE ARE THE ORGANIZATION FOR THE CURRENT USER: ", JSON.stringify(orgs));
        
        return orgs;
      },
    });

    t.field('checkInstallation', {
      type: CheckInstallationResponse,
      args: {
        installationId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx: Context) {
        const { installationId } = args;

        const appJwt = createAppJWT();

        // 1) installation details
        const instRes = await fetch(`https://api.github.com/app/installations/${installationId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${appJwt}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "ContriFlow-v2",
          },
        });
        if (!instRes.ok) {
          const body = await instRes.text();
          return {
            error: `failed to fetch installation: ${body}`,
            data: null,
            success: false
          };
        }
        const installation = await instRes.json();
        const account = installation.account;

        const reposForInstallation = await ctx.prisma.repository.findMany({
          where: {
            organization: {
              installation_id: installationId,
            }
          },
          include: {
            organization: true,
            maintainers: true,
          }
        });

        // const tokenRes = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${appJwt}`,
        //     Accept: "application/vnd.github+json",
        //     "User-Agent": "ContriFlow-v2",
        //   },
        // });
        // if (!tokenRes.ok) {
        //   const body = await tokenRes.text();
        //   return { error: "failed to create installation token", status: tokenRes.status, data: body, success: false };
        // }
        // const tokenData = await tokenRes.json();
        // const installationToken = tokenData.token as string;

        // const reposRes = await fetch(`https://api.github.com/installation/repositories`, {
        //   method: "GET",
        //   headers: {
        //     Authorization: `token ${installationToken}`,
        //     Accept: "application/vnd.github+json",
        //     "User-Agent": "ContriFlow-v2",
        //   },
        // });
        // if (!reposRes.ok) {
        //   const body = await reposRes.text();
        //   return { error: "failed to list repositories", status: reposRes.status, data: body, success: false };
        // }
        // const reposJson = await reposRes.json() as any[];

        return {
          error: null,
          data: {
            type: account?.type,
            repositories: reposForInstallation || [],
            organization: reposForInstallation.length > 0 ? reposForInstallation[0].organization : null,
          },
          success: true,
        };
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

        const updatedOrg = await ctx.prisma.organization.update({
          where: { id: args.organizationId },
          data: { sync_maintainers: true },
        });

        // Log activity for enabling maintainer sync
        await logActivity({
          organizationId: updatedOrg.id,
          activityType: 'APP_INSTALLED', // Using APP_INSTALLED as there's no specific type for this
          title: 'Maintainer Sync Enabled',
          description: `Automatic maintainer synchronization was enabled for the organization`,
          actorId: currentUser.id,
          actorName: currentUser.name,
          metadata: {
            feature: 'sync_maintainers',
            enabledBy: currentUser.github_id,
          },
        });

        return updatedOrg;
      },
    });
  },
});
