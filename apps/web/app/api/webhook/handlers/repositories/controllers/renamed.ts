import { RepositoryRenamedWebhookPayload } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activityLogger';

export async function handleRepositoriesRenamedEvent(
  body: RepositoryRenamedWebhookPayload
): Promise<ControllerReturnType> {
  const { repository } = body;

  try {
    const repositoryInDb = await prisma.repository.findUnique({
      where: {
        github_repo_id: repository.id.toString(),
      },
    });

    if (!repositoryInDb) {
      return {
        statusCode: 404,
        success: false,
        message: 'Repository not found',
        error: 'Repository does not exist in the database',
      };
    }

    await prisma.repository.update({
      where: {
        github_repo_id: repository.id.toString(),
      },
      data: {
        name: repository.name,
      },
    });

    await logActivity({
      organizationId: repositoryInDb.organization_id,
      activityType: 'REPO_ADDED', // Using REPO_ADDED as there's no REPO_RENAMED type
      title: `Repository Renamed: ${repository.name}`,
      description: `Repository was renamed to ${repository.name}`,
      repositoryId: repositoryInDb.id,
      metadata: {
        oldName: repositoryInDb.name,
        newName: repository.name,
        githubRepoId: repository.id.toString(),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Repository renamed successfully',
    };
  } catch (error) {
    console.error('Error handling repository renamed event:', error);
    return {
      statusCode: 500,
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
