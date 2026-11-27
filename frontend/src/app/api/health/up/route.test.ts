/// <reference types="jest" />

import axios from 'axios';
// tsconfig sets `types: ["cypress"]`, so the global `expect` resolves to Chai's
// Assertion; import Jest's expect explicitly to get Jest matcher typings.
import { expect } from '@jest/globals';
import { headers } from 'next/headers';

import { GET } from './route';

jest.mock('axios');
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));
// The jsdom test environment has no Fetch API Response, which the real NextResponse extends.
jest.mock('next/server', () => ({
  NextResponse: class {
    readonly status: number;
    private readonly body: string;

    constructor(body: string, init: { status: number }) {
      this.body = body;
      this.status = init.status;
    }

    static json(body: unknown, init: { status: number }) {
      return new this(JSON.stringify(body), init);
    }

    async json() {
      return JSON.parse(this.body);
    }
  },
}));

const mockedAxios = jest.mocked(axios);
const mockedHeaders = jest.mocked(headers);
const originalEnv = process.env;

const setAuthorizationHeader = (authorization: string | null) => {
  mockedHeaders.mockResolvedValue({
    get: jest.fn((name: string) => (name === 'authorization' ? authorization : null)),
  } as unknown as Awaited<ReturnType<typeof headers>>);
};

describe('GET /api/health/up', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      HEALTH_AUTH: 'false',
      INTERNAL_API_URL: 'http://backend:3000/api',
      HEALTH_REQUEST_TIMEOUT_MS: '2500',
    };
    setAuthorizationHeader(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = originalEnv;
  });

  it('uses the internal backend URL and a bounded request timeout', async () => {
    mockedAxios.get.mockResolvedValue({ data: { status: 'UP' } });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mockedAxios.get).toHaveBeenCalledWith('http://backend:3000/api/health/up', { timeout: 2_500 });
  });

  it('does not accept empty credentials when authentication is enabled', async () => {
    process.env.HEALTH_AUTH = 'true';
    process.env.HEALTH_USERNAME = '';
    process.env.HEALTH_PASSWORD = '';
    setAuthorizationHeader('Basic Og==');

    const response = await GET();

    expect(response.status).toBe(500);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('rejects incorrect credentials before contacting the backend', async () => {
    process.env.HEALTH_AUTH = 'true';
    process.env.HEALTH_USERNAME = 'health-user';
    process.env.HEALTH_PASSWORD = 'secret';
    setAuthorizationHeader('Basic Og==');

    const response = await GET();

    expect(response.status).toBe(401);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('returns service unavailable when the backend times out', async () => {
    mockedAxios.get.mockRejectedValue(new Error('timeout'));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: 'UNAVAILABLE' });
  });
});
