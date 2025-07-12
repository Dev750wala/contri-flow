import { InstallationRepositories } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleRepositoriesRemovedEvent(
  body: InstallationRepositories
): Promise<ControllerReturnType> {
  try {
    const organization = await prisma.organization.findFirst({
      where: {
        installation_id: body.installation.id.toString(),
      },
    });

    if (!organization) {
      return {
        success: false,
        statusCode: 404,
        message: 'Organization not found for this installation',
        error: 'No organization associated with this installation ID',
      };
    }

    const removedRepositories = await prisma.$transaction(async (tx) => {
      const updatePromises = body.repositories_removed.map((repo) =>
        tx.repository.updateMany({
          where: {
            github_repo_id: repo.id.toString(),
          },
          data: {
            is_removed: true,
            removed_at: new Date(),
          },
        })
      );

      return Promise.all(updatePromises);
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Repositories removed successfully',
      data: {
        updatedCount: removedRepositories.length,
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
