import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import { formatEther } from 'viem';
import nodemailer from 'nodemailer';

interface OwnerEmailJobData {
  organizationId: string;
  organizationName: string;
  organizationGithubId: string;
  ownerGithubId: string;
  ownerEmail?: string;
  availableFunds: string;
  requiredAmount: string;
  prNumber: number;
  repositoryName: string;
  contributorLogin: string;
  reason: 'INSUFFICIENT_FUNDS' | 'LOW_BALANCE_WARNING';
  metadata?: {
    rewardAmount?: string;
    timestamp?: string;
  };
}

// Create queue - simple and direct
export const ownerEmailQueue = new Queue<OwnerEmailJobData, boolean, string>(
  'OWNER-EMAIL-QUEUE',
  {
    connection: bullMQRedisClient,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600,
      },
    },
  }
);

// Add job helper with deduplication
export async function addOwnerEmailJob(
  data: OwnerEmailJobData,
  priority: number = 5
): Promise<Job<OwnerEmailJobData, boolean, string> | null> {
  const jobId = `${data.organizationId}-${data.reason}-${Date.now()}`;
  const recentJobId = `${data.organizationId}-${data.reason}`;
  const rateLimitKey = `email-ratelimit:${recentJobId}`;

  try {
    // Rate limiting (1 email per hour per org per reason)
    const exists = await bullMQRedisClient.get(rateLimitKey);

    if (exists) {
      console.log(
        `[OwnerEmailQueue] Rate limit hit for ${recentJobId}, skipping email`
      );
      return null;
    }

    await bullMQRedisClient.set(rateLimitKey, '1', 'EX', 3600);

    const job = await ownerEmailQueue.add(data.reason, data, {
      jobId,
      priority,
      delay: 60000,
    });

    console.log(`[OwnerEmailQueue] Job ${job.id} added to queue`);
    return job;
  } catch (error) {
    console.error('[OwnerEmailQueue] Error adding job to queue:', error);
    return null;
  }
}

