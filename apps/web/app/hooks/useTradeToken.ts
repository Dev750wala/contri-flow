import { useMemo, useState } from 'react';
import { parseEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import UniswapRouterABI from '@/web3/UniswapV2Router02ABI.json';
import { UNISWAP_V2_ROUTER02_ADDRESS, MPT_TOKEN_ADDRESS, WETH_ADDRESS } from '@/web3/constants';

export const useTradeToken = () => {
  const [ethValue, setEthValue] = useState('');
  const [tokenValue, setTokenValue] = useState('');
  const { isConnected, address } = useAccount();

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

  const {
    data: buyTokenData,
    writeContractAsync
  } = useWriteContract()


  // const amountOutMin = useMemo(() => {
  //   if (!BigInt(tokenValue)) return undefined;
  //   const expectedOutRaw = BigInt(tokenValue) * BigInt(1e18);
  //   // slippageBps: e.g. 1% -> 100
  //   const slippageBps = BigInt(Math.round(1 * 100));
  //   const NUM = BigInt(10000);
  //   return (BigInt(expectedOutRaw) * (NUM - slippageBps)) / NUM;
  // }, [tokenValue]);


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

  // const handleBuyTokens = async () => {
  //   if (!isConnected || !address) {
  //     console.log("Wallet not connected or address not available");
  //     return;
  //   }

  //   if (!ethValue || Number(ethValue) <= 0) {
  //     console.log("Invalid ETH amount");
  //     return;
  //   }

  //   try {
  //     const data = await writeContractAsync({
  //       abi: UniswapRouterABI,
  //       address: UNISWAP_V2_ROUTER02_ADDRESS,
  //       functionName: 'swapExactETHForTokens',
  //       args: [
  //         amountOutMin,
  //         [WETH_ADDRESS, MPT_TOKEN_ADDRESS],
  //         address,
  //         BigInt(Math.floor(Date.now() / 1000) + 60 * 5) // deadline: 5 minutes from now
  //       ],
  //       value: parseEther(ethValue),
  //     } as any);

  //     console.log("Transaction successful:", data);
  //     return data;
  //   } catch (error) {
  //     console.error("Error buying tokens:", error);
  //   }
  // };

  return {
    ethValue,
    tokenValue,
    calculatedTokenAmount,
    isLoadingTokenAmount,
    handleAmountChange,
    refetchTokenAmount,
    // handleBuyTokens
  };
};