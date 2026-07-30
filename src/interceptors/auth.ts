import type { InternalAxiosRequestConfig } from "axios";
import { apiConfig, type ResolvedApiOptions } from "@/config/api";

export function createAuthInterceptor(configGetter?: ResolvedApiOptions) {
  return function authInterceptor(config: InternalAxiosRequestConfig) {
    const options = configGetter || apiConfig.getConfig();
    const { authStrategy, refreshEndpoint, tokenStorage } = options;

    if (authStrategy === 'cookie' || config.url === refreshEndpoint) {
      return config;
    }

    const storage = tokenStorage || apiConfig.getTokenStorage();
    const token = storage.getAccessToken();

    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  };
}

export const authInterceptor = createAuthInterceptor();
