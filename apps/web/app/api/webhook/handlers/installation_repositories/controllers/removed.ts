import { InstallationRepositories } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleRepositoriesRemovedEvent(
  body: InstallationRepositories
): Promise<ControllerReturnType> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        installation_id: body.installation.id.toString(),
      },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: 'User not found',
        error: 'User not found',
      };
    }

    const repositories = await Promise.all(
      body.repositories_removed.map((repo) => {
        return prisma.repository.delete({
          where: {
            github_repo_id: repo.id.toString(),
          },
        });
      })
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Repositories removed successfully',
      data: {
        repositories: repositories.length,
      },
    };
  } catch (error) {
    console.error('Error handling repositories removed event', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Error handling repositories removed event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
