import { v4 as uuid } from 'uuid';
import type { ApiErrorField, ApiErrorParamValue, ApiErrorPayload } from '@/types/error';

export class AppError extends Error {
  public readonly code: string;

  constructor(message: string, code = 'UNKNOWN_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ApiError extends AppError {
  public readonly status: number;
  public readonly path: string;
  public readonly timestamp: string;
  public readonly traceId: string;
  public readonly errors?: ApiErrorField[];
  public readonly params?: Record<string, ApiErrorParamValue>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message, payload.code);
    this.status = payload.status || 0;
    this.path = payload.path || 'N/A';
    this.timestamp = payload.timestamp || new Date().toISOString();
    this.traceId = payload.traceId || uuid();
    this.errors = payload.errors;
    this.params = payload.params;
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class SyntheticError extends ApiError {
  constructor(message: string, code: string, status: number, path: string) {
    super({
      message,
      code,
      status,
      path,
      timestamp: new Date().toISOString(),
      traceId: uuid(),
    });
  }
}

export function isApiErrorPayload(data: unknown): data is Partial<ApiErrorPayload> {
  return (
    typeof data === 'object' &&
    data !== null && (
      'message' in data ||
      'code' in data ||
      'errors' in data
    )
  );
}
