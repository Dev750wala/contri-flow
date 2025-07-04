import { AppInstallationInterface } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';

export async function handleInstallationDeletedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation } = body;

    const user = await prisma.user.findFirst({
      where: {
        installation_id: installation.id.toString(),
      },
    });

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: 'User not found for this installation',
        error: 'No user associated with this installation ID',
      };
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        installation_id: null,
        app_uninstalled_at: new Date(),
        app_installed: false,
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Installation deleted successfully',
      data: {
        installationId: installation.id,
        userId: user.id,
      },
    };
  } catch (error) {
    console.error('Error handling installation deleted event:', error);
    return {
      success: false,
      statusCode: 500,
      message: 'Failed to process installation deleted event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
