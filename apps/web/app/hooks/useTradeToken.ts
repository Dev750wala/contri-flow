import { useMemo, useState, useEffect } from 'react';
import { parseEther } from 'viem';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useConnect,
  useBalance,
} from 'wagmi';
import UniswapRouterABI from '@/web3/UniswapV2Router02ABI.json';
import TokenABI from '@/web3/TokenABI.json';
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

  const { data: ethBalance, isLoading: isLoadingBalance } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const { data: mptBalance, isLoading: isLoadingMptBalance } = useReadContract({
    abi: TokenABI,
    address: MPT_TOKEN_ADDRESS,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Check if entered amount exceeds balance for ETH (buy tab)
  const isInsufficientBalance = useMemo(() => {
    if (!ethValue || !ethBalance) return false;
    try {
      const enteredAmount = parseEther(ethValue);
      return enteredAmount > ethBalance.value;
    } catch {
      return false;
    }
  }, [ethValue, ethBalance]);

  // Check if entered amount exceeds balance for MPT (sell tab)
  const isInsufficientMptBalance = useMemo(() => {
    if (!sellTokenValue || !mptBalance) return false;
    try {
      const enteredAmount = parseEther(sellTokenValue);
      return enteredAmount > BigInt(mptBalance as bigint);
    } catch {
      return false;
    }
  }, [sellTokenValue, mptBalance]);

  const {
    data: allowanceData,
    refetch: refetchAllowance,
    isLoading: isLoadingAllowance,
  } = useReadContract({
    abi: TokenABI,
    address: MPT_TOKEN_ADDRESS,
    functionName: 'allowance',
    args: [address, UNISWAP_V2_ROUTER02_ADDRESS],
    query: {
      enabled: isConnected && !!address,
    },
  })

  // Get token decimals
  const { data: tokenDecimals } = useReadContract({
    abi: TokenABI,
    address: MPT_TOKEN_ADDRESS,
    functionName: 'decimals',
    query: {
      enabled: true,
    },
  })

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

  // Auto-update token value when calculatedTokenAmount changes (for Buy tab)
  useEffect(() => {
    if (calculatedTokenAmount && Array.isArray(calculatedTokenAmount) && calculatedTokenAmount.length > 1) {
      setTokenValue(String(Number(calculatedTokenAmount[1]) / 1e18));
    } else if (ethValue === '') {
      setTokenValue('');
    }
  }, [calculatedTokenAmount, ethValue]);

  // Auto-update ETH value when calculatedEthAmount changes (for Sell tab)
  useEffect(() => {
    if (calculatedEthAmount && Array.isArray(calculatedEthAmount) && calculatedEthAmount.length > 1) {
      setSellEthValue(String(Number(calculatedEthAmount[1]) / 1e18));
    } else if (sellTokenValue === '') {
      setSellEthValue('');
    }
  }, [calculatedEthAmount, sellTokenValue]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // The useEffect will automatically update tokenValue when calculatedTokenAmount changes
  };

  const handleSellAmountChange = (
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
    // The useEffect will automatically update sellEthValue when calculatedEthAmount changes
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
      console.log('❌ Invalid ETH amount');
      return;
    }

    if (!amountOutMin) {
      console.log('❌ Invalid token amount or slippage calculation');
      return;
    }

    try {
      console.log("🔍 Buying Tokens - Parameters:");
      console.log("  - ETH Value:", ethValue);
      console.log("  - Amount Out Min:", amountOutMin.toString());
      console.log("  - Path:", [WETH_ADDRESS, MPT_TOKEN_ADDRESS]);
      console.log("  - To:", address);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes (as number)
      console.log("  - Deadline:", deadline);

      const data = await writeContractAsync({
        abi: UniswapRouterABI,
        address: UNISWAP_V2_ROUTER02_ADDRESS,
        functionName: 'swapExactETHForTokens',
        args: [
          amountOutMin,
          [WETH_ADDRESS, MPT_TOKEN_ADDRESS],
          address,
          deadline,
        ],
        value: parseEther(ethValue),
        gas: BigInt(300000), // Set a reasonable gas limit (within the 16777216 cap)
      } as any);

      console.log('✅ Buy transaction successful:', data);
      setIsTransactionSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsTransactionSuccess(false), 3000);
      
      // Clear input fields after successful transaction
      setEthValue('');
      setTokenValue('');
      
      return data;
    } catch (error: any) {
      console.error('❌ Error buying tokens:', error);
      
      // Parse common error messages
      if (error.message) {
        if (error.message.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
          console.error("  ⚠️ Slippage too low - try increasing slippage tolerance");
        } else if (error.message.includes("EXPIRED")) {
          console.error("  ⚠️ Transaction deadline expired");
        } else if (error.message.includes("user rejected")) {
          console.error("  ⚠️ User rejected the transaction");
        } else if (error.message.includes("insufficient funds")) {
          console.error("  ⚠️ Insufficient ETH balance");
        }
      }
      
      setIsTransactionSuccess(false);
      throw error;
    }
  };

  // console.log("AmountIn: ", parseEther(sellTokenValue));
  // console.log("AmountOutMin: ",  (estimatedWETHOut * (BPS_DEN - slippageBps)) / BPS_DEN);
  // console.log("address: ", address);



  const handleSellTokens = async () => {
    // connect if needed
    if (!isConnected || !address) {
      await handleConnectWallet();
      return;
    }

    if (!sellTokenValue || Number(sellTokenValue) <= 0) {
      console.log("Invalid MPT token amount");
      return;
    }

    try {
      // Step 1: Get token decimals (default to 18 if not available)
      const decimals = tokenDecimals ? Number(tokenDecimals) : 18;
      const amountInRaw = parseEther(sellTokenValue); // Assuming 18 decimals

      console.log("🔍 Step 1: Parsing amount");
      console.log("  - Sell Token Value:", sellTokenValue);
      console.log("  - Amount In Raw:", amountInRaw.toString());
      console.log("  - Token Decimals:", decimals);

      // Step 2: Fetch fresh getAmountsOut to get the latest exchange rate
      console.log("\n🔍 Step 2: Fetching fresh exchange rate");
      const refreshed = await refetchEthAmount();
      const amounts = refreshed?.data;
      
      if (!amounts || !Array.isArray(amounts) || amounts.length < 2) {
        console.error("❌ Failed to fetch amount-out estimate");
        return;
      }

      const estimatedWETHOut = BigInt(amounts[1]);
      console.log("  - Estimated WETH Out (raw):", estimatedWETHOut.toString());
      console.log("  - Estimated ETH Out (formatted):", (Number(estimatedWETHOut) / 1e18).toFixed(6));

      // Step 3: Compute amountOutMin with slippage tolerance (1%)
      const slippageBps = BigInt(100); // 1% slippage
      const BPS_DEN = BigInt(10000);
      const amountOutMin = (estimatedWETHOut * (BPS_DEN - slippageBps)) / BPS_DEN;
      
      console.log("\n🔍 Step 3: Computing minimum output");
      console.log("  - Slippage:", "1%");
      console.log("  - Amount Out Min (raw):", amountOutMin.toString());
      console.log("  - Amount Out Min (formatted):", (Number(amountOutMin) / 1e18).toFixed(6));

      // Step 4: Check and handle approval
      console.log("\n🔍 Step 4: Checking allowance");
      const allowanceResult = await refetchAllowance();
      const currentAllowance = BigInt(allowanceResult?.data?.toString() ?? "0");
      
      console.log("  - Current Allowance:", currentAllowance.toString());
      console.log("  - Required Amount:", amountInRaw.toString());

      if (currentAllowance < amountInRaw) {
        console.log("  ⚠️ Insufficient allowance, requesting approval...");
        
        const approveTx = await writeContractAsync({
          abi: TokenABI,
          address: MPT_TOKEN_ADDRESS,
          functionName: "approve",
          args: [UNISWAP_V2_ROUTER02_ADDRESS, amountInRaw],
          gas: BigInt(100000), // Set a reasonable gas limit for approval
        } as any);
        
        console.log("  ✅ Approval transaction sent:", approveTx);
        console.log("  ⏳ Waiting for approval confirmation...");
        
        // Wait a bit for the approval to be mined (optional, but recommended)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log("  ✅ Sufficient allowance already exists");
      }

      // Step 5: Prepare swap parameters
      const deadline = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes (as number, not bigint)
      const path = [MPT_TOKEN_ADDRESS, WETH_ADDRESS];

      console.log("\n🔍 Step 5: Preparing swap parameters");
      console.log("  - Amount In:", amountInRaw.toString());
      console.log("  - Amount Out Min:", amountOutMin.toString());
      console.log("  - Path:", path);
      console.log("  - To:", address);
      console.log("  - Deadline:", deadline);

      // Step 6: Execute the swap
      console.log("\n🔍 Step 6: Executing swap transaction");
      
      // Prepare gas settings (within chain cap of 16777216)
      const gasSettings = {
        gas: BigInt(400000), // Conservative gas limit
      };
      
      let swapTx;
      try {
        // Try regular swap first
        console.log("  - Attempting regular swap (swapExactTokensForETH)...");
        swapTx = await writeContractAsync({
          abi: UniswapRouterABI,
          address: UNISWAP_V2_ROUTER02_ADDRESS,
          functionName: "swapExactTokensForETH",
          args: [
            amountInRaw,
            amountOutMin,
            path,
            address,
            deadline,
          ],
          ...gasSettings,
        } as any);
      } catch (swapError: any) {
        // If regular swap fails, try fee-supporting version
        console.log("  - Regular swap failed, trying fee-supporting version...");
        console.log("  - Error:", swapError.message);
        
        swapTx = await writeContractAsync({
          abi: UniswapRouterABI,
          address: UNISWAP_V2_ROUTER02_ADDRESS,
          functionName: "swapExactTokensForETHSupportingFeeOnTransferTokens",
          args: [
            amountInRaw,
            amountOutMin,
            path,
            address,
            deadline,
          ],
          ...gasSettings,
        } as any);
      }

      console.log("\n✅ Swap transaction successful!");
      console.log("  - Transaction Hash:", swapTx);
      
      setIsTransactionSuccess(true);
      setTimeout(() => setIsTransactionSuccess(false), 3000);
      
      // Clear input fields after successful transaction
      setSellTokenValue('');
      setSellEthValue('');
      
      return swapTx;
    } catch (error: any) {
      console.error("\n❌ Error selling tokens:");
      console.error("  - Error:", error);
      
      // Parse common error messages
      if (error.message) {
        if (error.message.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
          console.error("  ⚠️ Slippage too low - try increasing slippage tolerance");
        } else if (error.message.includes("TRANSFER_FROM_FAILED")) {
          console.error("  ⚠️ Transfer failed - check token balance and allowance");
        } else if (error.message.includes("TRANSFER_FAILED")) {
          console.error("  ⚠️ Token has transfer fees - tried fee-supporting function");
        } else if (error.message.includes("EXPIRED")) {
          console.error("  ⚠️ Transaction deadline expired");
        } else if (error.message.includes("user rejected")) {
          console.error("  ⚠️ User rejected the transaction");
        } else if (error.message.includes("gas limit too high") || error.message.includes("gas")) {
          console.error("  ⚠️ Gas limit issue - adjusted to 500000 (within chain cap)");
          console.error("  💡 Try with a smaller amount or check if the pool has sufficient liquidity");
        } else if (error.message.includes("insufficient funds")) {
          console.error("  ⚠️ Insufficient funds for gas");
        }
      }
      
      setIsTransactionSuccess(false);
      throw error;
    }
  };

  console.log("Token Amount: ", calculatedTokenAmount);
  console.log("ETH Amount: ", calculatedEthAmount);

  return {
    ethValue,
    tokenValue,
    sellEthValue,
    sellTokenValue,
    // calculatedTokenAmount,
    // calculatedEthAmount,
    isLoadingTokenAmount,
    isLoadingEthAmount,
    isConnecting,
    isTransactionSuccess,
    amountOutMin,
    amountInMin,
    ethBalance,
    isLoadingBalance,
    mptBalance,
    isLoadingMptBalance,
    isInsufficientBalance,
    isInsufficientMptBalance,
    handleAmountChange,
    handleSellAmountChange,
    refetchTokenAmount,
    refetchEthAmount,
    handleBuyTokens,
    handleSellTokens,
    handleConnectWallet,
  };
};
