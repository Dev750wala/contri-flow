import { extendType, list, nonNull, stringArg } from 'nexus';
import { Context } from '../context';
import { RewardType } from '../types';
import { logActivity } from '@/lib/activityLogger';
import { randomBytes } from 'crypto';
import { CONTRIFLOW_ADDRESS } from '@/web3/constants';
import {
  getClaimRewardQueue,
  getClaimRewardWorker,
} from '@/services/claimRewardQueue';

export const RewardQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('reward', {
      type: 'Reward',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        return ctx.prisma.reward.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });

    // Get claim message for EIP-712 signature
    t.nonNull.string('getClaimMessage', {
      args: {
        rewardId: nonNull(stringArg()),
        walletAddress: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const { rewardId, walletAddress } = args;

        // Fetch reward with all necessary relations
        const reward = await ctx.prisma.reward.findUnique({
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
          throw new Error('Reward has already been claimed');
        }

        if (!reward.confirmed) {
          throw new Error('Reward is not confirmed on blockchain yet');
        }

        // Generate secure random nonce (16 bytes = 32 hex characters)
        const nonce = '0x' + randomBytes(16).toString('hex');

        // Generate Unix timestamp
        const timestamp = Math.floor(Date.now() / 1000);

        // Build EIP-712 typed data structure
        const eip712Message = {
          types: {
            EIP712Domain: [
              { name: 'name', type: 'string' },
              { name: 'version', type: 'string' },
              { name: 'chainId', type: 'uint256' },
              { name: 'verifyingContract', type: 'address' },
            ],
            ClaimReward: [
              { name: 'walletAddress', type: 'address' },
              { name: 'contributorGithubId', type: 'string' },
              { name: 'organizationGithubId', type: 'string' },
              { name: 'repositoryGithubId', type: 'string' },
              { name: 'prNumber', type: 'string' },
              { name: 'rewardAmount', type: 'string' },
              { name: 'timestamp', type: 'uint256' },
              { name: 'nonce', type: 'string' },
              { name: 'rewardId', type: 'string' },
            ],
          },
          primaryType: 'ClaimReward',
          domain: {
            name: 'ContriFlow',
            version: '1',
            chainId: 11155111, // Sepolia testnet
            verifyingContract: CONTRIFLOW_ADDRESS,
          },
          message: {
            walletAddress: walletAddress,
            contributorGithubId: reward.contributor.github_id,
            organizationGithubId: reward.repository.organization.github_org_id,
            repositoryGithubId: reward.repository.github_repo_id,
            prNumber: reward.pr_number.toString(),
            rewardAmount: reward.token_amount,
            timestamp: timestamp,
            nonce: nonce,
            rewardId: rewardId,
          },
        };

        // Return JSON-stringified EIP-712 message
        return JSON.stringify(eip712Message);
      },
    });

    t.field('rewardsByContributor', {
      type: nonNull(list(nonNull(RewardType))),
      args: {
        contributorGithubId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const contributor = await ctx.prisma.contributor.findUnique({
          where: {
            github_id: args.contributorGithubId,
          },
        });
        if (!contributor) {
          throw new Error('Contributor not found');
        }
        return ctx.prisma.reward.findMany({
          where: {
            contributor_id: contributor.id,
          },
          include: {
            repository: true,
            contributor: true,
          },
        });
      },
    });

    t.field('rewardsByRepository', {
      type: nonNull(list(nonNull(RewardType))),
      args: {
        repoGithubId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const repository = await ctx.prisma.repository.findUnique({
          where: {
            github_repo_id: args.repoGithubId,
          },
        });
        if (!repository) {
          throw new Error('Repository not found');
        }
        return ctx.prisma.reward.findMany({
          where: {
            repository_id: repository.id,
          },
          include: {
            repository: true,
            contributor: true,
          },
        });
      },
    });
  },
});

export const RewardMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('claimReward', {
      type: RewardType,
      args: {
        rewardId: nonNull(stringArg()),
        signature: nonNull(stringArg()),
        walletAddress: nonNull(stringArg()),
      },
      resolve: async (_parent, args: any, ctx: Context) => {
        // Fetch reward to validate
        const reward = await ctx.prisma.reward.findUnique({
          where: { id: args.rewardId },
          include: {
            repository: {
              include: {
                organization: true,
              },
            },
            contributor: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!reward) {
          throw new Error('Reward not found');
        }

        if (reward.claimed) {
          throw new Error('Reward has already been claimed');
        }

        if (!reward.confirmed) {
          throw new Error('Reward is not confirmed on blockchain yet');
        }

        const claimRewardQueue = getClaimRewardQueue();
        getClaimRewardWorker();

        // Add job to the claim queue
        await claimRewardQueue.add(
          `claim-reward-${args.rewardId}`,
          {
            rewardId: args.rewardId,
            walletAddress: args.walletAddress,
            signature: args.signature,
          },
          {
            jobId: `claim-${args.rewardId}-${Date.now()}`,
          }
        );

        console.log(
          `[ClaimReward] Job added to queue for reward ${args.rewardId}`
        );

        // Return the reward (it will be updated by the worker)
        return reward;
      },
    });
  },
});
