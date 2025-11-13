import { InstallationRepositories } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';
import { logActivities } from '@/lib/activityLogger';

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
      const updatePromises = body.repositories_removed.map(async (repo) => {
        const repository = await tx.repository.findUnique({
          where: { github_repo_id: repo.id.toString() },
        });

        await tx.repository.updateMany({
          where: {
            github_repo_id: repo.id.toString(),
          },
          data: {
            is_removed: true,
            removed_at: new Date(),
          },
        });

        return repository;
      });

      return Promise.all(updatePromises);
    });

    // Log activities for repositories removed
    const activities = removedRepositories
      .filter((repo) => repo !== null)
      .map((repo) => ({
        organizationId: organization.id,
        activityType: 'REPO_REMOVED' as const,
        title: `Repository Removed: ${repo!.name}`,
        description: `Repository ${repo!.name} was removed from the organization`,
        repositoryId: repo!.id,
        metadata: {
          githubRepoId: repo!.github_repo_id,
          repoName: repo!.name,
          removedAt: new Date().toISOString(),
        },
      }));

    await logActivities(activities);

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
