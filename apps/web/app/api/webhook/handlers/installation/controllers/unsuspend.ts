import { AppInstallationInterface } from '@/interfaces';
import prisma from '@/lib/prisma';
import { ControllerReturnType } from '../../../interface';

export async function handleInstallationUnsuspendedEvent(
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
      where: { id: organization.id },
      data: { suspended: false },
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Installation unsuspended',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      statusCode: 500,
      message: 'Error handling installation unsuspended event',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
