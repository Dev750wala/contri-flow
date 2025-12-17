import { RepositoryRenamedWebhookPayload } from '@/interfaces';
import { ControllerReturnType } from '../../interface';
import { handleRepositoriesRenamedEvent } from './controllers';

export async function handleRepositoriesEvent(
  body: RepositoryRenamedWebhookPayload
): Promise<ControllerReturnType> {
  switch (body.action) {
    case 'renamed':
      return await handleRepositoriesRenamedEvent(body);
    
    default:
      return {
        statusCode: 200,
        success: true,
        message: `Repository action '${body.action}' is not handled, but webhook received successfully`,
        data: null,
      };
  }
}
