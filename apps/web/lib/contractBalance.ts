import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { CONTRIFLOW_ADDRESS } from '@/web3/constants';
import CONTRIFLOW_ABI from '@/web3/ContriFlowABI.json';

/**
 * Initialize viem public client for reading contract data
 */
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

/**
 * Fetch the organization balance from the smart contract
 * @param githubOrgId - GitHub organization ID as string
 * @returns Balance in wei as bigint (use formatEther() to convert to ETH if needed)
 */
export async function getOrganizationBalance(githubOrgId: string): Promise<bigint> {
  try {
    const organizationGithubIdBigInt = BigInt(githubOrgId);
    
    const organizationFunds = (await publicClient.readContract({
      address: CONTRIFLOW_ADDRESS as `0x${string}`,
      abi: CONTRIFLOW_ABI,
      functionName: 'fundForOrganization',
      args: [organizationGithubIdBigInt] as const,
    } as any)) as bigint;

    return organizationFunds;
  } catch (error) {
    console.error('[getOrganizationBalance] Error fetching balance:', {
      githubOrgId,
      error: error instanceof Error ? error.message : error,
    });
    return BigInt(0);
  }
}
