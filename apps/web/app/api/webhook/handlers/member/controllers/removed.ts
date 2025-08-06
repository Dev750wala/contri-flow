import { MemberEventInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleMemberRemovedEvent(
  body: MemberEventInterface
): Promise<ControllerReturnType> {
  const { member, repository } = body;

  try {
    const repositoryFromDB = await prisma.repository.findUnique({
      where: { github_repo_id: repository.id.toString() },
      select: {
        maintainers: true,
      },
    });

    if (!repositoryFromDB) {
      return {
        statusCode: 404,
        message: 'Repository not found',
        success: false,
      };
    }

    const existingMaintainer = repositoryFromDB?.maintainers.find(
      (maintainer) => maintainer.github_id === member.id.toString()
    );

    if (!existingMaintainer) {
      return {
        statusCode: 404,
        message: 'Maintainer not found',
        success: false,
      };
    }

    await prisma.repositoryMaintainer.delete({
      where: {
        id: existingMaintainer.id,
      },
    });

    return {
      statusCode: 200,
      message: 'Member removed successfully',
      success: true,
    };
  } catch (error) {
    console.error('Error handling member removed event:', error);
    return {
      statusCode: 500,
      message: 'Internal Server Error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
