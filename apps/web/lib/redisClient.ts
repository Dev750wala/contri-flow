import config from '@/config';
import Redis, { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: config.REDIS_HOST_URL,
  port: Number(config.REDIS_HOST_PORT),
  password: config.REDIS_HOST_PASSWORD,
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
  tls: config.REDIS_HOST_URL?.includes('aivencloud.com') ? {} : undefined,
};

export const redisClient = new Redis(redisConfig);

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

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Redis connection...`);
  try {
    await redisClient.quit();
    console.log('Redis connection closed successfully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
