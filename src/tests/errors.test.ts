import { describe, it, expect } from 'bun:test';
import { ApiError, AppError, NetworkError, isApiErrorPayload } from '@/errors/classifier';
import { isClientError, isServerError, isNetworkError } from '@/errors';
import { defaultErrorTransformer, createApiErrorFromResponse } from '@/errors/transformer';
import axios, { type AxiosResponse } from 'axios';

describe('Error Classes & Classifiers', () => {
  it('AppError создает базовую ошибку с кодом', () => {
    const err = new AppError('Custom message', 'CUSTOM_CODE');
    expect(err.message).toBe('Custom message');
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err).toBeInstanceOf(Error);
  });

  it('ApiError содержит валидные поля по умолчанию', () => {
    const apiErr = new ApiError({ message: 'Bad request', status: 400 });
    expect(apiErr.status).toBe(400);
    expect(apiErr.path).toBe('N/A');
    expect(apiErr.traceId).toBeDefined();
    expect(apiErr.timestamp).toBeDefined();
  });

  it('isApiErrorPayload корректно проверяет структуру payload', () => {
    expect(isApiErrorPayload({ message: 'Err' })).toBeTrue();
    expect(isApiErrorPayload({ code: 'ERR' })).toBeTrue();
    expect(isApiErrorPayload({ errors: [] })).toBeTrue();
    expect(isApiErrorPayload(null)).toBeFalse();
    expect(isApiErrorPayload('String error')).toBeFalse();
  });

  it('isClientError, isServerError, isNetworkError правильно определяют типы ошибок', () => {
    const clientErr = new ApiError({ message: '404', status: 404 });
    const serverErr = new ApiError({ message: '500', status: 500 });

    expect(isClientError(clientErr)).toBeTrue();
    expect(isClientError(serverErr)).toBeFalse();

    const axiosServerErr = new axios.AxiosError(
      'Server Error',
      '500',
      undefined,
      {},
      {
        status: 502,
        statusText: 'Bad Gateway',
        headers: {},
        config: { headers: new axios.AxiosHeaders() },
        data: {}
      }
    );
    expect(isServerError(axiosServerErr)).toBeTrue();

    const axiosNetworkErr = new axios.AxiosError('Network Error', 'ERR_NETWORK');
    expect(isNetworkError(axiosNetworkErr)).toBeTrue();
  });
});

describe('Error Transformer', () => {
  it('defaultErrorTransformer возвращает AppError без изменений', () => {
    const appErr = new AppError('App error');
    expect(defaultErrorTransformer(appErr)).toBe(appErr);
  });

  it('трансформирует AxiosResponse с payload в ApiError', () => {
    const response: AxiosResponse = {
      data: { message: 'Validation failed', code: 'VALIDATION_ERROR' },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    };

    const transformed = createApiErrorFromResponse(response, '/users');
    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.status).toBe(422);
    expect(transformed.code).toBe('VALIDATION_ERROR');
    expect(transformed.message).toBe('Validation failed');
  });

  it('трансформирует сетевую ошибку Axios в NetworkError', () => {
    const axiosNetworkErr = new axios.AxiosError('Network Error', 'ERR_NETWORK');
    axiosNetworkErr.request = {};

    const transformed = defaultErrorTransformer(axiosNetworkErr);
    expect(transformed).toBeInstanceOf(NetworkError);
    expect(transformed.message).toBe('Network Error');
  });
});