// Create worker - simple and direct
export const ownerEmailWorker = new Worker<OwnerEmailJobData, boolean, string>(
  'OWNER-EMAIL-QUEUE',
  async (job: Job<OwnerEmailJobData, boolean, string>) => {
        console.log(`[OwnerEmailWorker] Job ${job.id} started processing`);
        console.log(
          '[OwnerEmailWorker] Job data:',
          JSON.stringify(job.data, null, 2)
        );

        const {
          organizationId,
          organizationName,
          organizationGithubId,
          ownerGithubId,
          ownerEmail,
          availableFunds,
          requiredAmount,
          prNumber,
          repositoryName,
          contributorLogin,
          reason,
          metadata,
        } = job.data;

        try {
          // Fetch owner details from database
          let owner = await prisma.user.findUnique({
            where: { github_id: ownerGithubId },
            select: { id: true, name: true, email: true, github_id: true },
          });

          // If owner not found in DB, fetch from GitHub API
          if (!owner) {
            console.log(
              '[OwnerEmailWorker] Owner not found in DB, fetching from GitHub...'
            );
            const githubUser = await fetch(
              `https://api.github.com/user/${ownerGithubId}`,
              {
                headers: {
                  Accept: 'application/vnd.github+json',
                  Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
                },
              }
            ).then((res) => res.json());

            if (githubUser && !githubUser.message) {
              owner = {
                id: '',
                name: githubUser.name || githubUser.login,
                email: githubUser.email || ownerEmail || null,
                github_id: ownerGithubId,
              };
            }
          }

          if (!owner || !owner.email) {
            console.warn(
              '[OwnerEmailWorker] Owner email not available, cannot send notification',
              { organizationId, ownerGithubId }
            );
            // Log this event for tracking
            await prisma.activity.create({
              data: {
                organization_id: organizationId,
                activity_type: 'ORG_SUSPENDED', // Reuse or create new type
                title: 'Email Notification Failed',
                description: `Could not notify owner about ${reason} - email not available`,
                metadata: {
                  reason,
                  ownerGithubId,
                  prNumber,
                  repositoryName,
                },
              },
            });
            return false;
          }

          // Convert wei to ETH for human-readable amounts
          const availableFundsEth = formatEther(BigInt(availableFunds));
          const requiredAmountEth = formatEther(BigInt(requiredAmount));
          const shortfallEth = formatEther(
            BigInt(requiredAmount) - BigInt(availableFunds)
          );

          // Prepare email content based on reason
          let emailSubject: string;
          let emailBody: string;

          if (reason === 'INSUFFICIENT_FUNDS') {
            emailSubject = `🚨 Insufficient Funds - ${organizationName} on ContriFlow`;
            emailBody = generateInsufficientFundsEmail({
              ownerName: owner.name,
              organizationName,
              repositoryName,
              prNumber,
              contributorLogin,
              availableFunds: availableFundsEth,
              requiredAmount: requiredAmountEth,
              shortfall: shortfallEth,
              organizationGithubId,
            });
          } else {
            // LOW_BALANCE_WARNING
            emailSubject = `⚠️ Low Balance Warning - ${organizationName} on ContriFlow`;
            emailBody = generateLowBalanceWarningEmail({
              ownerName: owner.name,
              organizationName,
              availableFunds: availableFundsEth,
              organizationGithubId,
            });
          }

          // Send email using your email service
          // TODO: Implement actual email sending with your preferred service
          // Examples: Resend, SendGrid, NodeMailer, AWS SES, etc.
          const emailSent = await sendEmail({
            to: owner.email,
            subject: emailSubject,
            html: emailBody,
          });

          if (emailSent) {
            console.log(
              `[OwnerEmailWorker] ✅ Email sent successfully to ${owner.email}`,
              { jobId: job.id, organizationId, reason }
            );

            // Log activity
            await prisma.activity.create({
              data: {
                organization_id: organizationId,
                activity_type: 'ORG_SUSPENDED', // Consider adding EMAIL_SENT type
                title: `${reason === 'INSUFFICIENT_FUNDS' ? 'Insufficient Funds' : 'Low Balance'} Notification Sent`,
                description: `Owner notified about ${reason.toLowerCase().replace('_', ' ')} for PR #${prNumber}`,
                metadata: {
                  reason,
                  prNumber,
                  repositoryName,
                  availableFunds: availableFundsEth,
                  requiredAmount: requiredAmountEth,
                  emailSent: true,
                },
                pr_number: prNumber,
              },
            });

            return true;
          } else {
            throw new Error('Email sending failed');
          }
        } catch (error) {
          console.error('[OwnerEmailWorker] Error processing job:', error);

          if (error instanceof Error) {
            console.error(`[OwnerEmailWorker] Error message: ${error.message}`);
            console.error(`[OwnerEmailWorker] Error stack: ${error.stack}`);
          }

          // Log failed attempt
          await prisma.activity.create({
            data: {
              organization_id: organizationId,
              activity_type: 'ORG_SUSPENDED',
              title: 'Email Notification Failed',
              description: `Failed to notify owner about ${reason}: ${error instanceof Error ? error.message : 'Unknown error'}`,
              metadata: {
                reason,
                prNumber,
                repositoryName,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
              pr_number: prNumber,
            },
          });

          throw error;
        }
      },
      {
        connection: bullMQRedisClient,
        autorun: true,
        concurrency: 2, // Process 2 emails in parallel
        lockDuration: 180000, // 3 minutes - email sending and DB operations
        lockRenewTime: 60000, // Renew lock every 1 minute
        limiter: {
          max: 10,
          duration: 60000,
        },
      }
  );

// Worker event listeners
ownerEmailWorker.on('completed', (job) => {
  console.log(`[OwnerEmailWorker] Job ${job.id} completed successfully`);
});

ownerEmailWorker.on('failed', (job, err) => {
  console.error(`[OwnerEmailWorker] Job ${job?.id} failed:`, err);
});

ownerEmailWorker.on('error', (err) => {
  console.error('[OwnerEmailWorker] Worker error:', err);
});

ownerEmailWorker.on('ready', () => {
  console.log('[OwnerEmailWorker] Owner email worker is ready');
});

ownerEmailWorker.on('active', (job) => {
  console.log(`[OwnerEmailWorker] Job ${job.id} is now active`);
});

// For backward compatibility
export function getOwnerEmailQueue() {
  return ownerEmailQueue;
}

export function getOwnerEmailWorker() {
  return ownerEmailWorker;
}

/**
 * Generate HTML email for insufficient funds notification
 */
function generateInsufficientFundsEmail(params: {
  ownerName: string;
  organizationName: string;
  repositoryName: string;
  prNumber: number;
  contributorLogin: string;
  availableFunds: string;
  requiredAmount: string;
  shortfall: string;
  organizationGithubId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert { background: #fee; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .stat-label { font-weight: 600; color: #666; }
    .stat-value { color: #333; font-weight: 500; }
    .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 Insufficient Funds Alert</h1>
    <p>Immediate action required for ${params.organizationName}</p>
  </div>
  <div class="content">
    <p>Hi ${params.ownerName},</p>
    
    <div class="alert">
      <strong>⚠️ Reward Processing Failed</strong>
      <p>We were unable to process a reward due to insufficient funds in your organization's balance.</p>
    </div>

    <div class="stats">
      <h3>📊 Transaction Details</h3>
      <div class="stat-row">
        <span class="stat-label">Organization:</span>
        <span class="stat-value">${params.organizationName}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Repository:</span>
        <span class="stat-value">${params.repositoryName}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Pull Request:</span>
        <span class="stat-value">#${params.prNumber}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Contributor:</span>
        <span class="stat-value">@${params.contributorLogin}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Required Amount:</span>
        <span class="stat-value">${params.requiredAmount} ETH</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Current Balance:</span>
        <span class="stat-value" style="color: #e53e3e;">${params.availableFunds} ETH</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Shortfall:</span>
        <span class="stat-value" style="color: #e53e3e; font-weight: 700;">${params.shortfall} ETH</span>
      </div>
    </div>

    <p><strong>What happens next?</strong></p>
    <ul>
      <li>The reward cannot be processed until you add funds</li>
      <li>The contributor will not be notified about the reward</li>
      <li>You can retry after depositing funds</li>
    </ul>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://contriflow.com'}/dashboard?org=${params.organizationGithubId}" class="cta">
        💰 Add Funds Now
      </a>
    </center>

    <p>Need help? Reply to this email or check our documentation.</p>

    <p>Best regards,<br>The ContriFlow Team</p>
  </div>
  <div class="footer">
    <p>ContriFlow - Reward Your Contributors</p>
    <p>This is an automated notification. You're receiving this because you're the owner of ${params.organizationName}.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email for low balance warning
 */
function generateLowBalanceWarningEmail(params: {
  ownerName: string;
  organizationName: string;
  availableFunds: string;
  organizationGithubId: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .cta { background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>⚠️ Low Balance Warning</h1>
    <p>${params.organizationName}</p>
  </div>
  <div class="content">
    <p>Hi ${params.ownerName},</p>
    
    <div class="warning">
      <strong>Your organization's balance is running low</strong>
      <p>Current balance: <strong>${params.availableFunds} ETH</strong></p>
    </div>

    <p>To ensure uninterrupted reward processing for your contributors, consider adding more funds soon.</p>

    <center>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://contriflow.com'}/dashboard?org=${params.organizationGithubId}" class="cta">
        View Dashboard
      </a>
    </center>

    <p>Best regards,<br>The ContriFlow Team</p>
  </div>
  <div class="footer">
    <p>ContriFlow - Reward Your Contributors</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Create NodeMailer transporter (singleton instance)
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email using NodeMailer SMTP
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  try {
    console.log('[Email Service] Preparing to send email to:', params.to);

    // Verify SMTP connection configuration
    await transporter.verify();
    console.log('[Email Service] SMTP server is ready to accept messages');

    // Send email
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'ContriFlow'}" <${process.env.EMAIL_FROM || 'notifications@contriflow.com'}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    console.log('[Email Service] ✅ Email sent successfully via SMTP');
    console.log('[Email Service] Message ID:', info.messageId);
    console.log('[Email Service] Response:', info.response);

    return true;
  } catch (error) {
    console.error('[Email Service] ❌ Error sending email:', error);

    if (error instanceof Error) {
      console.error('[Email Service] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }

    return false;
  }
}
