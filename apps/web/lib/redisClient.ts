import Redis from 'ioredis';

// Simple Redis configuration - no magic, no complexity
const getRedisConfig = () => {
  const host = process.env.REDIS_HOST_URL || 'localhost';
  const port = Number(process.env.REDIS_HOST_PORT) || 6379;
  const password = process.env.REDIS_HOST_PASSWORD;

  return {
    host,
    port,
    password,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 1000, 20000);
      console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    tls: host.includes('aivencloud.com') ? {} : undefined,
  };
};

export const bullMQRedisClient = new Redis(getRedisConfig());

// Event handlers for visibility
bullMQRedisClient.on('error', (err) => {
  console.error('[Redis] Error:', err.message);
});

// For backward compatibility
export const redisClient = bullMQRedisClient;
export const isRedisHealthy = () => bullMQRedisClient.status === 'ready';
export const isBullMQRedisHealthy = () => bullMQRedisClient.status === 'ready';

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`[Redis] Received ${signal}, closing connection...`);
  try {
    await bullMQRedisClient.quit();
    console.log('[Redis] Connection closed successfully');
  } catch (error) {
    console.error('[Redis] Error closing connection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
