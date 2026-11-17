import axios from 'axios';

// Redis is enabled through REDIS_HOST, exactly as in OpenShift. Both `redis` and `axios` are
// third-party modules, so they are replaced by in-memory fakes; the app code runs unmocked.
vi.hoisted(() => {
  process.env.REDIS_HOST = 'redis.test';
  process.env.REDIS_KEY_PREFIX = 'bc-test';
});

/**
 * Minimal in-memory stand-in for the Redis commands the app uses:
 * connect, GET, SET with NX, and the script that releases the lock only for its owner.
 */
const fakeRedis = vi.hoisted(() => {
  const store = new Map<string, string>();
  const client = {
    isOpen: false,
    isReady: false,
    on: () => client,
    connect: async () => {
      client.isOpen = true;
      client.isReady = true;
      return client;
    },
    close: async () => {
      client.isOpen = false;
      client.isReady = false;
    },
    destroy: () => {
      client.isOpen = false;
      client.isReady = false;
    },
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: string, options?: { NX?: boolean }) => {
      if (options?.NX && store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    },
    eval: async (_script: string, { keys, arguments: args }: { keys: string[]; arguments: string[] }) => {
      if (store.get(keys[0]) !== args[0]) return 0;
      store.delete(keys[0]);
      return 1;
    },
  };
  return { store, client };
});

vi.mock('redis', () => ({ createClient: () => fakeRedis.client }));
vi.mock('axios', () => ({ default: vi.fn() }));
const mockedAxios = vi.mocked(axios);

const TOKEN_KEY = 'bc-test:wso2:access_token';
const LOCK_KEY = 'bc-test:wso2:token_lock';

function sharedToken(accessToken: string, expiresAt: number) {
  return JSON.stringify({ accessToken, expiresAt });
}

// Each test gets fresh module state (Redis client singleton, in-flight token request).
async function freshService() {
  vi.resetModules();
  const { default: ApiTokenService } = await import('@/services/api-token.service');
  return new ApiTokenService();
}

// The first import transforms the whole app module graph; do it once up front so the
// per-test imports below stay well inside the default test timeout.
beforeAll(async () => {
  await import('@/services/api-token.service');
  await import('@utils/session-store');
}, 30_000);

afterAll(() => {
  delete process.env.REDIS_HOST;
  delete process.env.REDIS_KEY_PREFIX;
});

describe('ApiTokenService.getToken with Redis', () => {
  beforeEach(() => {
    mockedAxios.mockReset();
    fakeRedis.store.clear();
    fakeRedis.client.isOpen = false;
    fakeRedis.client.isReady = false;
  });

  it('returns the token shared by another pod without fetching', async () => {
    fakeRedis.store.set(TOKEN_KEY, sharedToken('shared', Date.now() + 60_000));
    const service = await freshService();

    expect(await service.getToken()).toBe('shared');
    expect(mockedAxios).not.toHaveBeenCalled();
  });

  it('fetches once under the lock, shares the token in Redis and releases the lock', async () => {
    mockedAxios.mockResolvedValueOnce({ data: { access_token: 'fresh', expires_in: 3600 } });
    const service = await freshService();

    const results = await Promise.all([service.getToken(), service.getToken(), service.getToken()]);

    expect(results).toEqual(['fresh', 'fresh', 'fresh']);
    expect(mockedAxios).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fakeRedis.store.get(TOKEN_KEY) as string)).toMatchObject({ accessToken: 'fresh' });
    expect(fakeRedis.store.has(LOCK_KEY)).toBe(false);
  });

  it('ignores an expired shared token', async () => {
    fakeRedis.store.set(TOKEN_KEY, sharedToken('old', Date.now() - 1));
    mockedAxios.mockResolvedValueOnce({ data: { access_token: 'new', expires_in: 3600 } });
    const service = await freshService();

    expect(await service.getToken()).toBe('new');
  });

  it('waits for the pod holding the lock instead of fetching in parallel', async () => {
    fakeRedis.store.set(LOCK_KEY, 'other-pod');
    const service = await freshService();

    const pending = service.getToken();
    // The other pod finishes its refresh while this one is waiting for the lock.
    fakeRedis.store.set(TOKEN_KEY, sharedToken('from-other-pod', Date.now() + 60_000));

    expect(await pending).toBe('from-other-pod');
    expect(mockedAxios).not.toHaveBeenCalled();
    expect(fakeRedis.store.get(LOCK_KEY)).toBe('other-pod');
  });
});

describe('Redis session store and health', () => {
  beforeEach(() => {
    fakeRedis.client.isOpen = false;
    fakeRedis.client.isReady = false;
  });

  it('uses the Redis session store with the app key prefix', async () => {
    vi.resetModules();
    const { createSessionStore } = await import('@utils/session-store');

    const store = await createSessionStore();

    expect(store.constructor.name).toBe('RedisStore');
    expect((store as unknown as { prefix: string }).prefix).toBe('bc-test:session:');
  });

  it('reports Redis as not ready until it has connected', async () => {
    vi.resetModules();
    const { getRedisClient, isRedisReady } = await import('@utils/redis');

    expect(isRedisReady()).toBe(false);
    await getRedisClient();
    expect(isRedisReady()).toBe(true);
  });
});
