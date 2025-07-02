import crypto from 'crypto';

export async function verifyGithubHookSignature(request: Request) {
  const signature = request.headers.get('X-Hub-Signature-256');
  const body = await request.json();

  const hmac = crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex');
  const expectedSignature = `sha256=${hmac}`;

  return signature !== expectedSignature ? false : true;
}
