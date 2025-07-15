import { RepositoryRenamedWebhookPayload } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';

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
