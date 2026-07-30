import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import MockAdapter from 'axios-mock-adapter';
import { createAxiosInstance } from '@/config/instance';
import { SimpleTokenStorage } from '@/storage/SimpleTokenStorage';

describe('Interceptors & Refresh Logic', () => {
  let instance: ReturnType<typeof createAxiosInstance>;
  let mock: MockAdapter;
  let tokenStorage: SimpleTokenStorage;

  beforeEach(() => {
    let storageMock: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (key: string) => storageMock[key] ?? null,
      setItem: (key: string, value: string) => { storageMock[key] = value; },
      removeItem: (key: string) => { delete storageMock[key]; },
      clear: () => { storageMock = {}; },
    };

    Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true, configurable: true });
    Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true, configurable: true });

    tokenStorage = new SimpleTokenStorage();
    tokenStorage.setAccessToken('initial_access');
    tokenStorage.setRefreshToken('initial_refresh');

    instance = createAxiosInstance({
      tokenStorage,
      authStrategy: 'bearer',
      refreshEndpoint: '/auth/refresh',
      enableCache: false,
      retryCount: 0,
    });

    mock = new MockAdapter(instance);
  });

  afterEach(() => {
    mock.restore();
    tokenStorage.clearTokens();
  });

  it('подставляет Bearer токен в заголовок Authorization', async () => {
    mock.onGet('/users').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer initial_access');
      return [200, [{ id: 1 }]];
    });

    await instance.get('/users');
  });

  it('успешно обновляет токен при 401 и повторяет исходный запрос', async () => {
    mock.onGet('/profile').replyOnce(401);

    mock.onPost('/auth/refresh').reply(200, {
      accessToken: 'new_access_token',
      refreshToken: 'new_refresh_token',
    });

    mock.onGet('/profile').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer new_access_token');
      return [200, { name: 'John' }];
    });

    const response = await instance.get('/profile');
    expect(response.data).toEqual({ name: 'John' });
    expect(tokenStorage.getAccessToken()).toBe('new_access_token');
    expect(tokenStorage.getRefreshToken()).toBe('new_refresh_token');
  });

  it('блокирует параллельные запросы и ставит их в очередь во время рефреша', async () => {
    let refreshCallCount = 0;

    mock.onGet('/req-1').replyOnce(401);
    mock.onGet('/req-2').replyOnce(401);

    mock.onPost('/auth/refresh').reply(() => {
      refreshCallCount++;
      return [200, { accessToken: 'refreshed_access', refreshToken: 'refreshed_refresh' }];
    });

    mock.onGet('/req-1').reply(200, { data: 'res1' });
    mock.onGet('/req-2').reply(200, { data: 'res2' });

    const [res1, res2] = await Promise.all([
      instance.get('/req-1'),
      instance.get('/req-2'),
    ]);

    expect(res1.data).toEqual({ data: 'res1' });
    expect(res2.data).toEqual({ data: 'res2' });
    expect(refreshCallCount).toBe(1);
  });

  it('очищает токены и отклоняет очередь при ошибке обновления', async () => {
    mock.onGet('/protected').reply(401);
    mock.onPost('/auth/refresh').reply(400, { message: 'Invalid refresh token' });

    await expect(instance.get('/protected')).rejects.toThrow();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});
