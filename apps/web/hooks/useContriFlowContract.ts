import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRIFLOW_ADDRESS, MPT_TOKEN_ADDRESS } from '@/web3/constants';
import ContriFlowABI from '@/web3/ContriFlowABI.json';
import { useEffect, useState } from 'react';

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
] as const;

export function useContriFlowContract(orgGithubId?: string) {
  const { address, isConnected } = useAccount();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [orgBalance, setOrgBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  // Write contracts for approve and addAmount
  const {
    writeContractAsync: approveAsync,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract();

  const {
    writeContractAsync: addAmountAsync,
    data: addAmountHash,
    isPending: isAddAmountPending,
    error: addAmountError,
  } = useWriteContract();

  // Wait for approve transaction confirmation
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for addAmount transaction confirmation
  const {
    isLoading: isAddAmountConfirming,
    isSuccess: isAddAmountSuccess,
  } = useWaitForTransactionReceipt({
    hash: addAmountHash,
  });

  // Fetch wallet MPT token balance
  const {
    data: walletBalanceData,
    isError: isWalletError,
    isLoading: isWalletLoading,
    refetch: refetchWalletBalance,
  } = useReadContract({
    address: MPT_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Fetch organization balance from ContriFlow contract
  const {
    data: orgBalanceData,
    isError: isOrgError,
    isLoading: isOrgLoading,
    refetch: refetchOrgBalance,
  } = useReadContract({
    address: CONTRIFLOW_ADDRESS as `0x${string}`,
    abi: ContriFlowABI,
    functionName: 'fundForOrganization',
    args: orgGithubId ? [BigInt(orgGithubId)] : undefined,
    query: {
      enabled: !!orgGithubId,
    },
  });

  // Convert wallet balance from Wei to token amount (18 decimals)
  useEffect(() => {
    if (walletBalanceData) {
      const balance = formatUnits(walletBalanceData as bigint, 18);
      setWalletBalance(parseFloat(balance));
    } else {
      setWalletBalance(0);
    }
    setIsLoadingWallet(isWalletLoading);
  }, [walletBalanceData, isWalletLoading]);

  // Convert organization balance from Wei to token amount (18 decimals)
  useEffect(() => {
    if (orgBalanceData) {
      const balance = formatUnits(orgBalanceData as bigint, 18);
      setOrgBalance(parseFloat(balance));
    } else {
      setOrgBalance(0);
    }
    setIsLoadingOrg(isOrgLoading);
  }, [orgBalanceData, isOrgLoading]);

  // Refetch balances after successful transactions
  useEffect(() => {
    if (isAddAmountSuccess) {
      refetchWalletBalance();
      refetchOrgBalance();
    }
  }, [isAddAmountSuccess, refetchWalletBalance, refetchOrgBalance]);

  /**
   * Step 1: Approve ContriFlow contract to spend MPT tokens
   * @param amount - Amount of MPT tokens to approve (in token units, not wei)
   */
  const approveTokens = async (amount: string) => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const amountInWei = parseUnits(amount, 18);
      const hash = await approveAsync({
        address: MPT_TOKEN_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRIFLOW_ADDRESS as `0x${string}`, amountInWei],
      } as any);
      return hash;
    } catch (error) {
      console.error('Error approving tokens:', error);
      throw error;
    }
  };

  /**
   * Step 2: Call addAmount to deposit approved tokens to organization
   * Should be called after approval is confirmed
   * @param orgGithubId - GitHub organization ID
   */
  const addFunds = async (orgGithubId: string) => {
    if (!address || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const hash = await addAmountAsync({
        address: CONTRIFLOW_ADDRESS as `0x${string}`,
        abi: ContriFlowABI,
        functionName: 'addAmount',
        args: [BigInt(orgGithubId)],
      } as any);
      return hash;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  };

  return {
    // Wallet balance
    walletBalance,
    isWalletError,
    isLoadingWallet,
    refetchWalletBalance,

    // Organization balance
    orgBalance,
    isOrgError,
    isLoadingOrg,
    refetchOrgBalance,

    // Account info
    address,
    isConnected,

    // Deposit functions
    approveTokens,
    addFunds,

    // Transaction states
    approveHash,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    approveError,

    addAmountHash,
    isAddAmountPending,
    isAddAmountConfirming,
    isAddAmountSuccess,
    addAmountError,
  };
}
