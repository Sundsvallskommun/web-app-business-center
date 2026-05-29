import type ApiService from '@/services/api.service';

type ApiMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export type MockApiService = { [K in ApiMethod]: jest.Mock };

export const createMockApiService = (): MockApiService => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
});

export type ApiSurface = Pick<ApiService, ApiMethod>;
