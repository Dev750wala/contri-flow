import { AppInstallationInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleInstallationCreatedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation, repositories, sender, requester } = body;

    // Ensure only organization installs are processed
    if (installation.account.type !== 'Organization') {
      return {
        statusCode: 400,
        success: false,
        message: 'Only organization installations are supported',
        error: 'Invalid account type',
      };
    }

    const githubOrgId = installation.account.id.toString();
    const installationId = installation.id.toString();

    const organization = await prisma.organization.upsert({
      where: { github_org_id: githubOrgId },
      update: {
        installation_id: installationId,
        app_installed: true,
        app_uninstalled_at: null,
        suspended: false,
        name: installation.account.login,
      },
      create: {
        github_org_id: githubOrgId,
        installation_id: installationId,
        name: installation.account.login,
        app_installed: true,
      },
    });

    if (requester) {
      await prisma.user.upsert({
        where: { github_id: requester.id.toString() },
        update: {
          name: requester.login,
        },
        create: {
          github_id: requester.id.toString(),
          name: requester.login,
        },
      });
    }
    // Ensure the sender exists in User table
    const user = await prisma.user.upsert({
      where: { github_id: sender.id.toString() },
      update: {
        name: sender.login,
      },
      create: {
        github_id: sender.id.toString(),
        name: sender.login,
      },
    });

    // Add sender as admin member of the org
    await prisma.organizationMember.upsert({
      where: {
        user_id_organization_id: {
          user_id: user.id,
          organization_id: organization.id,
        },
      },
      update: { role: 'OWNER' },
      create: {
        user_id: user.id,
        organization_id: organization.id,
        role: 'OWNER',
      },
    });

    // Add repositories
    const createdRepositories = await Promise.all(
      repositories.map(async (repo) => {
        return await prisma.repository.upsert({
          where: { github_repo_id: repo.id.toString() },
          update: {
            name: repo.name,
            organization_id: organization.id,
            is_removed: false,
            removed_at: null,
          },
          create: {
            name: repo.name,
            github_repo_id: repo.id.toString(),
            organization_id: organization.id,
          },
        });
      })
    );

    // Assign the sender as maintainer to all installed repositories
    await Promise.all(
      createdRepositories.map((repo) =>
        prisma.repositoryMaintainer.upsert({
          where: {
            repository_id_user_id: {
              repository_id: repo.id,
              user_id: user.id,
            },
          },
          update: { role: 'ADMIN' },
          create: {
            repository_id: repo.id,
            user_id: user.id,
            role: 'ADMIN',
          },
        })
      )
    );

    return {
      statusCode: 201,
      success: true,
      message: 'Installation created successfully',
      data: {
        organization_id: organization.id,
        repositories_count: createdRepositories.length,
        repositories: createdRepositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          github_repo_id: repo.github_repo_id,
        })),
      },
    };
  } catch (error) {
    console.error('Error handling installation created event:', error);
    return {
      statusCode: 500,
      success: false,
      message: 'Failed to process installation created event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
