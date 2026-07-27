import axios from 'axios';
import ApiTokenService from '@/services/api-token.service';

// axios is a third-party module (not an app service), so mocking it is fine per the
// project's testing conventions. The service caches the token in module-level state,
// so each test jumps the fake clock forward a day (below) to guarantee any token
// cached by a previous test has expired and a fresh fetch happens.
vi.mock('axios', () => ({ default: vi.fn() }));
const mockedAxios = vi.mocked(axios);

let clock = Date.UTC(2025, 0, 1);

describe('api-token.service', () => {
  beforeEach(() => {
    mockedAxios.mockReset();
    clock += 24 * 60 * 60 * 1000;
    vi.useFakeTimers();
    vi.setSystemTime(clock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches a fresh token when nothing valid is cached', async () => {
    mockedAxios.mockResolvedValue({ data: { access_token: 'tok-1', expires_in: 3600 } });

    const token = await new ApiTokenService().getToken();

    expect(token).toBe('tok-1');
    expect(mockedAxios).toHaveBeenCalledTimes(1);
  });

  it('reuses the cached token within its validity window', async () => {
    mockedAxios.mockResolvedValue({ data: { access_token: 'tok-2', expires_in: 3600 } });
    const service = new ApiTokenService();

    await service.getToken(); // primes the cache
    mockedAxios.mockClear();
    const second = await service.getToken();

    expect(second).toBe('tok-2');
    expect(mockedAxios).not.toHaveBeenCalled();
  });

  it('refreshes once the token has passed its (margin-adjusted) expiry', async () => {
    mockedAxios.mockResolvedValue({ data: { access_token: 'tok-3', expires_in: 60 } });
    const service = new ApiTokenService();
    expect(await service.getToken()).toBe('tok-3');

    mockedAxios.mockResolvedValue({ data: { access_token: 'tok-4', expires_in: 60 } });
    vi.advanceTimersByTime(60 * 1000); // past the 60s TTL (which is shortened by a 10s margin)

    expect(await service.getToken()).toBe('tok-4');
  });

  it('throws 502 Bad Gateway when the token request fails', async () => {
    mockedAxios.mockRejectedValue(new Error('network down'));

    await expect(new ApiTokenService().getToken()).rejects.toMatchObject({ status: 502 });
  });
});
