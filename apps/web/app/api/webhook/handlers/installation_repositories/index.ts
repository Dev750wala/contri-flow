import { InstallationRepositories } from '@/interfaces';
import {
  handleRepositoriesAddedEvent,
  handleRepositoriesRemovedEvent,
} from './controllers';

export async function handleInstallationRespositoriesEvent(
  body: InstallationRepositories
) {
  switch (body.action) {
    case 'added':
      return await handleRepositoriesAddedEvent(body);

    case 'removed':
      return await handleRepositoriesRemovedEvent(body);
  }
}
