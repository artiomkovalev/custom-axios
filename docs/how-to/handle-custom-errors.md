# Настройка и отключение обработки ошибок

Библиотека по умолчанию приводит ошибки Axios к экземплярам класса `ApiError`. Ниже описаны способы отключения и изменения этого поведения.

## Отключение трансформации ошибок

Чтобы получать исходный `AxiosError` в блоках `catch`:

### Для всего инстанса

```typescript
import { TransportAPI } from 'custom-axios';

export const rawApi = new TransportAPI({
  baseUrl: 'https://api.example.com',
  transformErrors: false
});
```

## Для конкретного запроса

```ts
import { api } from './api';

try {
  await api.get('/endpoint', {
    skipErrorTransform: true
  });
} catch (error) {
  // error имеет тип AxiosError
}
```

## Переопределение логики трансформации

Чтобы обрабатывать специфический формат ошибок бэкенда, передайте функцию `customErrorTransformer`:

```ts
import axios from 'axios';
import { TransportAPI, defaultErrorTransformer } from 'custom-axios';

class CustomDomainError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export const api = new TransportAPI({
  baseUrl: 'https://api.example.com',
  customErrorTransformer: (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data?.err_code) {
      return new CustomDomainError(
        error.response.data.err_code,
        error.response.data.err_message
      );
    }

    return defaultErrorTransformer(error);
  }
});
```
