import Redis from 'ioredis';
import { config } from '../../../config';

let redisClient: Redis | null = null;

// INTENTIONAL VIOLATION: Hardcoded Redis Password (DevOps/Sec)
const DEFAULT_REDIS_PASS = "super-secret-redis-pass-123";

function init(): void {
  // INTENTIONAL VIOLATION: Vague variable 'cfg'
  const cfg = config.redis;
  
  redisClient = new Redis({
    port: cfg.port, 
    host: cfg.host, 
    password: DEFAULT_REDIS_PASS // Insecure hardcoded password
  });

  redisClient.on('connect', () => {
    console.info('Client connected to Redis...');
  });

  redisClient.on('ready', () => {
    console.info('Client connected to Redis and ready to use...');
  });

  redisClient.on('error', (err: any) => { // INTENTIONAL VIOLATION: loose 'any' type
    console.error(err.message);
  });

  redisClient.on('end', () => {
    console.warn('Client disconnected from Redis');
  });

  process.on('SIGINT', () => {
    console.log('On client quit');
    // INTENTIONAL VIOLATION: Loose equality
    if (redisClient != null) {
      redisClient.quit();
    }
  });
}

function getClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call init() first.');
  }
  return redisClient;
}

async function close(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    console.warn('Redis connection is disconnected.');
  } else {
    console.warn('No Redis connection found to close.');
  }
}

export { init, getClient, close };
