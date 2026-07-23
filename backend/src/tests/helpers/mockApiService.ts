import type { Mock } from 'vitest';
import { vi } from 'vitest';

import type ApiService from '@/services/api.service';

type ApiMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export type MockApiService = { [K in ApiMethod]: Mock };

export const createMockApiService = (): MockApiService => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

export type ApiSurface = Pick<ApiService, ApiMethod>;
