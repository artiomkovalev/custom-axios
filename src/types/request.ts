import { type AxiosRequestConfig } from 'axios';

export interface ExtendedRequestConfig<Data = unknown, TResponse = unknown> extends AxiosRequestConfig<Data> {
  serviceKey?: string;
  skipBreaker?: boolean;
  skipCache?: boolean;
  skipErrorTransform?: boolean;
  fallback?: FallbackHandler<TResponse>;
}

declare module 'axios' {
  interface AxiosRequestConfig {
      _retry?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export type FallbackHandler<TResponse = unknown> = (error: unknown, config: ExtendedRequestConfig) => TResponse;

export interface TypedCircuitBreaker {
  fire<T>(action: () => Promise<T>): Promise<T>;
  fallback(fn: (error: unknown) => unknown): void;
}
