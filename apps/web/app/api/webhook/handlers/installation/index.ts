import { AppInstallationInterface } from '@/interfaces';
import {
  handleInstallationCreatedEvent,
  handleInstallationDeletedEvent,
  handleInstallationSuspendedEvent,
  handleInstallationUnsuspendedEvent,
} from './controllers';

export async function handleInstallationEvent(body: AppInstallationInterface) {
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
      break;
  }
}
