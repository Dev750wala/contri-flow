import { z } from "zod";

export const envSchema = z.object({
    // Blockchain
    PRIVATE_KEY: z.string().min(1, "Private key is required"),
    ETHERSCAN_API_KEY: z.string().min(1, "Etherscan API key is required"),
    SEPOLIA_API_KEY: z.string().min(1, "Sepolia API key is required"),
    
    // Optional environment variables
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    TZ: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;