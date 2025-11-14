import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import {
  createWalletClient,
  http,
  createPublicClient,
  Transport,
  Account,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { CONTRIFLOW_ADDRESS } from '@/web3/constants';
import CONTRIFLOW_ABI from '@/web3/ContriFlowABI.json';
import { logActivity } from '@/lib/activityLogger';

type WalletClientLike = {
  writeContract: (args: unknown) => Promise<`0x${string}`>;
};

type PublicClientLike = {
  waitForTransactionReceipt: (args: unknown) => Promise<{
    status: 'success' | 'reverted';
    transactionHash: string;
  }>;
};

export interface ClaimRewardJobData {
  rewardId: string;
  walletAddress: string;
  signature: string;
}

// Lazy initialization to avoid errors during build time
let account: ReturnType<typeof privateKeyToAccount> | undefined;
let publicClient: PublicClientLike | undefined;
let walletClient: WalletClientLike | undefined;

const getClients = () => {
  const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;
  
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }

  if (!account) {
    account = privateKeyToAccount(PRIVATE_KEY);
  }
  const accountInstance = account as Account;

  if (!publicClient) {
    publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    }) as unknown as PublicClientLike;
  }

  if (!walletClient) {
    walletClient = createWalletClient({
      account: accountInstance,
      chain: sepolia,
      transport: http(),
    }) as unknown as WalletClientLike;
  }

  return { account, publicClient, walletClient };
};

let queueInstance: Queue<ClaimRewardJobData, boolean, string> | undefined;
let workerInstance: Worker<ClaimRewardJobData, boolean, string> | undefined;

export const getClaimRewardQueue = () => {
  if (!queueInstance) {
    queueInstance = new Queue<ClaimRewardJobData, boolean, string>(
      'CLAIM-REWARD-QUEUE',
      {
        connection: bullMQRedisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      }
    );
  }
  return queueInstance;
};

