import type { AxiosError, AxiosInstance } from 'axios';
import { apiConfig, type ResolvedApiOptions } from '@/config/api';

interface RefreshPayload {
  refreshToken?: string | null;
}

interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
}

interface QueueItem {
  resolve: (value: void | PromiseLike<void>) => void;
  reject: (error: unknown) => void;
}

export function setupRefreshInterceptor(
  instance: AxiosInstance,
  optionsConfig?: ResolvedApiOptions
) {
  let isRefreshing = false;
  let failedQueue: Array<QueueItem> = [];

  const processQueue = (error: unknown) => {
    failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    failedQueue.length = 0;
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const options = optionsConfig || apiConfig.getConfig();
      const storage = options.tokenStorage || apiConfig.getTokenStorage();
      const { authStrategy, refreshEndpoint } = options;

      const originalRequest = error.config;
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          await new Promise<void>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return instance(originalRequest);
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshPayload: RefreshPayload = authStrategy === 'cookie'
          ? {}
          : { refreshToken: storage.getRefreshToken() };

        try {
          const { data } = await instance.post<RefreshResponse>(
            refreshEndpoint,
            refreshPayload,
            { _retry: true },
          );

          if (authStrategy === 'bearer') {
            if (data?.accessToken) {
              storage.setAccessToken(data.accessToken);
            }
            if (data?.refreshToken) {
              storage.setRefreshToken(data.refreshToken);
            }
          }

          processQueue(null);
          return await instance(originalRequest);
        } catch (err: unknown) {
          processQueue(err);

          if (authStrategy === 'bearer') {
            storage.clearTokens();
          }

          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
}
