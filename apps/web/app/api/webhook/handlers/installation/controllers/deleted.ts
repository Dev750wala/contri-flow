import { AppInstallationInterface } from '@/interfaces';
import { ControllerReturnType } from '../../../interface';
import prisma from '@/lib/prisma';

export async function handleInstallationDeletedEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  try {
    const { installation } = body;

    const organization = await prisma.organization.findUnique({
      where: {
        installation_id: installation.id.toString(),
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

    await prisma.organization.update({
      where: {
        id: organization.id,
      },
      data: {
          app_uninstalled_at: new Date(),
          app_installed: false,
      },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Installation deleted successfully',
      data: {
        installation_id: installation.id,
        organization_id: organization.id,
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
