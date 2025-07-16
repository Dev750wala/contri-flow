import crypto from 'crypto';
import config from '@/config';

export async function verifyGithubHookSignature(request: Request, body: any) {
  const signature = request.headers.get('X-Hub-Signature-256');

  const hmac = crypto
    .createHmac('sha256', config.GITHUB_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  const expectedSignature = `sha256=${hmac}`;

  return signature !== expectedSignature ? false : true;
}
