import { isAxiosError } from 'axios';
import { ApiError } from './classifier';

export function isClientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 400 && error.status < 500;
  }
  if (isAxiosError(error) && error.response) {
    return error.response.status >= 400 && error.response.status < 500;
  }
  return false;
}

export function isServerError(error: unknown): boolean {
  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    return status >= 500 && status < 600;
  }
  return false;
}

export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && error.code === 'ERR_NETWORK';
}
