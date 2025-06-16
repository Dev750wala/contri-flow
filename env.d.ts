declare namespace NodeJS {
    interface ProcessEnv {
        // API Keys
        NEXT_PUBLIC_API_URL: string;
        NEXT_PUBLIC_APP_URL: string;
        INFURA_API_KEY: string;
        ETHERSCAN_API_KEY: string;
        SEPOLIA_API_KEY: string;

        // Database
        DATABASE_URL: string;

        // Authentication
        NEXTAUTH_SECRET: string;
        NEXTAUTH_URL: string;

        // Blockchain
        PRIVATE_KEY: string;

        // System
        TZ: string;
        NODE_ENV: 'development' | 'production' | 'test';
    }
}

export { NodeJS };
