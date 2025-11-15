import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import { parseComment, formatPrompt, generateSecret, fetchWithRetry } from '@/lib/utils';
import { CommentParsingResponse, Sender as GitHubUserType } from '@/interfaces';
import { Reward } from '@prisma/client';
import {
  createWalletClient,
  http,
  createPublicClient,
  parseEther,
  keccak256,
  encodeAbiParameters,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { CONTRIFLOW_ADDRESS } from '@/web3/constants';
import CONTRIFLOW_ABI from '@/web3/ContriFlowABI.json';
import {
  postPRComment,
  generateRewardCommentContent,
} from '@/lib/githubComment';
import { logActivity } from '@/lib/activityLogger';
import { getOrganizationBalance } from '@/lib/contractBalance';
import { addOwnerEmailJob } from './ownerEmailQueue';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface CommentParseJobData {
  commentBody: string;
  prNumber: number;
  contributorGithubId: string;
  commentorGithubId: string;
  commentorId: string;
  repositoryGithubId: string;
  repositoryId: string;
  installationId: number;
}

// Viem clients for on-chain operations
let publicClient: any;
let walletClient: any;

function getClients() {
  if (!publicClient || !walletClient) {
    const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
    if (!PRIVATE_KEY) {
      throw new Error('PRIVATE_KEY environment variable is not set');
    }
    const account = privateKeyToAccount(PRIVATE_KEY);

    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });
  }
  return { publicClient, walletClient };
}

// Create queue - simple and direct
export const commentParseQueue = new Queue<CommentParseJobData, boolean, string>(
  'COMMENT-PARSE-QUEUE',
  {
    connection: bullMQRedisClient,
    defaultJobOptions: { attempts: 3 },
  }
);

