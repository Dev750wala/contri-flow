import { InstallationRepositories } from '@/interfaces';
import { ControllerReturnType } from '../../interface';
import {
  handleRepositoriesAddedEvent,
  handleRepositoriesRemovedEvent,
} from './controllers';

export async function handleInstallationRespositoriesEvent(
  body: InstallationRepositories
): Promise<ControllerReturnType> {
  switch (body.action) {
    case 'added':
      return await handleRepositoriesAddedEvent(body);

    case 'removed':
      return await handleRepositoriesRemovedEvent(body);
    
    default:
      // Return success for unhandled actions to prevent GitHub from retrying
      return {
        statusCode: 200,
        success: true,
        message: `Installation repositories action '${body.action}' is not handled, but webhook received successfully`,
        data: null,
      };
  }
}
