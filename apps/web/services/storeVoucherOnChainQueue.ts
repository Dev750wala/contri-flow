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

export const onChainQueue = new Queue<CommentParseJobData, boolean, string>(
  'ONCHAIN-QUEUE',
  { connection: bullMQRedisClient }
);

// Initialize worker only when needed to avoid connection issues
let onChainWorker: Worker<CommentParseJobData, void, string> | null = null;

const getOnChainWorker = () => {
  if (!onChainWorker) {
    onChainWorker = new Worker(
      'ONCHAIN-QUEUE',
      async (job: Job<CommentParseJobData, void, string>) => {
        // TODO MAKE A WORKER TO PROCESS THIS JOB TO STORE THE VOUCHER ON THE CHAIN.
      },
      { connection: bullMQRedisClient }
    );
  }
  return onChainWorker;
};

export { getOnChainWorker };
