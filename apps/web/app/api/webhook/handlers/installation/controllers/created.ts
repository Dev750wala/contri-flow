import { AppInstallationInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';
import { logActivity, logActivities } from '@/lib/activityLogger';

export async function handleInstallationCreatedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation, repositories, sender, requester } = body;

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

    const owner = await prisma.user.upsert({
      where: { github_id: sender.id.toString() },
      update: { },
      create: {
        github_id: sender.id.toString(),
        name: sender.login,
      },
    });

    const organization = await prisma.organization.upsert({
      where: { github_org_id: githubOrgId },
      update: {
        installation_id: installationId,
        app_installed: true,
        app_uninstalled_at: null,
        suspended: false,
        name: installation.account.login,
        owner_github_id: sender.id.toString(),
        ...owner && { owner: { connect: { id: owner.id } } },
      },
      create: {
        github_org_id: githubOrgId,
        installation_id: installationId,
        name: installation.account.login,
        app_installed: true,
        owner_github_id: sender.id.toString(),
        owner: owner ? { connect: { id: owner.id } } : undefined,
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

    await Promise.all(
      createdRepositories.map(async (repo) => {
        const existingMaintainer = await prisma.repositoryMaintainer.findFirst({
          where: {
            repository_id: repo.id,
            user_id: user.id,
          },
        });

        if (existingMaintainer) {
          return await prisma.repositoryMaintainer.update({
            where: { id: existingMaintainer.id },
            data: { role: 'ADMIN' },
          });
        } else {
          return await prisma.repositoryMaintainer.create({
            data: {
              repository_id: repo.id,
              user_id: user.id,
              role: 'ADMIN',
              github_id: sender.id.toString(),
            },
          });
        }
      })
    );

    await logActivity({
      organizationId: organization.id,
      activityType: 'APP_INSTALLED',
      title: 'GitHub App Installed',
      description: `GitHub App was installed for ${organization.name} by ${sender.login}`,
      actorId: sender.id.toString(),
      actorName: sender.login,
      metadata: {
        installationId: installationId,
        repositoriesCount: createdRepositories.length,
      },
    });

    const repoActivities = createdRepositories.map((repo) => ({
      organizationId: organization.id,
      activityType: 'REPO_ADDED' as const,
      title: `Repository Added: ${repo.name}`,
      description: `Repository ${repo.name} was added to the organization`,
      repositoryId: repo.id,
      actorId: sender.id.toString(),
      actorName: sender.login,
      metadata: {
        githubRepoId: repo.github_repo_id,
        repoName: repo.name,
      },
    }));

    const maintainerActivities = createdRepositories.map((repo) => ({
      organizationId: organization.id,
      activityType: 'MAINTAINER_ADDED' as const,
      title: `Maintainer Added: ${sender.login}`,
      description: `${sender.login} was added as ADMIN maintainer for ${repo.name}`,
      repositoryId: repo.id,
      actorId: sender.id.toString(),
      actorName: sender.login,
      metadata: {
        role: 'ADMIN',
        maintainerGithubId: sender.id.toString(),
        maintainerLogin: sender.login,
      },
    }));

    await logActivities([...repoActivities, ...maintainerActivities]);

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
