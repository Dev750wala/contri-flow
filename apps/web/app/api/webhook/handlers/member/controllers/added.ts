import { MemberEventInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';
import { logActivity } from '@/lib/activityLogger';

export async function handleMemberAddedEvent(
  body: MemberEventInterface
): Promise<ControllerReturnType> {
  const { member, repository } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { github_id: member.id.toString() },
    });

    const newMaintainer = await prisma.repositoryMaintainer.create({
      data: {
        Repository: {
          connect: { github_repo_id: repository.id.toString() },
        },
        ...(user && {
          user: {
            connect: { id: user.id.toString() },
          },
        }),
        github_id: member.id.toString(),
        role: 'MAINTAIN',
      },
      include: {
        Repository: {
          include: {
            organization: true,
          },
        },
      },
    });

    await logActivity({
      organizationId: newMaintainer.Repository.organization.id,
      activityType: 'MAINTAINER_ADDED',
      title: `Maintainer Added: ${member.login}`,
      description: `${member.login} was added as maintainer for ${newMaintainer.Repository.name}`,
      repositoryId: newMaintainer.repository_id,
      actorId: member.id.toString(),
      actorName: member.login,
      metadata: {
        role: 'MAINTAIN',
        maintainerGithubId: member.id.toString(),
        maintainerLogin: member.login,
      },
    });

    return {
      statusCode: 200,
      message: 'Member added successfully',
      success: true,
      data: newMaintainer,
    };
  } catch (error) {
    console.error('Error handling member added event:', error);
    return {
      statusCode: 500,
      message: 'Internal Server Error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
