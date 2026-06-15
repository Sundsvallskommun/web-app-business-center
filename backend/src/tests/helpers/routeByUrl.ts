import type { MockApiService } from './mockApiService';

type Handler = (config: { url: string; params?: Record<string, unknown> }) => Promise<unknown>;

/**
 * Routes calls on a mock ApiService method to handlers keyed by URL substring.
 * The first pattern that appears in the request URL wins.
 *
 * If no pattern matches the request, the returned promise rejects so unrouted
 * URLs surface as obvious test failures instead of silent `undefined` results.
 */
export const routeByUrl = (
  api: MockApiService,
  method: keyof MockApiService,
  handlers: Record<string, Handler>,
): void => {
  api[method].mockImplementation((config: { url: string; params?: Record<string, unknown> }) => {
    const match = Object.entries(handlers).find(([pattern]) => config.url.includes(pattern));
    if (!match) {
      return Promise.reject(new Error(`routeByUrl: no handler matched url "${config.url}"`));
    }
    return match[1](config);
  });
};
