import config from '@/config';
import Redis, { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: config.REDIS_HOST_URL,
  port: Number(config.REDIS_HOST_PORT),
  password: config.REDIS_HOST_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
};

export const redisClient = new Redis(redisConfig);

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
});

redisClient.on('connect', () => {
    console.log('Redis connected successfully');
});

redisClient.on('ready', () => {
    console.log('Redis is ready to receive commands');
});
