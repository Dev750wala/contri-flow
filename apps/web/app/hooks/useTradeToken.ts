import { useMemo, useState } from 'react';
import { parseEther } from 'viem';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useConnect,
  useBalance,
} from 'wagmi';
import UniswapRouterABI from '@/web3/UniswapV2Router02ABI.json';
import {
  UNISWAP_V2_ROUTER02_ADDRESS,
  MPT_TOKEN_ADDRESS,
  WETH_ADDRESS,
} from '@/web3/constants';

export const useTradeToken = () => {
  const [ethValue, setEthValue] = useState('');
  const [tokenValue, setTokenValue] = useState('');
  const [sellEthValue, setSellEthValue] = useState('');
  const [sellTokenValue, setSellTokenValue] = useState('');
  const [isTransactionSuccess, setIsTransactionSuccess] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();

  // Get ETH balance
  const { data: ethBalance, isLoading: isLoadingBalance } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Check if entered amount exceeds balance
  const isInsufficientBalance = useMemo(() => {
    if (!ethValue || !ethBalance) return false;
    try {
      const enteredAmount = parseEther(ethValue);
      return enteredAmount > ethBalance.value;
    } catch {
      return false;
    }
  }, [ethValue, ethBalance]);

  const {
    data: calculatedTokenAmount,
    refetch: refetchTokenAmount,
    isLoading: isLoadingTokenAmount,
  } = useReadContract({
    abi: UniswapRouterABI,
    address: UNISWAP_V2_ROUTER02_ADDRESS,
    functionName: 'getAmountsOut',
    args: [parseEther(ethValue) || '0', [WETH_ADDRESS, MPT_TOKEN_ADDRESS]],
    query: {
      enabled:
        ethValue !== '' && !isNaN(Number(ethValue)) && Number(ethValue) > 0,
    },
  });

  // For selling tokens - calculate ETH amount from MPT tokens
  const {
    data: calculatedEthAmount,
    refetch: refetchEthAmount,
    isLoading: isLoadingEthAmount,
  } = useReadContract({
    abi: UniswapRouterABI,
    address: UNISWAP_V2_ROUTER02_ADDRESS,
    functionName: 'getAmountsOut',
    args: [
      sellTokenValue && !isNaN(Number(sellTokenValue))
        ? parseEther(sellTokenValue)
        : '0',
      [MPT_TOKEN_ADDRESS, WETH_ADDRESS],
    ],
    query: {
      enabled:
        sellTokenValue !== '' &&
        !isNaN(Number(sellTokenValue)) &&
        Number(sellTokenValue) > 0,
    },
  });

  const { data: buyTokenData, writeContractAsync } = useWriteContract();

  const amountOutMin = useMemo(() => {
    if (!tokenValue || tokenValue === '' || isNaN(Number(tokenValue)))
      return undefined;

    // Convert decimal tokenValue to BigInt by multiplying by 1e18
    const tokenValueNumber = Number(tokenValue);
    const expectedOutRaw = BigInt(Math.floor(tokenValueNumber * 1e18));

    // slippageBps: e.g. 1% -> 100
    const slippageBps = BigInt(Math.round(1 * 100));
    const NUM = BigInt(10000);
    return (expectedOutRaw * (NUM - slippageBps)) / NUM;
  }, [tokenValue]);

  const amountInMin = useMemo(() => {
    if (!sellEthValue || sellEthValue === '' || isNaN(Number(sellEthValue)))
      return undefined;

    // Convert decimal sellEthValue to BigInt by multiplying by 1e18
    const ethValueNumber = Number(sellEthValue);
    const expectedInRaw = BigInt(Math.floor(ethValueNumber * 1e18));

    // slippageBps: e.g. 1% -> 100 (1% slippage tolerance)
    const slippageBps = BigInt(Math.round(1 * 100));
    const NUM = BigInt(10000);
    return (expectedInRaw * (NUM - slippageBps)) / NUM;
  }, [sellEthValue]);

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
    console.log('Hello ');
    console.log('Token data:', token.data);

    if (token.data && Array.isArray(token.data) && token.data.length > 1) {
      console.log('Token amount:', token.data[1]);
      setTokenValue(String(Number(token.data[1]) / 1e18));
    } else {
      console.log('No token data available');
      setTokenValue('');
    }
  };

  const handleSellAmountChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newTokenValue = e.target.value;

    if (newTokenValue === '') {
      setSellTokenValue('');
      setSellEthValue('');
      return;
    }

    if (isNaN(Number(newTokenValue)) || newTokenValue.trim() === '') {
      return;
    }

    setSellTokenValue(newTokenValue);
    const eth = await refetchEthAmount();
    console.log('Sell ETH data:', eth.data);

    if (eth.data && Array.isArray(eth.data) && eth.data.length > 1) {
      console.log('ETH amount:', eth.data[1]); // ETH is the second element in the path [MPT, WETH]
      setSellEthValue(String(Number(eth.data[1]) / 1e18));
    } else {
      console.log('No ETH data available');
      setSellEthValue('');
    }
  };

  const handleConnectWallet = async () => {
    try {
      // Use the first available connector (usually injected wallet like MetaMask)
      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleBuyTokens = async () => {
    // If not connected, connect wallet first
    if (!isConnected || !address) {
      await handleConnectWallet();
      return;
    }

    if (!ethValue || Number(ethValue) <= 0) {
      console.log('Invalid ETH amount');
      return;
    }

    if (!amountOutMin) {
      console.log('Invalid token amount or slippage calculation');
      return;
    }

    try {
      const data = await writeContractAsync({
        abi: UniswapRouterABI,
        address: UNISWAP_V2_ROUTER02_ADDRESS,
        functionName: 'swapExactETHForTokens',
        args: [
          amountOutMin,
          [WETH_ADDRESS, MPT_TOKEN_ADDRESS],
          address,
          BigInt(Math.floor(Date.now() / 1000) + 60 * 5), // deadline: 5 minutes from now
        ],
        value: parseEther(ethValue),
      } as any);

      console.log('Transaction successful:', data);
      setIsTransactionSuccess(true);
      // Reset success state after 3 seconds
      setTimeout(() => setIsTransactionSuccess(false), 3000);
      return data;
    } catch (error) {
      console.error('Error buying tokens:', error);
      setIsTransactionSuccess(false);
    }
  };

  const handleSellTokens = async () => {
    // If not connected, connect wallet first
    if (!isConnected || !address) {
      await handleConnectWallet();
      return;
    }

    if (!sellTokenValue || Number(sellTokenValue) <= 0) {
      console.log('Invalid MPT token amount');
      return;
    }

    if (!amountInMin) {
      console.log('Invalid ETH amount or slippage calculation');
      return;
    }

    try {
      const data = await writeContractAsync({
        abi: UniswapRouterABI,
        address: UNISWAP_V2_ROUTER02_ADDRESS,
        functionName: 'swapExactTokensForETH',
        args: [
          parseEther(sellTokenValue), // amountIn: MPT tokens to sell
          amountInMin, // amountOutMin: minimum ETH to receive
          [MPT_TOKEN_ADDRESS, WETH_ADDRESS], // path: MPT -> WETH
          address, // to: recipient address
          BigInt(Math.floor(Date.now() / 1000) + 60 * 5), // deadline: 5 minutes from now
        ],
      } as any);

      console.log('Sell transaction successful:', data);
      setIsTransactionSuccess(true);
      // Reset success state after 3 seconds
      setTimeout(() => setIsTransactionSuccess(false), 3000);
      return data;
    } catch (error) {
      console.error('Error selling tokens:', error);
      setIsTransactionSuccess(false);
    }
  };

  return {
    ethValue,
    tokenValue,
    sellEthValue,
    sellTokenValue,
    calculatedTokenAmount,
    calculatedEthAmount,
    isLoadingTokenAmount,
    isLoadingEthAmount,
    isConnecting,
    isTransactionSuccess,
    amountOutMin,
    amountInMin,
    ethBalance,
    isLoadingBalance,
    isInsufficientBalance,
    handleAmountChange,
    handleSellAmountChange,
    refetchTokenAmount,
    refetchEthAmount,
    handleBuyTokens,
    handleSellTokens,
    handleConnectWallet,
  };
};
