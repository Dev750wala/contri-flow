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
        githubId: sender.id.toString(),
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
        installationId: installation.id.toString(),
      },
    });

    // Add repositories to the database
    const createdRepositories = await Promise.all(
      repositories.map(async (repo) => {
        return await prisma.repository.create({
          data: {
            name: repo.name,
            githubRepoId: repo.id.toString(),
            userId: user.id,
          },
        });
      })
    );

    return {
      statusCode: 201,
      success: true,
      message: 'Installation created successfully',
      data: {
        installationId: installation.id,
        repositoriesCount: createdRepositories.length,
        repositories: createdRepositories.map((repo) => ({
          id: repo.id,
          name: repo.name,
          githubRepoId: repo.githubRepoId,
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
