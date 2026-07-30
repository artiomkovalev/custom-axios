
import { describe, it, expect, beforeEach } from 'bun:test';
import { apiConfig, DEFAULT_CONFIG } from '@/config/api';

describe('ApiConfigManager', () => {
  beforeEach(() => {
    apiConfig.configure(DEFAULT_CONFIG);
  });

  it('возвращает конфиг по умолчанию', () => {
    const config = apiConfig.getConfig();
    expect(config.baseUrl).toBe('/api');
    expect(config.authStrategy).toBe('bearer');
  });

  it('обновляет параметры через configure()', () => {
    apiConfig.configure({
      baseUrl: 'https://api.example.com',
      authStrategy: 'cookie',
    });

    const config = apiConfig.getConfig();
    expect(config.baseUrl).toBe('https://api.example.com');
    expect(config.authStrategy).toBe('cookie');
    expect(config.withCredentials).toBeTrue();
  });
});
