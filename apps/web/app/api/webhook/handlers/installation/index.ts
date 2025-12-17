import { AppInstallationInterface } from '@/interfaces';
import { ControllerReturnType } from '../../interface';
import {
  handleInstallationCreatedEvent,
  handleInstallationDeletedEvent,
  handleInstallationSuspendedEvent,
  handleInstallationUnsuspendedEvent,
} from './controllers';

export async function handleInstallationEvent(
  body: AppInstallationInterface
): Promise<ControllerReturnType> {
  switch (body.action) {
    case 'created':
      return await handleInstallationCreatedEvent(body);

    case 'deleted':
      return await handleInstallationDeletedEvent(body);

    case 'suspend':
      return await handleInstallationSuspendedEvent(body);

    case 'unsuspend':
      return await handleInstallationUnsuspendedEvent(body);

    default:
      return {
        statusCode: 200,
        success: true,
        message: `Installation action '${body.action}' is not handled, but webhook received successfully`,
        data: null,
      };
  }
}
