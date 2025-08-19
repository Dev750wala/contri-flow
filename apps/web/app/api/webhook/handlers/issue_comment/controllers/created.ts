import { IssueCommentEventInterface } from "@/interfaces";
import { ControllerReturnType } from "../../../interface";

export async function handleIssueCommentCreated(
  body: IssueCommentEventInterface
): Promise<ControllerReturnType> {
  const { comment: { body: commentBody, user: { login } } } = body
}
