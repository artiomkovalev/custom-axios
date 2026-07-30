import axios, { type AxiosResponse } from 'axios';
import { ApiError, AppError, isApiErrorPayload, NetworkError } from '@/errors/classifier';

export function createApiErrorFromResponse(
  response: AxiosResponse,
  fallbackPath?: string
): ApiError {
  const { status, data } = response;

  if (isApiErrorPayload(data)) {
    return new ApiError({
      message: data.message || 'N/A',
      status,
      code: data.code,
      path: data.path,
      timestamp: data.timestamp,
      traceId: data.traceId,
      errors: data.errors,
      params: data.params,
    });
  }

  return new ApiError({
    message: typeof data === 'string' ? data : 'API Error',
    status,
    code: 'API_ERROR',
    path: fallbackPath,
  });
}

export function defaultErrorTransformer(error: unknown): Error {
  if (error instanceof AppError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      return createApiErrorFromResponse(error.response, error.config?.url);
    }
    if (error.request) {
      return new NetworkError(error.message);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Unexpected error occurred');
}
