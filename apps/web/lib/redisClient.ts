import Redis, { RedisOptions } from 'ioredis';

// Check if we're in a build context (Next.js build, schema generation, etc.)
const isBuildTime = () => {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && process.argv.includes('build')) ||
    process.argv.some(
      (arg) => arg.includes('schema') || arg.includes('codegen')
    )
  );
};

const getRedisConfig = (): RedisOptions => {
  // During build time, always return stub config
  if (isBuildTime()) {
    console.warn('[Redis] Build time detected, using stub connection');
    return {
      host: 'localhost',
      port: 6379,
      lazyConnect: true,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };
  }

  console.log('XXXXXX HERE ARE THE REDIS CONFIGS.........');
  console.log(process.env.REDIS_HOST_URL, process.env.REDIS_HOST_PORT);

  // Skip Redis initialization if we're in schema generation mode (missing env vars)
  if (
    !process.env.REDIS_HOST_URL ||
    !process.env.REDIS_HOST_PORT ||
    process.env.REDIS_HOST_PORT === ''
  ) {
    console.warn('Redis configuration missing, creating stub connection');
    return {
      host: 'localhost',
      port: 6379,
      lazyConnect: true, // Don't connect immediately
      enableReadyCheck: false,
      maxRetriesPerRequest: null, // Disable retries for stub
    };
  }

  console.log('XXXXXX HERE ARE THE REDIS CONFIGS.........');
  console.log(
    process.env.REDIS_HOST_URL,
    process.env.REDIS_HOST_PORT,
    process.env.REDIS_HOST_PASSWORD
  );

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
      const shouldReconnect = targetErrors.some(
        (e) => err.message.includes(e) || (err as any).code === e
      );
      if (shouldReconnect) {
        console.log(`[Redis] Reconnecting due to error: ${err.message}`);
      }
      return shouldReconnect;
    },
    // Enable TLS if using cloud Redis
    tls: process.env.REDIS_HOST_URL?.includes('aivencloud.com')
      ? {
          rejectUnauthorized: false, // Allow self-signed certificates in production
        }
      : undefined,
  };
};

// Track connection state
let isRedisConnected = false;
let isBullMQRedisConnected = false;

// Lazy initialization - only create clients when actually needed (not at module load time)
let _redisClient: Redis | null = null;
let _bullMQRedisClient: Redis | null = null;

const setupRedisEventHandlers = (
  client: Redis,
  name: string,
  isBullMQ: boolean = false
) => {
  client.on('error', (error: any) => {
    if (isBullMQ) {
      isBullMQRedisConnected = false;
    } else {
      isRedisConnected = false;
    }
    if (
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ETIMEDOUT'
    ) {
      console.log(
        `[${name}] Connection lost, attempting to reconnect...`,
        error.code
      );
    } else {
      console.error(`[${name}] Connection error:`, error.message);
    }
  });

  client.on('connect', () => {
    console.log(`[${name}] Connected successfully`);
  });

  client.on('ready', () => {
    if (isBullMQ) {
      isBullMQRedisConnected = true;
    } else {
      isRedisConnected = true;
    }
    console.log(`[${name}] Ready to receive commands`);
  });

  client.on('close', () => {
    if (isBullMQ) {
      isBullMQRedisConnected = false;
    } else {
      isRedisConnected = false;
    }
    console.log(`[${name}] Connection closed`);
  });

  client.on('reconnecting', (delay: number) => {
    if (isBullMQ) {
      isBullMQRedisConnected = false;
    } else {
      isRedisConnected = false;
    }
    console.log(`[${name}] Reconnecting in ${delay}ms...`);
  });

  client.on('end', () => {
    if (isBullMQ) {
      isBullMQRedisConnected = false;
    } else {
      isRedisConnected = false;
    }
    console.log(`[${name}] Connection ended`);
  });
};

const getRedisClient = (): Redis => {
  if (!_redisClient) {
    const redisConfig = getRedisConfig();
    _redisClient = new Redis(redisConfig);
    setupRedisEventHandlers(_redisClient, 'Redis', false);
  }
  return _redisClient;
};

const getBullMQRedisClient = (): Redis => {
  if (!_bullMQRedisClient) {
    const redisConfig = getRedisConfig();
    // BullMQ requires maxRetriesPerRequest to be null
    // Also remove commandTimeout for BullMQ as it can cause issues with long-running operations
    const bullMQRedisConfig: RedisOptions = {
      ...redisConfig,
      maxRetriesPerRequest: null,
      commandTimeout: undefined, // Remove timeout for BullMQ operations
    };
    _bullMQRedisClient = new Redis(bullMQRedisConfig);
    setupRedisEventHandlers(_bullMQRedisClient, 'BullMQ Redis', true);
  }
  return _bullMQRedisClient;
};

// Export clients that initialize lazily on first access (runtime, not build time)
// Using Proxy to intercept property access and initialize only when needed
// This ensures the Redis clients are only created at runtime, not during build
export const redisClient = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getRedisClient();
    const value = client[prop as keyof Redis];
    // If it's a function, bind it to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  // Support for 'instanceof' checks
  has(target, prop) {
    const client = getRedisClient();
    return prop in client;
  },
  ownKeys(target) {
    const client = getRedisClient();
    return Reflect.ownKeys(client);
  },
  getOwnPropertyDescriptor(target, prop) {
    const client = getRedisClient();
    return Reflect.getOwnPropertyDescriptor(client, prop);
  },
});

export const bullMQRedisClient = new Proxy({} as Redis, {
  get(target, prop) {
    const client = getBullMQRedisClient();
    const value = client[prop as keyof Redis];
    // If it's a function, bind it to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  // Support for 'instanceof' checks
  has(target, prop) {
    const client = getBullMQRedisClient();
    return prop in client;
  },
  ownKeys(target) {
    const client = getBullMQRedisClient();
    return Reflect.ownKeys(client);
  },
  getOwnPropertyDescriptor(target, prop) {
    const client = getBullMQRedisClient();
    return Reflect.getOwnPropertyDescriptor(client, prop);
  },
});

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

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}, closing Redis connection...`);
  try {
    const promises: Promise<string>[] = [];
    if (_redisClient) {
      promises.push(_redisClient.quit());
    }
    if (_bullMQRedisClient) {
      promises.push(_bullMQRedisClient.quit());
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    console.log('Redis connection closed successfully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart
