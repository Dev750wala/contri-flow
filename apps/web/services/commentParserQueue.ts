import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import prisma from '@/lib/prisma';
import { parseComment, formatPrompt, generateSecret } from '@/lib/utils';
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
import { postPRComment, generateRewardCommentContent } from '@/lib/githubComment';
import { logActivity } from '@/lib/activityLogger';
import { getOrganizationBalance } from '@/lib/contractBalance';

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

// Initialize viem clients for on-chain operations
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;
const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(),
});

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

    console.log('[Worker] Extracted data:', {
      commentBody: commentBody.substring(0, 50) + '...',
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
    const contributorFromGithub = (await fetch(
      `https://api.github.com/users/${aiRaw.contributor}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      }
    ).then((res) => res.json())) as unknown;

    // Fetch repository with organization info early to check funds and use throughout
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: { organization: true },
    });

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
    console.log('[Worker] Secret generated, creating reward in database...');

    newReward = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          github_id: (contributorFromGithub as GitHubUserType).id.toString(),
        },
      });

      console.log(
        '[Worker] Existing user found:',
        existingUser ? existingUser.id : 'none'
      );

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
        token_amount: reward.token_amount,
      });

      // Log activity for reward issued
      await logActivity({
        organizationId: repository.organization.id,
        activityType: 'REWARD_ISSUED',
        title: `Reward Issued`,
        description: `Reward of ${reward.token_amount} tokens issued for PR #${reward.pr_number} to ${aiRaw.contributor}`,
        repositoryId: repository.id,
        rewardId: reward.id,
        actorId: commentorId,
        amount: reward.token_amount,
        prNumber: reward.pr_number,
        metadata: {
          contributorGithubId: (contributorFromGithub as GitHubUserType).id.toString(),
          contributorLogin: aiRaw.contributor,
        },
      });

      return reward;
    });

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
      console.log(`[Worker] Retrieved secret from reward for PR #${prNumber}`);

      // Convert token amount to 18 decimals (wei) for ERC20 standard
      const tokenAmount = parseEther(newReward.token_amount);

      console.log(`[Worker] Token amount conversion:`, {
        input: newReward.token_amount,
        output: tokenAmount.toString(),
        outputFormatted: `${newReward.token_amount} tokens = ${tokenAmount.toString()} wei (18 decimals)`,
      });

      // Calculate the voucher hash exactly as the contract does
      const encodedData = encodeAbiParameters(
        [
          { name: 'secret', type: 'string' },
          { name: 'orgGithubId', type: 'uint64' },
          { name: 'repoGithubId', type: 'uint32' },
          { name: 'prNumber', type: 'uint32' },
          { name: 'contributorGithubId', type: 'uint64' },
          { name: 'tokenAmountIn18dec', type: 'uint256' },
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
        account,
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
      console.log('[Worker] Generating AI comment for reward notification...');
      
      // Generate comment content using AI
      const commentContent = await generateRewardCommentContent(
        aiRaw.contributor,
        newReward.token_amount,
        newReward.id,
        prNumber
      );

      console.log('[Worker] AI comment generated, posting to GitHub...');

      // Post the comment on the PR
      await postPRComment({
        owner: repository.organization.name,
        repo: repository.name,
        prNumber,
        commentBody: commentContent,
        installationId,
      });

      console.log(`[Worker] ✅ Reward notification comment posted on PR #${prNumber}`);
      
    } catch (error) {
      // Don't fail the entire job if comment posting fails
      console.error('[Worker] ⚠️ Failed to post reward notification comment:', error);
      console.error('[Worker] Job will continue despite comment posting failure');
    }

    return true;
  },
  { connection: bullMQRedisClient, autorun: true, concurrency: 5 }
);

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
