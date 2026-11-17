import { createRedisConfig } from '@config';

describe('createRedisConfig', () => {
  it('is disabled when REDIS_HOST is not set', () => {
    expect(createRedisConfig({})).toEqual({ enabled: false });
  });

  it('defaults the port and key prefix', () => {
    expect(createRedisConfig({ REDIS_HOST: 'redis' })).toEqual({
      enabled: true,
      host: 'redis',
      keyPrefix: 'web-app-business-center',
      port: 6379,
    });
  });

  it('includes the password and a custom prefix when set', () => {
    expect(createRedisConfig({ REDIS_HOST: 'redis', REDIS_PORT: '6380', REDIS_PASSWORD: 'pw', REDIS_KEY_PREFIX: 'bc' })).toEqual({
      enabled: true,
      host: 'redis',
      keyPrefix: 'bc',
      port: 6380,
      password: 'pw',
    });
  });

  it('rejects port or password without a host', () => {
    expect(() => createRedisConfig({ REDIS_PORT: '6379' })).toThrow('REDIS_HOST is required');
    expect(() => createRedisConfig({ REDIS_PASSWORD: 'pw' })).toThrow('REDIS_HOST is required');
  });

  it('rejects an invalid port', () => {
    expect(() => createRedisConfig({ REDIS_HOST: 'redis', REDIS_PORT: 'abc' })).toThrow('REDIS_PORT');
    expect(() => createRedisConfig({ REDIS_HOST: 'redis', REDIS_PORT: '70000' })).toThrow('REDIS_PORT');
  });
});
