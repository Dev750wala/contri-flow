export const developmentChains = ['hardhat', 'localhost'];

export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;

interface NetworkConfig {
  [key: number]: {
    name: string;
    ethUsdPriceFeed?: string;
  };
}

export const networkConfig: NetworkConfig = {
  11155111: {
    name: 'sepolia',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
  80002: {
    name: 'polygon_amoy',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
  84532: {
    name: 'base_sepolia',
    ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
  },
};
