import { useState } from 'react';
import { parseEther } from 'viem';
import { useReadContract } from 'wagmi';
import UniswapRouterABI from '@/web3/UniswapV2Router02ABI.json';
import { UNISWAP_V2_ROUTER02_ADDRESS, MPT_TOKEN_ADDRESS, WETH_ADDRESS } from '@/web3/constants';

export const useTradeToken = () => {
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
  });

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
    console.log("Hello ");
    console.log("Token data:", token.data);
    
    if (token.data && Array.isArray(token.data) && token.data.length > 1) {
      console.log("Token amount:", token.data[1]);
      setTokenValue(String(Number(token.data[1]) / 1e18));
    } else {
      console.log("No token data available");
      setTokenValue('');
    }
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