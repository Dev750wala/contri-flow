import crypto from 'crypto';
import { NextResponse } from 'next/server';
import type { AppInstallationInterface } from '@/interfaces';
import { handleInstallationEvent } from './handlers/installation';
import { verifyGithubHookSignature } from '@/helpers';

export async function POST(request: Request) {
  const body = await request.json();

  let signatureVerified = await verifyGithubHookSignature(body);

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
      console.log('to be implemented.');

    default:
      break;
  }

  return NextResponse.json({ ...response }, { status: response?.statusCode });
}
