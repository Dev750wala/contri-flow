declare global {
    declare namespace NodeJS {
        interface ProcessEnv {
            ETHERSCAN_API_KEY: string;
            SEPOLIA_API_KEY: string;
            PRIVATE_KEY: string;
        }
    }
}

export { NodeJS };
