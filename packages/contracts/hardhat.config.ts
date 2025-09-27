import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import dotenv from 'dotenv';

dotenv.config({
  path: `./.env`,
});

const {
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  SEPOLIA_API_KEY,
  POLYGON_AMOY_API_KEY,
  BASE_SEPOLIA_API_KEY,
} = process.env;

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'HTTP://0.0.0.0:7545',
      chainId: 1337,
    },
    sepolia: {
      url: `${SEPOLIA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    polygon_amoy: {
      url: `${POLYGON_AMOY_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
    },
    base_sepolia: {
      url: `${BASE_SEPOLIA_API_KEY}`,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
  },
  solidity: {
    compilers: [
      { version: '0.8.0', settings: { evmVersion: 'istanbul' } },
      { version: '0.8.28', settings: { evmVersion: 'istanbul' } },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};

export default config;
