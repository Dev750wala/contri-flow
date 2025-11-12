import { IssueCommentEventInterface } from "@/interfaces";
import { handleIssueCommentCreated } from "./controllers/created";

export async function handleIssueCommentEvent(
  body: IssueCommentEventInterface
) {
    switch (body.action) {
        case 'created':
          console.log('Handling issue comment created event');
            return await handleIssueCommentCreated(body);
    }
}
