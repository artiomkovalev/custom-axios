import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { setupCache } from 'axios-cache-interceptor';
import type { ApiOptions } from '@/types/options';
import { apiConfig } from '@/config/api';
import { createAuthInterceptor } from '@/interceptors/auth';
import { createLoggingInterceptor } from '@/interceptors/logging';
import { setupRefreshInterceptor } from '@/interceptors/refresh';

export function createAxiosInstance(options?: ApiOptions): AxiosInstance {
  const globalConfig = apiConfig.getConfig();
  const config = {
    ...globalConfig,
    ...options,
  };
  const instance = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    withCredentials: config.withCredentials,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (config.retryCount > 0) {
    axiosRetry(instance, {
      retries: config.retryCount,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
      },
    });
  }

  const logging = createLoggingInterceptor(config);

  instance.interceptors.request.use(createAuthInterceptor(config));
  instance.interceptors.request.use(logging.request);
  instance.interceptors.response.use(
    logging.response,
    logging.error,
  );

  setupRefreshInterceptor(instance, config);

  if (config.enableCache) {
    return setupCache(instance, {
      ttl: config.cacheTTL,
      interpretHeader: true,
    });
  }

  return instance;
}

export const defaultAxiosInstance = createAxiosInstance();
