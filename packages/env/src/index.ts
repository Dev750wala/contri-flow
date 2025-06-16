import { config } from "dotenv";
import { resolve } from "path";
import { envSchema, type Env } from "./schema";

// Load environment variables from .env file
config({
    path: resolve(process.cwd(), "../../.env")
});

// Export the type for autocompletion
export type { Env };

// Export validated environment variables
export const env = (): Env => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof Error) {
            console.error("❌ Environment variables validation failed:");
            console.error(error.message);
        }
        process.exit(1);
    }
};