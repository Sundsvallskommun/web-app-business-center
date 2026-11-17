import { REDIS_CONFIG, SESSION_MEMORY } from '@config';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import createFileStore from 'session-file-store';

import { logger } from './logger';
import { getRedisClient } from './redis';

// The store TTL is refreshed on every request and is the server-side idle backstop.
const SESSION_TTL_SECONDS = 12 * 60 * 60;
const SESSION_FILE_PATH = './data/sessions';

/**
 * Session store for a single instance: memory (SESSION_MEMORY=true) or files on disk.
 */
export function createLocalSessionStore(): session.Store {
  if (SESSION_MEMORY) {
    const MemoryStore = createMemoryStore(session);
    // NOTE: memorystore uses ms
    return new MemoryStore({ ttl: SESSION_TTL_SECONDS * 1000, checkPeriod: SESSION_TTL_SECONDS * 1000 });
  }

  const FileStore = createFileStore(session);
  // NOTE: session-file-store uses seconds
  return new FileStore({ ttl: SESSION_TTL_SECONDS, path: SESSION_FILE_PATH });
}

/**
 * Redis is mandatory when configured, so a multi-pod deployment cannot silently split
 * sessions between pods. Memory/file storage is only used when Redis is deliberately absent.
 */
export async function createSessionStore(): Promise<session.Store> {
  if (REDIS_CONFIG.enabled) {
    const redisClient = await getRedisClient();

    if (!redisClient) {
      throw new Error('Redis is configured but no Redis client was created');
    }

    logger.info('Using Redis session store');
    return new RedisStore({
      client: redisClient,
      prefix: `${REDIS_CONFIG.keyPrefix}:session:`,
      ttl: SESSION_TTL_SECONDS,
    });
  }

  logger.info(`Using ${SESSION_MEMORY ? 'memory' : 'file'} session store (Redis is not configured)`);
  return createLocalSessionStore();
}
