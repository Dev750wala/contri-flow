// import { redisClient } from './redisClient';

// /**
//  * Redis utility functions with proper error handling and reconnection logic
//  */

// export class RedisUtils {
//   private static async ensureConnection(): Promise<void> {
//     try {
//       if (redisClient.status !== 'ready') {
//         await redisClient.connect();
//       }
//     } catch (error) {
//       console.error('Failed to ensure Redis connection:', error);
//       throw error;
//     }
//   }

//   static async safeExecute<T>(
//     operation: () => Promise<T>,
//     operationName: string = 'Redis operation'
//   ): Promise<T | null> {
//     try {
//       await this.ensureConnection();
//       return await operation();
//     } catch (error: any) {
//       if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
//         console.log(`${operationName} failed due to connection issue, retrying...`);
//         try {
//           // Wait a bit and retry once
//           await new Promise(resolve => setTimeout(resolve, 1000));
//           await this.ensureConnection();
//           return await operation();
//         } catch (retryError) {
//           console.error(`${operationName} retry failed:`, retryError);
//           return null;
//         }
//       } else {
//         console.error(`${operationName} failed:`, error);
//         return null;
//       }
//     }
//   }

//   static async get(key: string): Promise<string | null> {
//     return this.safeExecute(
//       () => redisClient.get(key),
//       `GET ${key}`
//     );
//   }

//   static async set(key: string, value: string, expiration?: number): Promise<boolean> {
//     const result = await this.safeExecute(
//       () => expiration 
//         ? redisClient.setex(key, expiration, value)
//         : redisClient.set(key, value),
//       `SET ${key}`
//     );
//     return result === 'OK';
//   }

//   static async del(key: string): Promise<boolean> {
//     const result = await this.safeExecute(
//       () => redisClient.del(key),
//       `DEL ${key}`
//     );
//     return (result ?? 0) > 0;
//   }

//   static async exists(key: string): Promise<boolean> {
//     const result = await this.safeExecute(
//       () => redisClient.exists(key),
//       `EXISTS ${key}`
//     );
//     return (result ?? 0) > 0;
//   }

//   static async hget(key: string, field: string): Promise<string | null> {
//     return this.safeExecute(
//       () => redisClient.hget(key, field),
//       `HGET ${key} ${field}`
//     );
//   }

//   static async hset(key: string, field: string, value: string): Promise<boolean> {
//     const result = await this.safeExecute(
//       () => redisClient.hset(key, field, value),
//       `HSET ${key} ${field}`
//     );
//     return (result ?? 0) > 0;
//   }

//   static async hgetall(key: string): Promise<Record<string, string> | null> {
//     return this.safeExecute(
//       () => redisClient.hgetall(key),
//       `HGETALL ${key}`
//     );
//   }
// }