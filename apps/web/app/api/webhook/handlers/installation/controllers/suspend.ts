import { AppInstallationInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleInstallationSuspendedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation } = body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { installation_id: installation.id.toString() },
          { github_id: installation.suspended_by?.id.toString() },
        ],
      },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: 'User not found',
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { installation_id: null, suspended: true },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Installation suspended',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: 'Error handling installation suspended event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
