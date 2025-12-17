import { MemberEventInterface } from '@/interfaces';
import { ControllerReturnType } from '../../interface';
import { handleMemberAddedEvent } from './controllers/added';
import { handleMemberEditedEvent } from './controllers/edited';
import { handleMemberRemovedEvent } from './controllers/removed';

export async function handleMemberEvent(
  body: MemberEventInterface
): Promise<ControllerReturnType> {
  switch (body.action) {
    case 'added':
      return await handleMemberAddedEvent(body);
    case 'edited':
      return await handleMemberEditedEvent(body);
    case 'removed':
      return await handleMemberRemovedEvent(body);
    
    default:
      return {
        statusCode: 200,
        success: true,
        message: `Member action '${body.action}' is not handled, but webhook received successfully`,
        data: null,
      };
  }
}



  
// MISTAKE. MAYBE FORGOT THAT SENDER AND REQUESTER ARE DIFFERNET. SEE CREATED , EDITED ADN DELETED HANDKERS AGAIN.