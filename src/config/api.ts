import { SimpleTokenStorage } from "@/storage/SimpleTokenStorage";
import { TokenStorage } from "@/storage/TokenStorage";
import type { ApiOptions } from "@/types/options";

export type ResolvedApiOptions = Required<Omit<ApiOptions, 'customErrorTransformer'>> & {
  customErrorTransformer?: (error: unknown) => Error;
};

export const DEFAULT_CONFIG: ResolvedApiOptions = {
  baseUrl: '/api',
  timeout: 10000,
  authStrategy: 'bearer',
  withCredentials: false,
  refreshEndpoint: '/auth/refresh',
  authTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  tokenStorage: new SimpleTokenStorage(),
  enableCache: true,
  cacheTTL: 1000 * 60 * 5,
  retryCount: 3,
  logLevel: 'error',
  transformErrors: true,
  customErrorTransformer: undefined,
};

class ApiConfigManager {
  private config: ResolvedApiOptions = {
    ...DEFAULT_CONFIG
  };

  public configure(options: Partial<ApiOptions>): void {
    let withCredentials = options.withCredentials || false;

    if (options.authStrategy === 'cookie') {
      withCredentials = true;
    };

    this.config = {
      ...this.config,
      ...options,
      withCredentials
    };
  }

  public getConfig(): ResolvedApiOptions {
    return this.config;
  }

  public getTokenStorage(): TokenStorage {
    return this.config.tokenStorage;
  }
}

export const apiConfig = new ApiConfigManager();
