import { AppInstallationInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleInstallationCreatedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation, repositories, sender } = body;

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: {
        github_id: sender.id.toString(),
      },
    });

    if (!user) {
      return {
        statusCode: 404,
        success: false,
        message: 'User not found in database',
        error: 'User must be registered before installing the app',
      };
    }

    // Update user's installation ID
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        installation_id: installation.id.toString(),
        app_installed: true,
        app_uninstalled_at: null,
      },
    });

    // Add repositories to the database
    const createdRepositories = await Promise.all(
      repositories.map(async (repo) => {
        return await prisma.repository.upsert({
          where: { github_repo_id: repo.id.toString() },
          update: {
            name: repo.name,
            user_id: user.id,
          },
          create: {
            name: repo.name,
            github_repo_id: repo.id.toString(),
            user_id: user.id,
          },
        });
      })
    );

    return {
      statusCode: 201,
      success: true,
      message: 'Installation created successfully',
      data: {
        installation_id: installation.id,
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
