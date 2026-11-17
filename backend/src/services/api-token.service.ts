import { randomInt, randomUUID } from 'node:crypto';
import qs from 'qs';
import axios from 'axios';
import { API_BASE_URL, CLIENT_KEY, CLIENT_SECRET, REDIS_CONFIG } from '@config';
import { HttpException } from '@/exceptions/HttpException';
import { logger } from '@utils/logger';
import { getRedisClient, RedisClient } from '@utils/redis';

interface Token {
  access_token: string;
  expires_in: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

interface RedisTokenKeys {
  lock: string;
  token: string;
}

const TOKEN_REFRESH_MARGIN_MS = 10_000;
const TOKEN_REQUEST_TIMEOUT_MS = 30_000;
const LOCK_TTL_MS = TOKEN_REQUEST_TIMEOUT_MS + 10_000;
const LOCK_WAIT_TIMEOUT_MS = LOCK_TTL_MS + 5_000;
const LOCK_RETRY_INITIAL_MS = 100;
const LOCK_RETRY_MAX_MS = 1_000;
const LOCK_RETRY_JITTER_FACTOR = 0.25;

// Only deletes the lock if this pod still owns it, so a slow pod cannot release a lock
// that has expired and been taken by another pod.
const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
end
return 0
`;

// NOTE: used when Redis is not configured. Each instance then fetches its own token.
let localCachedToken: CachedToken | null = null;
// Concurrent callers in this process share one request (memory) or one lock attempt (Redis).
let localTokenRequest: Promise<string> | null = null;

function isToken(value: unknown): value is Token {
  return (
    typeof value === 'object' &&
    value !== null &&
    'access_token' in value &&
    typeof value.access_token === 'string' &&
    value.access_token.length > 0 &&
    'expires_in' in value &&
    typeof value.expires_in === 'number' &&
    Number.isFinite(value.expires_in) &&
    value.expires_in > 0
  );
}

function isCachedToken(value: unknown): value is CachedToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    'expiresAt' in value &&
    typeof value.expiresAt === 'number' &&
    Number.isFinite(value.expiresAt)
  );
}

function getCacheLifetimeMs(expiresInSeconds: number): number {
  const tokenLifetimeMs = Math.max(1, Math.floor(expiresInSeconds * 1_000));
  const refreshMarginMs = Math.min(TOKEN_REFRESH_MARGIN_MS, Math.floor(tokenLifetimeMs * 0.1));

  return Math.max(1, tokenLifetimeMs - refreshMarginMs);
}

function getRetryDelayMs(attempt: number): number {
  const exponentialDelayMs = Math.min(LOCK_RETRY_INITIAL_MS * 2 ** attempt, LOCK_RETRY_MAX_MS);
  const jitterRangeMs = Math.floor(exponentialDelayMs * LOCK_RETRY_JITTER_FACTOR) + 1;

  return exponentialDelayMs + randomInt(jitterRangeMs);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function createRedisTokenKeys(): RedisTokenKeys {
  if (!REDIS_CONFIG.enabled) {
    throw new Error('Redis token keys cannot be created without Redis configuration');
  }

  const namespace = `${REDIS_CONFIG.keyPrefix}:wso2`;
  return {
    lock: `${namespace}:token_lock`,
    token: `${namespace}:access_token`,
  };
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Gets the WSO2 OAuth token. With Redis configured the token is shared by all pods, and a
 * lock makes sure only one pod refreshes it at a time. Without Redis it is cached in memory.
 */
class ApiTokenService {
  public async getToken(): Promise<string> {
    const redis = await getRedisClient();

    if (redis) {
      return await this.getTokenFromRedis(redis);
    }

    return await this.getTokenFromMemory();
  }

  private async getTokenFromRedis(redis: RedisClient): Promise<string> {
    const keys = createRedisTokenKeys();
    const cachedToken = await this.readCachedToken(redis, keys.token);
    if (cachedToken) {
      return cachedToken;
    }

    return await this.shareLocalRequest(() => this.waitForSharedToken(redis, keys));
  }

  private async waitForSharedToken(redis: RedisClient, keys: RedisTokenKeys): Promise<string> {
    const lockOwner = randomUUID();
    const waitDeadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;
    let attempt = 0;
    let hasLoggedContention = false;

    while (Date.now() <= waitDeadline) {
      const acquiredLock = await redis.set(keys.lock, lockOwner, { NX: true, PX: LOCK_TTL_MS });

      if (acquiredLock === 'OK') {
        return await this.refreshTokenWhileHoldingLock(redis, lockOwner, keys);
      }

      if (!hasLoggedContention) {
        logger.info('OAuth token refresh is already in progress; waiting for the shared cache');
        hasLoggedContention = true;
      }

      const remainingWaitMs = waitDeadline - Date.now();
      if (remainingWaitMs <= 0) {
        break;
      }

      await sleep(Math.min(getRetryDelayMs(attempt), remainingWaitMs));

      const refreshedToken = await this.readCachedToken(redis, keys.token);
      if (refreshedToken) {
        return refreshedToken;
      }

      attempt += 1;
    }

    logger.error('Timed out waiting for the shared OAuth token cache to be refreshed');
    throw new HttpException(503, 'Service Unavailable');
  }

  private async refreshTokenWhileHoldingLock(redis: RedisClient, lockOwner: string, keys: RedisTokenKeys): Promise<string> {
    try {
      // Another pod may have refreshed the token between our cache read and taking the lock.
      const cachedToken = await this.readCachedToken(redis, keys.token);
      if (cachedToken) {
        return cachedToken;
      }

      const token = await this.fetchToken();
      const cacheLifetimeMs = getCacheLifetimeMs(token.expires_in);
      const cachedTokenValue: CachedToken = {
        accessToken: token.access_token,
        expiresAt: Date.now() + cacheLifetimeMs,
      };

      await redis.set(keys.token, JSON.stringify(cachedTokenValue), { PX: cacheLifetimeMs });
      logger.info(`OAuth token cached in Redis for ${cacheLifetimeMs}ms`);

      return token.access_token;
    } finally {
      await this.releaseLock(redis, lockOwner, keys.lock);
    }
  }

  private async releaseLock(redis: RedisClient, lockOwner: string, lockKey: string): Promise<void> {
    try {
      await redis.eval(RELEASE_LOCK_SCRIPT, { arguments: [lockOwner], keys: [lockKey] });
    } catch (error) {
      logger.warn(`Failed to release the OAuth token refresh lock: ${getErrorMessage(error)}`);
    }
  }

  private async readCachedToken(redis: RedisClient, tokenKey: string): Promise<string | null> {
    const serializedToken = await redis.get(tokenKey);
    if (!serializedToken) {
      return null;
    }

    try {
      const parsedToken: unknown = JSON.parse(serializedToken.toString());
      if (isCachedToken(parsedToken) && Date.now() < parsedToken.expiresAt) {
        return parsedToken.accessToken;
      }
    } catch {
      logger.warn('Ignoring an invalid value in the shared OAuth token cache');
    }

    return null;
  }

  private async getTokenFromMemory(): Promise<string> {
    if (localCachedToken && Date.now() < localCachedToken.expiresAt) {
      return localCachedToken.accessToken;
    }

    return await this.shareLocalRequest(async () => {
      const token = await this.fetchToken();
      const cacheLifetimeMs = getCacheLifetimeMs(token.expires_in);
      localCachedToken = { accessToken: token.access_token, expiresAt: Date.now() + cacheLifetimeMs };
      logger.info(`OAuth token cached in memory for ${cacheLifetimeMs}ms`);

      return token.access_token;
    });
  }

  private async shareLocalRequest(request: () => Promise<string>): Promise<string> {
    if (!localTokenRequest) {
      localTokenRequest = request().finally(() => {
        localTokenRequest = null;
      });
    }

    return await localTokenRequest;
  }

  private async fetchToken(): Promise<Token> {
    logger.info('Getting oauth API token');
    const authString = Buffer.from(`${CLIENT_KEY}:${CLIENT_SECRET}`, 'utf-8').toString('base64');

    try {
      const response = await axios({
        timeout: TOKEN_REQUEST_TIMEOUT_MS,
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + authString,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
          grant_type: 'client_credentials',
        }),
        url: `${API_BASE_URL}/token`,
      });

      if (!isToken(response.data)) throw new HttpException(502, 'Bad Gateway');

      logger.info(`OAuth token is valid for ${response.data.expires_in}s`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch JWT access token: ${JSON.stringify(error)}`);
      throw new HttpException(502, 'Bad Gateway');
    }
  }
}

export default ApiTokenService;
