import { NextResponse } from 'next/server';
import type {
  AppInstallationInterface,
  InstallationRepositories,
  RepositoryRenamedWebhookPayload,
} from '@/interfaces';
import {
  handleInstallationEvent,
  handleInstallationRespositoriesEvent,
  handleRepositoriesEvent,
} from './handlers';
import { verifyGithubHookSignature } from '@/helpers';

export async function POST(request: Request) {
  const body = await request.json();

  let signatureVerified = await verifyGithubHookSignature(request, body);

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

    case 'installation_repositories':
      response = await handleInstallationRespositoriesEvent(
        body as InstallationRepositories
      );

    case 'repository':
      response = await handleRepositoriesEvent(
        body as RepositoryRenamedWebhookPayload
      );

    case 'member':
    // Handle member event if needed

    default:
      break;
  }

  return NextResponse.json({ ...response }, { status: response?.statusCode });
}
