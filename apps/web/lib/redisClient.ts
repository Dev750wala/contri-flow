import Redis, { RedisOptions } from 'ioredis';

const getRedisConfig = (): RedisOptions => {
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
    connectTimeout: 10000,
    commandTimeout: 5000,
    reconnectOnError: function (err: Error) {
      const targetError = 'READONLY';
      return err.message.includes(targetError);
    },
    // Enable TLS if using cloud Redis
    tls: process.env.REDIS_HOST_URL?.includes('aivencloud.com') ? {} : undefined,
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

// Improved error handling with less verbose logging
redisClient.on('error', (error: any) => {
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    console.log('Redis connection lost, attempting to reconnect...');
  } else {
    console.error('Redis connection error:', error.message);
  }
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
});

redisClient.on('ready', () => {
  console.log('Redis is ready to receive commands');
});

redisClient.on('close', () => {
  console.log('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// Error handling for BullMQ Redis client
bullMQRedisClient.on('error', (error: any) => {
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    console.log('BullMQ Redis connection lost, attempting to reconnect...');
  } else {
    console.error('BullMQ Redis connection error:', error.message);
  }
});

bullMQRedisClient.on('connect', () => {
  console.log('BullMQ Redis connected successfully');
});

bullMQRedisClient.on('ready', () => {
  console.log('BullMQ Redis is ready to receive commands');
});

bullMQRedisClient.on('close', () => {
  console.log('BullMQ Redis connection closed');
});

bullMQRedisClient.on('reconnecting', () => {
  console.log('BullMQ Redis reconnecting...');
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
