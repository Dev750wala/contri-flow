import { bullMQRedisClient } from '@/lib/redisClient';
import { Job, Queue, Worker } from 'bullmq';
import { createWalletClient, http, createPublicClient, parseEther, keccak256, encodeAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { CONTRIFLOW_ADDRESS } from '@/web3/constants';
import CONTRIFLOW_ABI from "@/web3/ContriFlowABI.json"
import prisma from '@/lib/prisma';


interface CommentParseJobData {
  prNumber: number;
  contributorGithubId: number;
  repositoryGithubId: number;
  repositoryId: string;
  orgGithubId: number;
  rewardAmount: string; // Human-readable token amount (e.g., "100" or "0.5") - will be converted to 18 decimals
}

export const onChainQueue = new Queue<CommentParseJobData, boolean, string>(
  'ONCHAIN-QUEUE',
  { connection: bullMQRedisClient }
);

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

const account = privateKeyToAccount(PRIVATE_KEY);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http()
});

export const onChainWorker = new Worker(
  'ONCHAIN-QUEUE',
  async (job: Job<CommentParseJobData, void, string>) => {
    const {
      prNumber,
      repositoryId,
      contributorGithubId,
      repositoryGithubId,
      orgGithubId,
      rewardAmount
    } = job.data;

    try {
      console.log(`Processing on-chain storage for PR #${prNumber} in repository ${repositoryId}`);

      // Fetch the secret from the database
      const reward = await prisma.reward.findUnique({
        where: {
          repository_id_pr_number: {
            repository_id: repositoryId,
            pr_number: prNumber
          }
        }
      });

      if (!reward) {
        throw new Error(`Reward not found for repository ${repositoryId} and PR #${prNumber}`);
      }

      const secret = reward.secret;
      console.log(`Retrieved secret from database for PR #${prNumber}`);

      // Convert token amount to 18 decimals (wei) for ERC20 standard
      // Example: "100" becomes "100000000000000000000" (100 * 10^18)
      // parseEther handles the conversion from human-readable to wei (18 decimals)
      const tokenAmount = parseEther(rewardAmount);
      
      console.log(`Token amount conversion:`, {
        input: rewardAmount,
        output: tokenAmount.toString(),
        outputFormatted: `${rewardAmount} tokens = ${tokenAmount.toString()} wei (18 decimals)`
      });

      // Calculate the voucher hash exactly as the contract does
      // The contract uses: keccak256(abi.encode(secret, orgGithubId, repoGithubId, prNumber, contributorGithubId, tokenAmountIn18dec))
      // We need to encode the parameters in the same way using viem's encodeAbiParameters
      const encodedData = encodeAbiParameters(
        [
          { name: 'secret', type: 'string' },
          { name: 'orgGithubId', type: 'uint64' },
          { name: 'repoGithubId', type: 'uint32' },
          { name: 'prNumber', type: 'uint32' },
          { name: 'contributorGithubId', type: 'uint64' },
          { name: 'tokenAmountIn18dec', type: 'uint256' }
        ],
        [
          secret,
          BigInt(orgGithubId),
          repositoryGithubId,
          prNumber,
          BigInt(contributorGithubId),
          tokenAmount
        ]
      );

      const voucherHash = keccak256(encodedData);

      console.log(`Voucher details:`, {
        orgGithubId,
        repoGithubId: repositoryGithubId,
        contributorGithubId,
        prNumber,
        tokenAmount: tokenAmount.toString(),
        hash: voucherHash,
        secret: '***hidden***'
      });

      // Simulate the contract call to check if it will succeed
      const { request } = await publicClient.simulateContract({
        address: CONTRIFLOW_ADDRESS as `0x${string}`,
        abi: CONTRIFLOW_ABI,
        functionName: 'storeVoucher',
        args: [
          BigInt(orgGithubId),              // orgGithubId: uint64
          repositoryGithubId,                // repoGithubId: uint32
          BigInt(contributorGithubId),       // contributorGithubId: uint64
          prNumber,                          // prNumber: uint32
          tokenAmount,                       // tokenAmountIn18dec: uint256
          voucherHash                        // hash: bytes32
        ],
        account
      });

      // Write the transaction to the blockchain
      const hash = await walletClient.writeContract(request);

      console.log(`Transaction sent with hash: ${hash}`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1
      });

      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      await prisma.reward.update({
        where: {
          repository_id_pr_number: {
            repository_id: repositoryId,
            pr_number: prNumber
          }
        },
        data: {
          confirmed: true
        }
      });

      console.log(`Successfully stored voucher on-chain for PR #${prNumber}`);
      console.log(`Transaction details:`, {
        hash,
        blockNumber: receipt.blockNumber.toString(), 
        gasUsed: receipt.gasUsed.toString(),
        voucherHash,
        tokenAmount: tokenAmount.toString()
      });

      return {
        success: true,
        transactionHash: hash,
        voucherHash,
        blockNumber: receipt.blockNumber.toString()
      } as any;

    } catch (error) {
      console.error(`Error processing on-chain storage:`, error);

      if (error instanceof Error) {
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
      }

      throw error;
    }
  },
  {
    connection: bullMQRedisClient,
    limiter: {
      max: 10,
      duration: 60000
    },
    autorun: true,
  }
);

onChainWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

onChainWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
