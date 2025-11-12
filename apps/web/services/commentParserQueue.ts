import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import { parseComment, formatPrompt, generateSecret } from '@/lib/utils';
import { CommentParsingResponse, Sender as GitHubUserType } from '@/interfaces';

interface CommentParseJobData {
  commentBody: string;
  prNumber: number;
  contributorGithubId: number;
  commentorGithubId: number;
  commentorId: string;
  repositoryGithubId: number;
  repositoryId: string;
}

export const commentParseQueue = new Queue<
  CommentParseJobData,
  boolean,
  string
>('COMMENT-PARSE-QUEUE', {
  connection: bullMQRedisClient,
  defaultJobOptions: { attempts: 3 },
});

export const commentParseWorker = new Worker(
  'COMMENT-PARSE-QUEUE',
  async (job: Job<CommentParseJobData, boolean, string>) => {
    console.log(`[Worker] Job ${job.id} started processing`);
    console.log(
      '[Worker] Processing comment parse job for PR:',
      JSON.stringify(job.data)
    );

    const { commentBody, prNumber, repositoryId, commentorId } = job.data;

    console.log(
      'Processing comment parse job for PR:',
      JSON.stringify(job.data)
    );

    const prompt = formatPrompt(commentBody);
    let aiRaw: CommentParsingResponse;

    try {
      aiRaw = await parseComment(prompt);
      console.log('AI response:', JSON.stringify(aiRaw));
    } catch (err) {
      // ADD LOGGING OR STORE THIS ERROR IN DATABASE, AS THIS IS IMPORTANT PHASE OF THE FLOW
      console.error('AI returned invalid JSON', err);
      throw new Error('AI_PARSE_ERROR');
    }

    console.log("AI RESPONSE::::::::::", JSON.stringify(aiRaw));
    
    if (aiRaw) {
      const contributorFromGithub = (await fetch(
        `https://api.github.com/users/${aiRaw.contributor}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        }
      ).then((res) => res.json())) as unknown;

      console.log(
        'Contributor from GitHub:',
        JSON.stringify(contributorFromGithub)
      );

      if (!contributorFromGithub || (contributorFromGithub as any).message === 'Not Found') {
        throw new Error('CONTRIBUTOR_NOT_FOUND');
      }
      console.log('GENERATING SECRET');

      const secret = generateSecret();

      await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { github_id: contributorFromGithub.id.toString() },
        });
        const contributor = await tx.contributor.upsert({
          where: {
            github_id: contributorFromGithub.id.toString(),
          },
          update: {},
          create: {
            github_id: contributorFromGithub.id.toString(),
            ...(existingUser && { user_id: existingUser.id }),
          },
        });
        return await tx.reward.create({
          data: {
            pr_number: prNumber,
            secret,
            token_amount: aiRaw.reward.toString(),
            contributor: { connect: { id: contributor.id } },
            repository: { connect: { id: repositoryId } },
            issuer: { connect: { id: commentorId } },
            comment: commentBody,
          },
        });
      });
    }

    return true;

    // await onChainQueue.add('send-onchain', { rewardId: rewardRow.id }, {
    //   jobId: `onchain:${rewardRow.id}`,
    //   attempts: 5,
    //   backoff: { type: 'exponential', delay: 1000 },
    //   removeOnComplete: true,
    // });
  },
  { connection: bullMQRedisClient, autorun: true, concurrency: 5 }
);

// Add error handlers to the worker
commentParseWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

commentParseWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

commentParseWorker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

commentParseWorker.on('ready', () => {
  console.log('[Worker] Comment parse worker is ready');
});

commentParseWorker.on('active', (job) => {
  console.log(`[Worker] Job ${job.id} is now active`);
});
