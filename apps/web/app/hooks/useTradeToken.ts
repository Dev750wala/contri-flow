import { useState } from 'react';
import { parseEther } from 'viem';
import { useReadContract } from 'wagmi';
import UniswapRouterABI from '@/web3/UniswapV2Router02ABI.json';
import { UNISWAP_V2_ROUTER02_ADDRESS, MPT_TOKEN_ADDRESS, WETH_ADDRESS } from '@/web3/constants';

interface UseTradeTokenReturn {
  ethValue: string;
  tokenValue: string;
  calculatedTokenAmount: readonly bigint[] | undefined;
  isLoadingTokenAmount: boolean;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  refetchTokenAmount: () => Promise<any>;
}

export const useTradeToken = (): UseTradeTokenReturn => {
  const [ethValue, setEthValue] = useState('');
  const [tokenValue, setTokenValue] = useState('');

  const {
    data: calculatedTokenAmount,
    refetch: refetchTokenAmount,
    isLoading: isLoadingTokenAmount,
  } = useReadContract({
    abi: UniswapRouterABI,
    address: UNISWAP_V2_ROUTER02_ADDRESS,
    functionName: 'getAmountsOut',
    args: [
      parseEther(ethValue) || '0',
      [WETH_ADDRESS, MPT_TOKEN_ADDRESS],
    ],
    query: {
      enabled:
        ethValue !== '' && !isNaN(Number(ethValue)) && Number(ethValue) > 0,
    },
  }) as {
    data: readonly bigint[] | undefined;
    refetch: () => Promise<any>;
    isLoading: boolean;
  };

  const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEthValue = e.target.value;

    if (newEthValue === '') {
      setEthValue('');
      setTokenValue('');
      return;
    }

    if (isNaN(Number(newEthValue)) || newEthValue.trim() === '') {
      return;
    }

    setEthValue(newEthValue);
    const token = await refetchTokenAmount();
    console.log(token);
    
    setTokenValue(token.data ? String(token.data) : '');
  };

  return {
    ethValue,
    tokenValue,
    calculatedTokenAmount,
    isLoadingTokenAmount,
    handleAmountChange,
    refetchTokenAmount,
  };
};