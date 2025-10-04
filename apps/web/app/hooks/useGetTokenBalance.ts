import { useState } from 'react';
import {
    MPT_TOKEN_ADDRESS,
} from '@/web3/constants';
import TokenABI from "@/web3/TokenABI.json"
import { useAccount, useReadContract } from 'wagmi';

export const useTokenBalance = () => {
    const { address } = useAccount();
    const { data: balance, isLoading: isLoadingBalance } = useReadContract({
        abi: TokenABI,
        address: MPT_TOKEN_ADDRESS,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
        query: {
            enabled: address !== undefined,
        },
    });

    return { balance, isLoadingBalance };
};
