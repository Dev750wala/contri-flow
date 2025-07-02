import { AppInstallationInterface } from '@/interfaces';
import { handleInstallationCreatedEvent, handleInstallationDeletedEvent } from './controllers';

export async function handleInstallationEvent(body: AppInstallationInterface) {
  switch (body.action) {
    case 'created':
      return await handleInstallationCreatedEvent(body);

    case 'deleted':
      return await handleInstallationDeletedEvent(body);
    default:
      break;
  }
}
