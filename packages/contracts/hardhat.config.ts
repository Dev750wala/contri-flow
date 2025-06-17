import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";

const {PRIVATE_KEY,  ETHERSCAN_API_KEY, SEPOLIA_API_KEY } = process.env;
console.log(PRIVATE_KEY, ETHERSCAN_API_KEY, SEPOLIA_API_KEY);

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "HTTP://0.0.0.0:7545",
            chainId: 1337,
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${SEPOLIA_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        }
    },
    solidity: {
        compilers: [
            { version: "0.8.0", settings: { evmVersion: "istanbul" } },
            { version: "0.8.28", settings: { evmVersion: "istanbul" } },
        ]
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    }
};

export default config;
