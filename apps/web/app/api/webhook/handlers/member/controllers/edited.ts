import { MemberEditedChanges, MemberEventInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleMemberEditedEvent(
  body: MemberEventInterface
): Promise<ControllerReturnType> {
  const { member, repository, changes: roleChange } = body;

  try {
    const user = await prisma.user.findUnique({
      where: { github_id: member.id.toString() },
    });

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

    // let deletedMaintainer;
    // // delete the existing maintainer if the maintainer role is being removed, might change later.
    // if ((roleChange as MemberEditedChanges).permission.to === "maintain") {
    //     deletedMaintainer = await prisma.repositoryMaintainer.delete({
    //         where: {
    //             id: existingMaintainer.id
    //         }
    //     })
    // }

    let updatedMaintainer;
    updatedMaintainer = await prisma.repositoryMaintainer.update({
      where: {
        id: existingMaintainer.id,
      },
      data: {
        role: (
          roleChange as MemberEditedChanges
        ).permission.to.toUpperCase() as any,
        ...(user && {
          user: {
            connect: { id: user.id.toString() },
          },
        }),
      },
    });

    return {
      statusCode: 200,
      message: 'Member edited successfully',
      success: true,
      data: { updatedMaintainer },
    };
  } catch (error) {
    console.error('Error handling member edited event:', error);
    return {
      statusCode: 500,
      message: 'Internal Server Error',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
