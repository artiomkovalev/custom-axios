# Авторизация и обновление токенов

Настройка передачи заголовка `Authorization: Bearer <token>` и автоматической обработки ошибок `401 Unauthorized`.

## Настройка стратегии Bearer

По умолчанию используется `SimpleTokenStorage` (`localStorage`).

```typescript
import { apiConfig, SimpleTokenStorage } from 'custom-axios';

apiConfig.configure({
  authStrategy: 'bearer',
  authTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  refreshEndpoint: '/auth/refresh',
  tokenStorage: new SimpleTokenStorage()
});

const storage = apiConfig.getTokenStorage();
storage.setAccessToken('access_token_value');
storage.setRefreshToken('refresh_token_value');
```

Интерцептор извлекает `access_token` из хранилища и добавляет заголовок к каждому запросу.

## Настройка стратегии Cookie

При работе через HttpOnly Cookie используйте режим `cookie`:

```ts
apiConfig.configure({
  authStrategy: 'cookie',
  withCredentials: true,
  refreshEndpoint: '/auth/refresh'
});
```

## Кастомное хранилище токенов

Для SSR или сторонних сред реализуйте класс `TokenStorage`:

```ts
import { TokenStorage, apiConfig } from 'custom-axios';

class CookieTokenStorage extends TokenStorage {
  getAccessToken(): string | null {
    return getCookie('access_token') ?? null;
  }

  setAccessToken(token: string): void {
    setCookie('access_token', token);
  }

  getRefreshToken(): string | null {
    return getCookie('refresh_token') ?? null;
  }

  setRefreshToken(token: string): void {
    setCookie('refresh_token', token);
  }

  clearTokens(): void {
    deleteCookie('access_token');
    deleteCookie('refresh_token');
  }
}

apiConfig.configure({
  tokenStorage: new CookieTokenStorage()
});
```

## Алгоритм работы очереди при 401 ошибке

1. Сервер возвращает статус 401.
2. Первый запрос взводит флаг `isRefreshing = true` и отправляет POST-запрос на `refreshEndpoint` с заголовком `{ _retry: true }`.
3. Параллельные запросы, пришедшие во время обновления, помещаются в массив `failedQueue`.
4. При успешном ответе рефреш-эндпоинта новые токены записываются в `tokenStorage`, после чего запросы из `failedQueue` выполняются повторно.
5. Если запрос обновления завершился ошибкой, очередь отклоняется, а токены удаляются вызовом `clearTokens()`.