export const getClaimRewardWorker = () => {
  if (!workerInstance) {
    workerInstance = new Worker(
      'CLAIM-REWARD-QUEUE',
      async (job: Job<ClaimRewardJobData, boolean, string>) => {
        console.log(`[ClaimWorker] Job ${job.id} started processing`);
        const { rewardId, walletAddress, signature } = job.data;

        try {
          // Initialize clients (will throw if PRIVATE_KEY is not set)
          const { publicClient, walletClient } = getClients();

          // Fetch reward with all necessary relations
          const reward = await prisma.reward.findUnique({
            where: { id: rewardId },
            include: {
              contributor: true,
              repository: {
                include: {
                  organization: true,
                },
              },
            },
          });

          if (!reward) {
            throw new Error('Reward not found');
          }

          if (reward.claimed) {
            console.log(`[ClaimWorker] Reward ${rewardId} already claimed`);
            return false;
          }

          if (!reward.confirmed) {
            throw new Error('Reward is not confirmed on blockchain yet');
          }

          console.log(`[ClaimWorker] Processing claim for reward ${rewardId}`);

          // Prepare ClaimRequest struct for the smart contract
          const claimRequest = {
            secret: reward.secret,
            orgGithubId: BigInt(reward.repository.organization.github_org_id),
            repoGithubId: parseInt(reward.repository.github_repo_id),
            prNumber: reward.pr_number,
            contributorGithubId: BigInt(reward.contributor.github_id),
            contributorAddress: walletAddress as `0x${string}`,
            tokenAmountIn18dec: BigInt(reward.token_amount),
          };

          console.log('[ClaimWorker] Claim request:', claimRequest);

          // Call requestClaim on the smart contract
          const hash = await walletClient.writeContract({
            address: CONTRIFLOW_ADDRESS as `0x${string}`,
            abi: CONTRIFLOW_ABI,
            functionName: 'requestClaim',
            args: [claimRequest],
          } as any);

          console.log(`[ClaimWorker] Transaction sent: ${hash}`);

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
            confirmations: 1,
          });

          console.log(
            `[ClaimWorker] Transaction confirmed: ${receipt.transactionHash}`
          );

          if (receipt.status === 'success') {
            // Update reward as claimed and create payout record
            await prisma.reward.update({
              where: { id: rewardId },
              data: {
                claimed: true,
                payout: {
                  create: {
                    tx_hash: receipt.transactionHash,
                    destination_chain: 'sepolia',
                    total_amount: reward.token_amount,
                    receiver_address: walletAddress,
                    claimed_at: new Date(),
                    platform_fee: '0', // Calculate if needed
                    signature_hash: signature,
                  },
                },
              },
            });

            // Log activity for reward claimed
            await logActivity({
              organizationId: reward.repository.organization.id,
              activityType: 'REWARD_CLAIMED',
              title: `Reward Claimed`,
              description: `Reward of ${reward.token_amount} tokens claimed for PR #${reward.pr_number}`,
              repositoryId: reward.repository_id,
              rewardId: reward.id,
              actorId: reward.contributor.user_id ?? undefined,
              actorName: reward.contributor.email,
              amount: reward.token_amount,
              prNumber: reward.pr_number,
              metadata: {
                contributorGithubId: reward.contributor.github_id,
                transactionHash: receipt.transactionHash,
                walletAddress,
                signature,
              },
            });

            console.log(
              `[ClaimWorker] Reward ${rewardId} successfully claimed`
            );
            return true;
          } else {
            throw new Error('Transaction failed');
          }
        } catch (error: any) {
          console.error(`[ClaimWorker] Error processing job ${job.id}:`, error);

          // Try to fetch reward info for logging even if claim failed
          try {
            const reward = await prisma.reward.findUnique({
              where: { id: rewardId },
              include: {
                contributor: true,
                repository: {
                  include: {
                    organization: true,
                  },
                },
              },
            });

            if (reward) {
              // Determine error type and message
              let errorType = 'CLAIM_FAILED';
              let errorMessage = 'Failed to claim reward';
              let errorDetails: any = {
                errorMessage: error.message,
                walletAddress,
                signature: signature.substring(0, 20) + '...',
              };

              // Check for specific contract errors
              if (error.message?.includes('InvalidVoucher')) {
                errorType = 'INVALID_VOUCHER';
                errorMessage =
                  'Claim failed: Invalid voucher. The reward data does not match the stored voucher on-chain.';
                errorDetails.reason = 'InvalidVoucher';
                errorDetails.possibleCause =
                  'Voucher hash mismatch - reward may have been created before hash fix';
              } else if (error.message?.includes('AlreadyClaimed')) {
                errorType = 'ALREADY_CLAIMED';
                errorMessage =
                  'Claim failed: This reward has already been claimed';
                errorDetails.reason = 'AlreadyClaimed';
              } else if (error.message?.includes('InsufficientBalance')) {
                errorType = 'INSUFFICIENT_BALANCE';
                errorMessage = 'Claim failed: Insufficient contract balance';
                errorDetails.reason = 'InsufficientBalance';
              } else if (error.message?.includes('user rejected')) {
                errorType = 'USER_REJECTED';
                errorMessage = 'Claim cancelled: User rejected the transaction';
                errorDetails.reason = 'UserRejected';
              }

              // Log the failure as an activity
              await logActivity({
                organizationId: reward.repository.organization.id,
                activityType: 'REWARD_CLAIM_FAILED',
                title: `Reward Claim Failed`,
                description: errorMessage,
                repositoryId: reward.repository_id,
                rewardId: reward.id,
                actorId: reward.contributor.user_id ?? undefined,
                actorName: reward.contributor.email,
                amount: reward.token_amount,
                prNumber: reward.pr_number,
                metadata: {
                  ...errorDetails,
                  errorType,
                  contributorGithubId: reward.contributor.github_id,
                  timestamp: new Date().toISOString(),
                },
              });

              console.log(
                `[ClaimWorker] Logged claim failure activity for reward ${rewardId}`
              );
            }
          } catch (logError) {
            console.error(
              `[ClaimWorker] Failed to log claim failure:`,
              logError
            );
          }

          throw error;
        }
      },
      { connection: bullMQRedisClient, autorun: true, concurrency: 5 }
    );
  }
  return workerInstance;
};
