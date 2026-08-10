import { vi, type Mock } from 'vitest';

type ApiMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export type MockApiService = { [K in ApiMethod]: Mock };

export const createMockApiService = (): MockApiService => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});