// Create worker - simple and direct
export const commentParseWorker = new Worker<CommentParseJobData, boolean, string>(
  'COMMENT-PARSE-QUEUE',
  async (job: Job<CommentParseJobData, boolean, string>) => {
        console.log(`[Worker] Job ${job.id} started processing`);
        console.log(
          '[Worker] Job data received:',
          JSON.stringify(job.data, null, 2)
        );

        const {
          commentBody,
          prNumber,
          repositoryId,
          commentorId,
          repositoryGithubId,
          contributorGithubId,
          installationId,
        } = job.data;

        // Validate required fields
        if (
          !commentBody ||
          !prNumber ||
          !repositoryId ||
          !contributorGithubId
        ) {
          console.error('[Worker] Job data is missing required fields:', {
            hasCommentBody: !!commentBody,
            hasPrNumber: !!prNumber,
            hasRepositoryId: !!repositoryId,
            hasContributorGithubId: !!contributorGithubId,
            jobData: job.data,
          });
          throw new Error('INVALID_JOB_DATA: Missing required fields');
        }

        console.log('[Worker] Extracted data:', {
          commentBody: commentBody
            ? commentBody.substring(0, 50) + '...'
            : 'N/A',
          prNumber,
          repositoryId,
          commentorId,
          repositoryGithubId,
          contributorGithubId,
          installationId,
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
        if (!aiRaw) {
          console.log(
            '[Worker] No actionable data from AI, skipping reward creation.'
          );
          throw new Error('NO_ACTIONABLE_DATA');
        }
        console.log(
          '[Worker] Fetching contributor info from GitHub:',
          aiRaw.contributor
        );
        const contributorResponse = await fetchWithRetry(
          `https://api.github.com/users/${aiRaw.contributor}`,
          {
            headers: {
              Accept: 'application/vnd.github+json',
              'User-Agent': 'ContriFlow-Bot',
            },
          },
          3,
          10000
        );
        
        if (!contributorResponse.ok) {
          console.error(
            '[Worker] Failed to fetch contributor from GitHub:',
            contributorResponse.status,
            contributorResponse.statusText
          );
          throw new Error(`CONTRIBUTOR_FETCH_FAILED: ${contributorResponse.statusText}`);
        }
        
        const contributorFromGithub = (await contributorResponse.json()) as unknown;

        // Fetch repository with organization info early to check funds and use throughout
        let repository;
        try {
          repository = await prisma.repository.findUnique({
            where: { id: repositoryId },
            include: { organization: true },
          });
        } catch (error) {
          // Handle connection pool timeout errors
          if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2024'
          ) {
            console.error(
              '[Worker] Database connection pool timeout. This may indicate too many concurrent operations.',
              {
                jobId: job.id,
                repositoryId,
                error: error.message,
              }
            );
            // Re-throw to let BullMQ retry the job
            throw new Error(
              'DATABASE_CONNECTION_POOL_TIMEOUT: Please retry the job'
            );
          }
          throw error;
        }

        if (!repository || !repository.organization) {
          console.error('[Worker] Repository or organization not found:', {
            repositoryId,
          });
          throw new Error('REPOSITORY_OR_ORGANIZATION_NOT_FOUND');
        }

        // Convert organization GitHub ID to BigInt for contract calls
        const organizationGithubIdBigInt = BigInt(
          repository.organization.github_org_id
        );

        // Fetch organization balance from smart contract using centralized function
        const organizationFunds = await getOrganizationBalance(
          repository.organization.github_org_id
        );

        console.log('[Worker] Organization funds retrieved from contract:', {
          orgGithubId: repository.organization.github_org_id,
          availableFunds: organizationFunds.toString(),
          availableFundsFormatted: `${organizationFunds.toString()} wei`,
        });

        // Check if organization has sufficient funds for the reward
        const requiredAmount = parseEther(aiRaw.reward.toString());
        if (organizationFunds < requiredAmount) {
          console.error('[Worker] Insufficient funds for organization:', {
            orgGithubId: repository.organization.github_org_id,
            available: organizationFunds.toString(),
            required: requiredAmount.toString(),
          });

          // Send email notification to organization owner about insufficient funds
          await addOwnerEmailJob(
            {
              organizationId: repository.organization.id,
              organizationName: repository.organization.name,
              organizationGithubId: repository.organization.github_org_id,
              ownerGithubId: repository.organization.owner_github_id,
              availableFunds: organizationFunds.toString(),
              requiredAmount: requiredAmount.toString(),
              prNumber,
              repositoryName: repository.name,
              contributorLogin: aiRaw.contributor,
              reason: 'INSUFFICIENT_FUNDS',
              metadata: {
                rewardAmount: aiRaw.reward.toString(),
                timestamp: new Date().toISOString(),
              },
            },
            1 // High priority for insufficient funds
          );

          console.log('[Worker] Owner notification email job added to queue');

          throw new Error('INSUFFICIENT_ORGANIZATION_FUNDS');
        }

        console.log('[Worker] Contributor fetched from GitHub:', {
          login: (contributorFromGithub as any).login,
          id: (contributorFromGithub as any).id,
          name: (contributorFromGithub as any).name,
        });

        if (
          !contributorFromGithub ||
          (contributorFromGithub as any).message === 'Not Found'
        ) {
          console.error(
            '[Worker] Contributor not found on GitHub:',
            aiRaw.contributor
          );
          throw new Error('CONTRIBUTOR_NOT_FOUND');
        }

        console.log('[Worker] Generating secret for reward...');
        const secret = generateSecret();
        console.log(
          '[Worker] Secret generated, creating reward in database...'
        );

        // Convert reward amount to wei (18 decimals) for ERC20 standard precision
        const tokenAmountInWei = parseEther(aiRaw.reward.toString());
        console.log('[Worker] Token amount converted to wei:', {
          original: aiRaw.reward.toString(),
          wei: tokenAmountInWei.toString(),
          formatted: `${aiRaw.reward} tokens = ${tokenAmountInWei.toString()} wei`,
        });

        try {
          newReward = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
              where: {
                github_id: (
                  contributorFromGithub as GitHubUserType
                ).id.toString(),
              },
            });

            console.log(
              '[Worker] Existing user found:',
              existingUser ? existingUser.id : 'none'
            );

            const contributor = await tx.contributor.upsert({
              where: {
                github_id: (
                  contributorFromGithub as GitHubUserType
                ).id.toString(),
              },
              update: {},
              create: {
                github_id: (
                  contributorFromGithub as GitHubUserType
                ).id.toString(),
                ...(existingUser && { user_id: existingUser.id }),
              },
            });

            console.log('[Worker] Contributor upserted:', contributor.id);

            const reward = await tx.reward.create({
              data: {
                pr_number: prNumber,
                secret,
                token_amount: tokenAmountInWei.toString(), // Store as wei (18 decimals)
                contributor: { connect: { id: contributor.id } },
                repository: { connect: { id: repositoryId } },
                issuer: { connect: { id: commentorId } },
                comment: commentBody,
              },
            });

            console.log('[Worker] Reward created successfully:', {
              id: reward.id,
              pr_number: reward.pr_number,
              token_amount: reward.token_amount,
              token_amount_wei: `${reward.token_amount} wei (${aiRaw.reward} tokens)`,
            });

            return reward;
          }, {
            maxWait: 15000, // Max wait time to get connection (15s)
            timeout: 60000, // Max transaction execution time (60s) - reduced since we moved logActivity out
          });

          // Log activity after transaction completes (non-critical operation)
          await logActivity({
            organizationId: repository.organization.id,
            activityType: 'REWARD_ISSUED',
            title: `Reward Issued`,
            description: `Reward of ${aiRaw.reward} tokens (${newReward.token_amount} wei) issued for PR #${newReward.pr_number} to ${aiRaw.contributor}`,
            repositoryId: repository.id,
            rewardId: newReward.id,
            actorId: commentorId,
            amount: newReward.token_amount,
            prNumber: newReward.pr_number,
            metadata: {
              contributorGithubId: (
                contributorFromGithub as GitHubUserType
              ).id.toString(),
              contributorLogin: aiRaw.contributor,
              tokenAmountDecimal: aiRaw.reward.toString(),
            },
          }).catch(err => {
            // Don't fail the job if activity logging fails
            console.error('[Worker] Failed to log activity (non-critical):', err);
          });
        } catch (error) {
          if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2024'
          ) {
            console.error(
              '[Worker] Database connection pool timeout during transaction. This may indicate too many concurrent operations.',
              {
                jobId: job.id,
                repositoryId,
                prNumber,
                error: error.message,
              }
            );
            // Re-throw to let BullMQ retry the job
            throw new Error(
              'DATABASE_CONNECTION_POOL_TIMEOUT: Transaction failed, job will be retried'
            );
          }
          throw error;
        }

        console.log('[Worker] Starting on-chain voucher storage:', {
          prNumber: newReward.pr_number,
          contributorGithubId: contributorGithubId,
          repositoryGithubId: repositoryGithubId,
          repositoryId: repositoryId,
          orgGithubId: repository.organization.github_org_id,
          rewardAmount: newReward.token_amount,
          rewardId: newReward.id,
        });

        // Store voucher on-chain
        try {
          const secret = newReward.secret;
          console.log(
            `[Worker] Retrieved secret from reward for PR #${prNumber}`
          );

          // Token amount is already in wei (18 decimals) from database
          const tokenAmount = BigInt(newReward.token_amount);

          console.log(`[Worker] Token amount (already in wei):`, {
            storedInDatabase: newReward.token_amount,
            tokenAmount: tokenAmount.toString(),
            formatted: `${aiRaw.reward} tokens = ${tokenAmount.toString()} wei (18 decimals)`,
          });

          // Calculate the voucher hash exactly as the contract does
          // Contract uses abi.encode (padded), so we must match that layout
          const encodedData = encodeAbiParameters(
            [
              { type: 'string' },
              { type: 'uint64' },
              { type: 'uint32' },
              { type: 'uint32' },
              { type: 'uint64' },
              { type: 'uint256' },
            ],
            [
              secret,
              organizationGithubIdBigInt,
              Number(repositoryGithubId),
              prNumber,
              BigInt(contributorGithubId),
              tokenAmount,
            ]
          );

          const voucherHash = keccak256(encodedData);

          console.log(`[Worker] Voucher details:`, {
            orgGithubId: repository.organization.github_org_id,
            repoGithubId: repositoryGithubId,
            contributorGithubId,
            prNumber,
            tokenAmount: tokenAmount.toString(),
            hash: voucherHash,
            secret: '***hidden***',
          });

          // Get clients for on-chain operations
          const { publicClient, walletClient } = getClients();

          // Simulate the contract call to check if it will succeed
          const { request } = await publicClient.simulateContract({
            address: CONTRIFLOW_ADDRESS as `0x${string}`,
            abi: CONTRIFLOW_ABI,
            functionName: 'storeVoucher',
            args: [
              organizationGithubIdBigInt, // orgGithubId: uint64
              Number(repositoryGithubId), // repoGithubId: uint32
              BigInt(contributorGithubId), // contributorGithubId: uint64
              prNumber, // prNumber: uint32
              tokenAmount, // tokenAmountIn18dec: uint256
              voucherHash, // hash: bytes32
            ] as const,
            account: walletClient.account,
          });

          // Write the transaction to the blockchain
          const hash = await walletClient.writeContract(request);
          console.log(`[Worker] Transaction sent with hash: ${hash}`);

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
          });

          console.log(
            `[Worker] Transaction confirmed in block ${receipt.blockNumber}`
          );

          // Update reward as confirmed
          await prisma.reward.update({
            where: {
              repository_id_pr_number: {
                repository_id: repositoryId,
                pr_number: prNumber,
              },
            },
            data: {
              confirmed: true,
            },
          });

          console.log(
            `[Worker] Successfully stored voucher on-chain for PR #${prNumber}`
          );
          console.log(`[Worker] Transaction details:`, {
            hash,
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            voucherHash,
            tokenAmount: tokenAmount.toString(),
          });
        } catch (error) {
          console.error(`[Worker] Error storing voucher on-chain:`, error);

          if (error instanceof Error) {
            console.error(`[Worker] Error message: ${error.message}`);
            console.error(`[Worker] Error stack: ${error.stack}`);
          }

          throw error;
        }

        // Post reward notification comment on GitHub PR
        try {
          console.log(
            '[Worker] Generating AI comment for reward notification...'
          );

          // Generate comment content using AI with decimal format for human readability
          const commentContent = await generateRewardCommentContent(
            aiRaw.contributor,
            aiRaw.reward.toString(), // Use decimal format for comment (e.g., "1.5" instead of wei)
            newReward.id,
            prNumber
          );

          console.log('[Worker] AI comment generated, posting to GitHub...');
          console.log('[Worker] Comment posting details:', {
            owner: repository.organization.name,
            repo: repository.name,
            prNumber,
            installationId,
            commentLength: commentContent.length,
          });

          // Post the comment on the PR with improved error handling
          const commentResult = await postPRComment({
            owner: repository.organization.name,
            repo: repository.name,
            prNumber,
            commentBody: commentContent,
            installationId,
          });

          console.log(
            `[Worker] ✅ Reward notification comment posted successfully on PR #${prNumber}`,
            {
              commentId: commentResult.id,
              commentUrl: commentResult.html_url,
            }
          );

        } catch (error) {
          // Don't fail the entire job if comment posting fails
          // But log detailed error information for debugging
          console.error(
            '[Worker] ⚠️ Failed to post reward notification comment:',
            {
              error: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
                cause: (error as any).cause,
              } : error,
              prNumber,
              repository: `${repository.organization.name}/${repository.name}`,
              installationId,
            }
          );

          // Log activity for failed comment
          await logActivity({
            organizationId: repository.organization.id,
            activityType: 'REWARD_ISSUED',
            title: `Reward Comment Failed`,
            description: `Failed to post reward notification comment on PR #${prNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            repositoryId: repository.id,
            rewardId: newReward.id,
            prNumber: prNumber,
            metadata: {
              error: error instanceof Error ? error.message : String(error),
              errorType: error instanceof Error ? error.name : 'UnknownError',
            },
          }).catch(logErr => {
            console.error('[Worker] Failed to log comment failure activity:', logErr);
          });

          console.log(
            '[Worker] Job will continue despite comment posting failure - reward is still valid and claimable'
          );
        }

    return true;
  },
  {
    connection: bullMQRedisClient,
    autorun: true,
    concurrency: 1, // Reduced to prevent connection pool exhaustion
    lockDuration: 600000, // 10 minutes for blockchain + AI operations
    lockRenewTime: 120000, // Renew every 2 minutes
  }
);

// Worker event listeners
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

commentParseWorker.on('stalled', (jobId) => {
  console.warn(`[Worker] Job ${jobId} stalled - may need attention`);
});

commentParseWorker.on('progress', (job, progress) => {
  console.log(`[Worker] Job ${job.id} progress:`, progress);
});

// For backward compatibility
export function getCommentParseQueue() {
  return commentParseQueue;
}

export function getCommentParseWorker() {
  return commentParseWorker;
}

export function addCommentParseJob(data: CommentParseJobData) {
  return commentParseQueue.add('parse-comment', data);
}
