import type { TokenStorage } from '@/storage/TokenStorage';

export type AuthStrategy = 'bearer' | 'cookie';
export type LogLevel = 'none' | 'error' | 'verbose';

export interface ApiOptions {
  baseUrl?: string;
  timeout?: number;
  withCredentials?: boolean;

  transformErrors?: boolean;
  customErrorTransformer?: (error: unknown) => Error;

  enableCache?: boolean;
  cacheTTL?: number;

  retryCount?: number;

  authTokenKey?: string;
  refreshTokenKey?: string;

  authStrategy?: AuthStrategy;
  refreshEndpoint?: string;
  tokenStorage?: TokenStorage;

  logLevel?: LogLevel;
}
