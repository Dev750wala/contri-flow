import { MemberEventInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleMemberAddedEvent(
  body: MemberEventInterface
): Promise<ControllerReturnType> {
  const { member, repository } = body;

  try {
    // the user who is being added as a member might not exist in the user table yet, so we will just check if they exist.
    const user = await prisma.user.findUnique({
      where: { github_id: member.id.toString() },
    });

    const newMaintainer = await prisma.repositoryMaintainer.create({
      data: {
        repository: {
          connect: { github_repo_id: repository.id.toString() },
        },
        ...(user && {
          user: {
            connect: { id: user.id.toString() },
          },
        }),
        github_id: member.id.toString(),
        role: 'MAINTAINER',
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
