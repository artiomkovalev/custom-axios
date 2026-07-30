import type { ExtendedRequestConfig, TypedCircuitBreaker } from '@/types/request';
import type { AxiosInstance } from 'axios';
import type { ApiOptions } from '@/types/options';
import { createAxiosInstance, defaultAxiosInstance } from '@/config/instance';
import { DEFAULT_BREAKER_CONFIG } from '@/config/breaker';
import { isClientError } from '@/errors';
import { NetworkError } from '@/errors/classifier';
import { CircuitBreakerAdapter } from '@/adapter';
import { defaultErrorTransformer } from '@/errors/transformer';
import { isBrowser } from '@/utils/environment';

export class TransportAPI {
  private breakers = new Map<string, TypedCircuitBreaker>();
  protected client: AxiosInstance;
  protected options?: ApiOptions;

  constructor(options?: ApiOptions) {
    this.options = options;
    this.client = this.generateAxiosInstance(options);
  }

  private generateAxiosInstance(options?: ApiOptions) {
    if (options) {
      return createAxiosInstance(options);
    }
    return defaultAxiosInstance;
  }

  private checkOfflineStatus(url?: string): void {
    if (isBrowser() && typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new NetworkError('Device is currently offline');
    }
  }

  private extractServiceKey(url?: string): string {
    if (!url) return 'N/A';
    const cleanUrl = url.replace(/^\/+/, '');
    return cleanUrl.split('/')[0] || 'N/A';
  }

  private getServiceKey<TData = unknown>(
    config: ExtendedRequestConfig<TData>
  ): string {
    if (!config.serviceKey) {
      return this.extractServiceKey(config.url);
    }
    return config.serviceKey;
  }

  private getOrCreateBreaker(
    serviceKey: string
  ): TypedCircuitBreaker {
    let breaker = this.breakers.get(serviceKey);
    if (!breaker) {
      breaker = new CircuitBreakerAdapter({
        ...DEFAULT_BREAKER_CONFIG,
        errorFilter: (error: unknown) => {
          return isClientError(error);
        },
      });
      this.breakers.set(serviceKey, breaker);
    }

    return breaker;
  }

  private transformError(error: unknown, config?: ExtendedRequestConfig): unknown {
    const isTransformDisabled = config?.skipErrorTransform ?? (this.options?.transformErrors === false);
    if (isTransformDisabled) {
      return error;
    }

    if (this.options?.customErrorTransformer) {
      return this.options.customErrorTransformer(error);
    }

    return defaultErrorTransformer(error);
  }

  private async executeRequest<TResponse, TData = unknown>(
    config: ExtendedRequestConfig<TData>
  ): Promise<TResponse> {
    try {
      const requestConfig = {
        ...config,
        cache: !config.skipCache,
      };
      const response = await this.client.request<TResponse>(requestConfig);
      return response.data;
    } catch (error: unknown) {
      throw this.transformError(error, config);
    }
  }

  public async request<TResponse, TData = unknown>(
    config: ExtendedRequestConfig<TData, TResponse>
  ): Promise<TResponse> {
    this.checkOfflineStatus(config.url);
    if (config.skipBreaker) {
      return this.executeRequest<TResponse, TData>(config);
    }

    const serviceKey: string = this.getServiceKey<TData>(config);
    const breaker = this.getOrCreateBreaker(serviceKey);
    try {
      return await breaker.fire(() => {
        return this.executeRequest<TResponse>(config);
      });
    } catch (error) {
      if (config.fallback) {
        return config.fallback(error, config);
      }
      throw error;
    }
  }

  public get<TResponse = unknown>(
    url: string,
    config?: ExtendedRequestConfig<unknown, TResponse>,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: 'GET',
      url
    });
  }

  public post<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: ExtendedRequestConfig<TData, TResponse>,
  ): Promise<TResponse> {
    return this.request<TResponse, TData>({
      ...config,
      method: 'POST',
      url,
      data
    });
  }

  public put<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: ExtendedRequestConfig<TData, TResponse>,
  ): Promise<TResponse> {
    return this.request<TResponse, TData>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  public patch<TResponse = unknown, TData = unknown>(
    url: string,
    data?: TData,
    config?: ExtendedRequestConfig<TData, TResponse>,
  ): Promise<TResponse> {
    return this.request<TResponse, TData>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }

  public delete<TResponse = unknown>(
    url: string,
    config?: ExtendedRequestConfig<unknown, TResponse>,
  ): Promise<TResponse> {
    return this.request<TResponse>({
      ...config,
      method: 'DELETE',
      url
    });
  }
}
