import { AxiosInstance } from 'axios';
import ApiService from '@/services/api.service';
import { mockUser } from './helpers/fixtures';

// A stand-in for the Axios instance ApiService builds internally: callable like
// `axios(config)`, with no-op interceptor registration. Injecting it keeps the auth
// interceptors — and their real network/token calls — out of these unit tests, so we
// exercise only the request preparation and error-mapping logic.
const createFakeAxios = () => Object.assign(vi.fn(), { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } });

const makeService = (instance: ReturnType<typeof createFakeAxios>) => new ApiService(instance as unknown as AxiosInstance);

const axiosError = (status: number, responseExtra: Record<string, unknown> = {}) =>
  Object.assign(new Error(`status ${status}`), { isAxiosError: true, response: { status, config: {}, ...responseExtra } });

describe('api.service', () => {
  it('wraps a successful response as { data, message: "success" }', async () => {
    const instance = createFakeAxios();
    instance.mockResolvedValue({ data: { foo: 1 } });

    await expect(makeService(instance).get({ url: '/x' }, mockUser)).resolves.toEqual({ data: { foo: 1 }, message: 'success' });
  });

  it('passes the HTTP method and stamps the X-Sent-By party header', async () => {
    const instance = createFakeAxios();
    instance.mockResolvedValue({ data: {} });

    await makeService(instance).get({ url: '/x' }, mockUser);

    expect(instance).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'X-Sent-By': [`type=partyId; ${mockUser.partyId}`] }),
      }),
    );
  });

  it('routes each verb through its HTTP method', async () => {
    const instance = createFakeAxios();
    instance.mockResolvedValue({ data: null });
    const service = makeService(instance);

    await service.get({ url: '/x' }, mockUser);
    expect(instance).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'GET' }));

    await service.patch({ url: '/x' }, mockUser);
    expect(instance).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'PATCH' }));

    await service.put({ url: '/x' }, mockUser);
    expect(instance).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'PUT' }));

    await service.delete({ url: '/x' }, mockUser);
    expect(instance).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'DELETE' }));

    await service.post({ url: '/x' }, mockUser);
    expect(instance).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'POST' }));
  });

  it('maps a 404 response to HttpException 404', async () => {
    const instance = createFakeAxios();
    instance.mockRejectedValue(axiosError(404));

    await expect(makeService(instance).get({ url: '/x' }, mockUser)).rejects.toMatchObject({ status: 404 });
  });

  it('maps other API errors to HttpException 500', async () => {
    const instance = createFakeAxios();
    instance.mockRejectedValue(axiosError(503, { data: { message: 'boom' } }));

    await expect(makeService(instance).get({ url: '/x' }, mockUser)).rejects.toMatchObject({ status: 500 });
  });

  it('maps a non-Axios error to HttpException 500', async () => {
    const instance = createFakeAxios();
    instance.mockRejectedValue(new Error('kaboom'));

    await expect(makeService(instance).get({ url: '/x' }, mockUser)).rejects.toMatchObject({ status: 500 });
  });
});
