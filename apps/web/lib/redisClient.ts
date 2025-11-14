import Redis, { RedisOptions } from 'ioredis';

const getRedisConfig = (): RedisOptions => {
  console.log("XXXXXX HERE ARE THE REDIS CONFIGS.........");
  console.log(process.env.REDIS_HOST_URL, process.env.REDIS_HOST_PORT);
  
  // Skip Redis initialization if we're in schema generation mode (missing env vars)
  if (!process.env.REDIS_HOST_URL || !process.env.REDIS_HOST_PORT || process.env.REDIS_HOST_PORT === '') {
    console.warn('Redis configuration missing, creating stub connection');
    return {
      host: 'localhost',
      port: 6379,
      lazyConnect: true, // Don't connect immediately
      enableReadyCheck: false,
      maxRetriesPerRequest: null, // Disable retries for stub
    };
  }

  return {
    host: process.env.REDIS_HOST_URL,
    port: Number(process.env.REDIS_HOST_PORT),
    password: process.env.REDIS_HOST_PASSWORD,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 30000, // Increased from 10s to 30s for slow networks
    commandTimeout: 10000, // Increased from 5s to 10s
    retryStrategy: (times: number) => {
      // Exponential backoff with max delay of 30 seconds
      const delay = Math.min(times * 1000, 30000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    reconnectOnError: function (err: Error) {
      const targetErrors = ['READONLY', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'];
      const shouldReconnect = targetErrors.some(e => err.message.includes(e) || (err as any).code === e);
      if (shouldReconnect) {
        console.log(`[Redis] Reconnecting due to error: ${err.message}`);
      }
      return shouldReconnect;
    },
    // Enable TLS if using cloud Redis
    tls: process.env.REDIS_HOST_URL?.includes('aivencloud.com') ? {
      rejectUnauthorized: false // Allow self-signed certificates in production
    } : undefined,
  };
};

const redisConfig = getRedisConfig();

export const redisClient = new Redis(redisConfig);

// BullMQ requires maxRetriesPerRequest to be null
// Also remove commandTimeout for BullMQ as it can cause issues with long-running operations
const bullMQRedisConfig: RedisOptions = {
  ...redisConfig,
  maxRetriesPerRequest: null,
  commandTimeout: undefined, // Remove timeout for BullMQ operations
};

export const bullMQRedisClient = new Redis(bullMQRedisConfig);

// Track connection state
let isRedisConnected = false;
let isBullMQRedisConnected = false;

export const isRedisHealthy = () => isRedisConnected;
export const isBullMQRedisHealthy = () => isBullMQRedisConnected;

// Helper function to safely execute Redis commands
export async function safeRedisCommand<T>(
  command: () => Promise<T>,
  fallback?: T
): Promise<T | null> {
  if (!isRedisConnected) {
    console.warn('[Redis] Connection not ready, skipping command');
    return fallback ?? null;
  }
  try {
    return await command();
  } catch (error) {
    console.error('[Redis] Command execution failed:', error);
    return fallback ?? null;
  }
}

// Improved error handling with connection state tracking
redisClient.on('error', (error: any) => {
  isRedisConnected = false;
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    console.log('[Redis] Connection lost, attempting to reconnect...', error.code);
  } else {
    console.error('[Redis] Connection error:', error.message);
  }
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

redisClient.on('ready', () => {
  isRedisConnected = true;
  console.log('[Redis] Ready to receive commands');
});

redisClient.on('close', () => {
  isRedisConnected = false;
  console.log('[Redis] Connection closed');
});

redisClient.on('reconnecting', (delay: number) => {
  isRedisConnected = false;
  console.log(`[Redis] Reconnecting in ${delay}ms...`);
});

redisClient.on('end', () => {
  isRedisConnected = false;
  console.log('[Redis] Connection ended');
});

// Error handling for BullMQ Redis client
bullMQRedisClient.on('error', (error: any) => {
  isBullMQRedisConnected = false;
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    console.log('[BullMQ Redis] Connection lost, attempting to reconnect...', error.code);
  } else {
    console.error('[BullMQ Redis] Connection error:', error.message);
  }
});

bullMQRedisClient.on('connect', () => {
  console.log('[BullMQ Redis] Connected successfully');
});

bullMQRedisClient.on('ready', () => {
  isBullMQRedisConnected = true;
  console.log('[BullMQ Redis] Ready to receive commands');
});

bullMQRedisClient.on('close', () => {
  isBullMQRedisConnected = false;
  console.log('[BullMQ Redis] Connection closed');
});

bullMQRedisClient.on('reconnecting', (delay: number) => {
  isBullMQRedisConnected = false;
  console.log(`[BullMQ Redis] Reconnecting in ${delay}ms...`);
});

bullMQRedisClient.on('end', () => {
  isBullMQRedisConnected = false;
  console.log('[BullMQ Redis] Connection ended');
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Redis connection...`);
  try {
    await Promise.all([redisClient.quit(), bullMQRedisClient.quit()]);
    console.log('Redis connection closed successfully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
