import { describe, it, expect, beforeEach } from 'bun:test';
import { SimpleTokenStorage } from '@/storage/SimpleTokenStorage';

describe('SimpleTokenStorage', () => {
  let storage: SimpleTokenStorage;
  let mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    mockLocalStorage = {};
    const localStorageMock = {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
      removeItem: (key: string) => { delete mockLocalStorage[key]; },
      clear: () => { mockLocalStorage = {}; },
    };

    Object.defineProperty(globalThis, 'window', {
      value: globalThis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    storage = new SimpleTokenStorage();
  });

  it('сохраняет, получает и удаляет токены в браузере', () => {
    storage.setAccessToken('access_123');
    storage.setRefreshToken('refresh_456');

    expect(storage.getAccessToken()).toBe('access_123');
    expect(storage.getRefreshToken()).toBe('refresh_456');

    storage.clearTokens();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('не выбрасывает ошибку при исполнении на сервере (SSR / window === undefined)', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const ssrStorage = new SimpleTokenStorage();

    expect(() => ssrStorage.setAccessToken('token')).not.toThrow();
    expect(() => ssrStorage.setRefreshToken('token')).not.toThrow();
    expect(ssrStorage.getAccessToken()).toBeNull();
    expect(ssrStorage.getRefreshToken()).toBeNull();
    expect(() => ssrStorage.clearTokens()).not.toThrow();
  });
});
