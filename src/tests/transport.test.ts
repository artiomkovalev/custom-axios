import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import MockAdapter from 'axios-mock-adapter';
import { TransportAPI } from '@/transport';

interface TestResult {
  result: string;
}

class TestAPI extends TransportAPI {
  public getClient() {
    return this.client;
  }
}

describe('TransportAPI & Circuit Breaker', () => {
  let api: TestAPI;
  let mock: MockAdapter;

  beforeEach(() => {
    api = new TestAPI({
      enableCache: false,
      retryCount: 0,
    });
    mock = new MockAdapter(api.getClient());
  });

  afterEach(() => {
    mock.restore();
  });

  it('выполняет GET, POST, PUT, PATCH, DELETE запросы', async () => {
    mock.onGet('/test').reply(200, { result: 'get' });
    mock.onPost('/test').reply(200, { result: 'post' });
    mock.onPut('/test').reply(200, { result: 'put' });
    mock.onPatch('/test').reply(200, { result: 'patch' });
    mock.onDelete('/test').reply(200, { result: 'delete' });

    expect(await api.get<TestResult>('/test')).toEqual({ result: 'get' });
    expect(await api.post<TestResult>('/test', { key: 'val' })).toEqual({ result: 'post' });
    expect(await api.put<TestResult>('/test', { key: 'val' })).toEqual({ result: 'put' });
    expect(await api.patch<TestResult>('/test', { key: 'val' })).toEqual({ result: 'patch' });
    expect(await api.delete<TestResult>('/test')).toEqual({ result: 'delete' });
  });

  it('использует fallback при ошибке сети или сервера', async () => {
    mock.onGet('/failing-endpoint').reply(500);

    const fallbackData = { isFallback: true };

    const result = await api.get('/failing-endpoint', {
      serviceKey: 'failing-service',
      fallback: (error, config) => {
        expect(config.url).toBe('/failing-endpoint');
        return fallbackData;
      },
    });

    expect(result).toEqual(fallbackData);
  });

  it('обходит Circuit Breaker при skipBreaker: true', async () => {
    mock.onGet('/direct').reply(200, { status: 'ok' });

    const response = await api.get('/direct', { skipBreaker: true });
    expect(response).toEqual({ status: 'ok' });
  });

  it('применяет customErrorTransformer из опций', async () => {
    class CustomError extends Error {
      constructor(public customMessage: string) {
        super(customMessage);
      }
    }

    const customApi = new TestAPI({
      enableCache: false,
      retryCount: 0,
      customErrorTransformer: () => new CustomError('Custom Error Transformed'),
    });

    const customMock = new MockAdapter(customApi.getClient());
    customMock.onGet('/error').reply(500);

    await expect(customApi.get('/error', { skipBreaker: true })).rejects.toThrow(CustomError);

    customMock.restore();
  });
});
