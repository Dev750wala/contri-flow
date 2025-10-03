import { createConfig, http } from 'wagmi';
import { baseSepolia, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
    chains: [sepolia, baseSepolia],
    connectors: [
        injected(), 
    ],
    ssr: true,
    transports: {
        84532: http(),
        11155111: http(),
    },
});
