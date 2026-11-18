/// <reference types="jest" />

// tsconfig sets `types: ["cypress"]`, so the global `expect` resolves to Chai's
// Assertion; import Jest's expect explicitly to get Jest matcher typings.
import { expect } from '@jest/globals';

import { GET } from './route';

// The jsdom test environment has no Fetch API Response, which the real NextResponse extends.
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init: { status: number }) => ({
      status: init.status,
      json: async () => body,
    }),
  },
}));

describe('GET /api/health', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('responds 200 without consulting any dependency', async () => {
    const response = GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'OK' });
  });

  it('stays healthy even when the health configuration is absent', () => {
    process.env = { ...originalEnv, INTERNAL_API_URL: '', HEALTH_AUTH: '' };

    expect(GET().status).toBe(200);
  });
});
