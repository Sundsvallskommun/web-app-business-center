/// <reference types="jest" />

import axios from 'axios';
import { expect } from '@jest/globals';
import { headers } from 'next/headers';

import { GET } from './route';

jest.mock('axios');
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: class {
    readonly status: number;
    private readonly body: string;

    constructor(body: string, init: { status: number }) {
      this.body = body;
      this.status = init.status;
    }

    async json() {
      return JSON.parse(this.body);
    }
  },
}));

const mockedAxios = jest.mocked(axios);
const mockedHeaders = jest.mocked(headers);

describe('GET /api/health/up', () => {
  beforeEach(() => {
    mockedHeaders.mockResolvedValue({
      get: jest.fn().mockReturnValue(null),
    } as unknown as Awaited<ReturnType<typeof headers>>);
  });

  it('uses the default TLS verification when checking the backend', async () => {
    mockedAxios.get.mockResolvedValue({ data: { status: 'UP' } });

    const response = await GET();

    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/api/health/up');
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'UP' });
  });
});
