import { IssueCommentEventInterface } from '@/interfaces';
import { ControllerReturnType } from '../../interface';
import { handleIssueCommentCreated } from './controllers/created';

export async function handleIssueCommentEvent(
  body: IssueCommentEventInterface
): Promise<ControllerReturnType> {
  switch (body.action) {
    case 'created':
      console.log('Handling issue comment created event');
      return await handleIssueCommentCreated(body);

    default:
      // Return success for unhandled actions to prevent GitHub from retrying
      return {
        statusCode: 200,
        success: true,
        message: `Issue comment action '${body.action}' is not handled, but webhook received successfully`,
        data: null,
      };
  }
}
