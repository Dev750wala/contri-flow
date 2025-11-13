import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import { parseComment, formatPrompt, generateSecret } from '@/lib/utils';
import { CommentParsingResponse, Sender as GitHubUserType } from '@/interfaces';
import { onChainQueue } from './storeVoucherOnChainQueue';
import { Reward } from '@prisma/client';

interface CommentParseJobData {
  commentBody: string;
  prNumber: number;
  contributorGithubId: number;
  commentorGithubId: number;
  commentorId: string;
  repositoryGithubId: number;
  repositoryId: string;
}

interface OnChainJobData {
  prNumber: number;
  contributorGithubId: number;
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
    console.log('[Worker] Job data received:', JSON.stringify(job.data, null, 2));

    const { commentBody, prNumber, repositoryId, commentorId, repositoryGithubId, contributorGithubId } = job.data;

    console.log('[Worker] Extracted data:', {
      commentBody: commentBody.substring(0, 50) + '...',
      prNumber,
      repositoryId,
      commentorId,
      repositoryGithubId,
      contributorGithubId
    });

    const prompt = formatPrompt(commentBody);
    let aiRaw: CommentParsingResponse;

    try {
      console.log('[Worker] Sending prompt to AI for parsing...');
      aiRaw = await parseComment(prompt);
      console.log('[Worker] AI response received:', JSON.stringify(aiRaw));
    } catch (err) {
      // ADD LOGGING OR STORE THIS ERROR IN DATABASE, AS THIS IS IMPORTANT PHASE OF THE FLOW
      console.error('[Worker] AI returned invalid JSON or error:', err);
      throw new Error('AI_PARSE_ERROR');
    }

    console.log('[Worker] AI parsed successfully:', JSON.stringify(aiRaw));

    let newReward: Reward;
    if (aiRaw) {
      console.log('[Worker] Fetching contributor info from GitHub:', aiRaw.contributor);
      const contributorFromGithub = (await fetch(
        `https://api.github.com/users/${aiRaw.contributor}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        }
      ).then((res) => res.json())) as unknown;

      console.log('[Worker] Contributor fetched from GitHub:', {
        login: (contributorFromGithub as any).login,
        id: (contributorFromGithub as any).id,
        name: (contributorFromGithub as any).name
      });

      if (!contributorFromGithub || (contributorFromGithub as any).message === 'Not Found') {
        console.error('[Worker] Contributor not found on GitHub:', aiRaw.contributor);
        throw new Error('CONTRIBUTOR_NOT_FOUND');
      }
      
      console.log('[Worker] Generating secret for reward...');
      const secret = generateSecret();
      console.log('[Worker] Secret generated, creating reward in database...');

      newReward = await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { github_id: (contributorFromGithub as GitHubUserType).id.toString() },
        });
        
        console.log('[Worker] Existing user found:', existingUser ? existingUser.id : 'none');
        
        const contributor = await tx.contributor.upsert({
          where: {
            github_id: (contributorFromGithub as GitHubUserType).id.toString(),
          },
          update: {},
          create: {
            github_id: (contributorFromGithub as GitHubUserType).id.toString(),
            ...(existingUser && { user_id: existingUser.id }),
          },
        });
        
        console.log('[Worker] Contributor upserted:', contributor.id);
        
        const reward = await tx.reward.create({
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
        
        console.log('[Worker] Reward created successfully:', {
          id: reward.id,
          pr_number: reward.pr_number,
          token_amount: reward.token_amount
        });
        
        return reward;
      });
    }

    // Fetch repository with organization info to get orgGithubId
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { organization: true }
    });

    if (!repository || !repository.organization) {
      console.error('[Worker] Repository or organization not found:', { repositoryId });
      throw new Error('REPOSITORY_OR_ORGANIZATION_NOT_FOUND');
    }

    console.log('[Worker] Preparing on-chain job data:', {
      prNumber: newReward.pr_number,
      contributorGithubId: contributorGithubId,
      repositoryGithubId: repositoryGithubId,
      repositoryId: repositoryId,
      orgGithubId: repository.organization.github_org_id,
      rewardAmount: newReward.token_amount,
      rewardId: newReward.id
    });

    // Add job to on-chain queue with all required fields
    await onChainQueue.add('send-onchain', {
      prNumber: newReward.pr_number,
      contributorGithubId: contributorGithubId,
      repositoryGithubId: repositoryGithubId,
      repositoryId: repositoryId,
      orgGithubId: Number(repository.organization.github_org_id),
      rewardAmount: newReward.token_amount
    }, {
      jobId: `onchain-${newReward.id}`, // Changed from colon to hyphen
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
    });

    console.log('[Worker] On-chain job added successfully with ID:', `onchain-${newReward.id}`);
    
    return true;
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
