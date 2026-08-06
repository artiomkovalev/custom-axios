import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { setupCache, buildKeyGenerator } from 'axios-cache-interceptor';
import type { ApiOptions } from '@/types/options';
import { apiConfig } from '@/config/api';
import { createAuthInterceptor } from '@/interceptors/auth';
import { createLoggingInterceptor } from '@/interceptors/logging';
import { setupRefreshInterceptor } from '@/interceptors/refresh';

const hashGenerator = buildKeyGenerator((req) => ({
  baseURL: req.baseURL,
  url: req.url,
  method: req.method,
  params: req.params,
  data: req.data,
}));

function hasServiceKey(config: unknown): config is { serviceKey: string } {
  return (
    typeof config === 'object' &&
    config !== null &&
    'serviceKey' in config &&
    typeof Reflect.get(config, 'serviceKey') === 'string'
  );
}

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
      staleIfError: true,
      generateKey: (req) => {
        const hash = hashGenerator(req);

        const url = req.url ?? '';
        let serviceKey = '';

        if (hasServiceKey(req)) {
          serviceKey = req.serviceKey;
        } else {
          serviceKey = url.replace(/^\/+/, '').split('/')[0] || 'N/A';
        }

        return `${serviceKey}::${url}::${hash}`;
      }
    });
  }

  return instance;
}

export const defaultAxiosInstance = createAxiosInstance();
