import { NextResponse } from 'next/server';
import type {
  AppInstallationInterface,
  InstallationRepositories,
  IssueCommentEventInterface,
  MemberEventInterface,
  RepositoryRenamedWebhookPayload,
} from '@/interfaces';
import {
  handleInstallationEvent,
  handleInstallationRespositoriesEvent,
  handleMemberEvent,
  handleRepositoriesEvent,
  handleIssueCommentEvent,
} from './handlers';
import { verifyGithubHookSignature } from '@/helpers';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const signatureVerified = await verifyGithubHookSignature(request, body);

    if (!signatureVerified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventType = request.headers.get('X-GitHub-Event');
    let response;

    switch (eventType) {
      case 'installation':
        response = await handleInstallationEvent(
          body as AppInstallationInterface
        );
        break;

      case 'installation_repositories':
        response = await handleInstallationRespositoriesEvent(
          body as InstallationRepositories
        );
        break;

      case 'repository':
        response = await handleRepositoriesEvent(
          body as RepositoryRenamedWebhookPayload
        );
        break;

      case 'member':
        response = await handleMemberEvent(body as MemberEventInterface);
        break;

      case 'issue_comment':
        response = await handleIssueCommentEvent(
          body as IssueCommentEventInterface
        );
        break;

      default:
        // Return success for unhandled event types to prevent GitHub from retrying
        response = {
          statusCode: 200,
          success: true,
          message: `Event type '${eventType}' is not handled, but webhook received successfully`,
          data: null,
        };
        break;
    }

    // Ensure response is always defined and has a valid statusCode
    if (!response || !response.statusCode) {
      response = {
        statusCode: 200,
        success: true,
        message: 'Webhook received successfully',
        data: null,
      };
    }

    return NextResponse.json({ ...response }, { status: response.statusCode });
  } catch (error) {
    // Handle JSON parsing errors and other exceptions
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        statusCode: 400,
        success: false,
        message: 'Invalid request body',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
