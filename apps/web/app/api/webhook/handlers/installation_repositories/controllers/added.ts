import { InstallationRepositories } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleRepositoriesAddedEvent(
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

    const repositories = await prisma.$transaction(async (tx) => {
      const updatePromises = body.repositories_added.map((repo) =>
        tx.repository.upsert({
          where: {
            github_repo_id: repo.id.toString(),
          },
          update: {
            organization_id: organization.id,
            name: repo.full_name,
            is_removed: false,
            removed_at: null,
          },
          create: {
            organization_id: organization.id,
            name: repo.full_name,
            github_repo_id: repo.id.toString(),
            is_removed: false,
            removed_at: null,
          },
        })
      );

      return Promise.all(updatePromises);
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Repositories added successfully',
      data: {
        repositories: repositories.length,
      },
    };
  } catch (error) {
    console.error('Error handling repositories added event', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Error handling repositories added event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
