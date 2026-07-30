import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { apiConfig, type ResolvedApiOptions } from "@/config/api";

interface BadgeStyle {
  badge: string;
  reset: string;
}

const DEFAULT_COLOR = '#00abc5';
const SUCCESS_COLOR = '#4caf50';
const NON_SUCCESS_COLOR = '#ff9800';
const ERROR_COLOR = '#f44336';

export class BrowserLogger {
  private moduleName: string;
  private color: string;

  constructor(moduleName = 'transport', color = DEFAULT_COLOR) {
    this.moduleName = moduleName;
    this.color = color;
  }

  private createBadgeStyle(backgroundColor: string): BadgeStyle {
    return {
      badge: `background: ${backgroundColor}; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;`,
      reset: 'background: transparent; color: inherit;',
    };
  }

  private getConfigParams(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig['params'] | string {
    if (!config.params) {
      return '';
    }
    return config.params;
  }

  private getBadgeColor(status: number): string {
    if (status >= 200 && status < 300) {
      return SUCCESS_COLOR;
    }
    return NON_SUCCESS_COLOR;
  }

  private getErrorPayload(error: AxiosError) {
    if (!error.response?.data) {
      return error.message;
    }
    return error.response.data;
  }

  public logRequest(config: InternalAxiosRequestConfig): void {
    const method = config.method?.toUpperCase() || 'N/A';
    const url = config.url || 'N/A';
    const { badge, reset } = this.createBadgeStyle(this.color);
    console.log(
      `%c${this.moduleName}%c 🚀 [${method}] ${url}`,
      badge,
      reset,
      this.getConfigParams(config)
    );
  }

  public logResponse(response: AxiosResponse): void {
    const method = response.config.method?.toUpperCase() || 'N/A';
    const url = response.config.url || 'N/A';
    const status = response.status;
    const badgeColor = this.getBadgeColor(status);
    const { badge, reset } = this.createBadgeStyle(badgeColor);
    console.log(
      `%c${this.moduleName}%c ✅ [${method} ${status}] ${url}`,
      badge,
      reset,
      response.data
    );
  }

  public logError(error: AxiosError): void {
    const method = error.config?.method?.toUpperCase() || 'N/A';
    const url = error.config?.url || 'N/A';
    const status = error.response?.status || 'N/A';
    const { badge, reset } = this.createBadgeStyle(ERROR_COLOR);
    console.error(
      `%c${this.moduleName}%c ❌ [${method} ${status}] ${url}`,
      badge,
      reset,
      this.getErrorPayload(error),
    );
  }
}

const browserLogger = new BrowserLogger();

export function createLoggingInterceptor(configGetter?: ResolvedApiOptions) {
  const options = configGetter || apiConfig.getConfig();

  return {
    request: (config: InternalAxiosRequestConfig) => {
      const { logLevel } = options;
      if (logLevel === 'verbose') {
        browserLogger.logRequest(config);
      }
      return config;
    },
    response: (response: AxiosResponse) => {
      const { logLevel } = options;
      if (logLevel === 'verbose') {
        browserLogger.logResponse(response);
      }
      return response;
    },
    error: (error: AxiosError) => {
      const { logLevel } = options;
      if (logLevel === 'error' || logLevel === 'verbose') {
        browserLogger.logError(error);
      }
      return Promise.reject(error);
    },
  };
}

export const loggingInterceptor = createLoggingInterceptor();
