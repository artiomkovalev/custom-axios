# custom-axios

Обёртка над Axios для TypeScript. Включает Circuit Breaker, автоматическое обновление токенов с очередью запросов, повторные попытки, кеширование и обработку ошибок.

## Возможности

* Группирует запросы по `serviceKey` и блокирует вызовы при частых ошибках бэкенда.
* При получении 401 ошибки выполняет один запрос на обновление, а остальные параллельные запросы ставит в очередь.
* Преобразует ошибки Axios в объекты `ApiError` и `NetworkError` с полями `status`, `code` и `traceId`.
* Повторяет попытки при ошибках сети и статусе 429, кеширует GET-ответы.

## Установка

```bash
bun add github:artiomkovalev/custom-axios
```

## Быстрый старт

### Базовый вариант

```typescript
import { TransportAPI } from 'custom-axios';

interface User {
  id: number;
  name: string;
}

const api = new TransportAPI({
  baseUrl: 'https://api.example.com',
  timeout: 5000,
});

async function fetchUsers() {
  try {
    const users = await api.get<User[]>('/users');
    console.log(users);
  } catch (error) {
    console.error('Не удалось получить пользователей:', error);
  }
}
```

### Наследование сервиса

```typescript
import { TransportAPI } from 'custom-axios';

export class UserService extends TransportAPI {
  constructor() {
    super({ baseUrl: 'https://api.example.com/v1' });
  }

  public getUsers() {
    return this.get<User[]>('/users', { serviceKey: 'user-service' });
  }

  public createUser(data: Omit<User, 'id'>) {
    return this.post<User, typeof data>('/users', data);
  }
}
```

## Авторизация и обновление токенов

Поддерживаются две стратегии авторизации: `bearer` и `cookie`.

```typescript
import { apiConfig, SimpleTokenStorage } from 'custom-axios';

apiConfig.configure({
  authStrategy: 'bearer',
  authTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  refreshEndpoint: '/auth/refresh',
  tokenStorage: new SimpleTokenStorage(),
});

const storage = apiConfig.getTokenStorage();
storage.setAccessToken('your_access_token');
storage.setRefreshToken('your_refresh_token');
```

При 401 ошибке клиент отправляет запрос на `refreshEndpoint`. Все параллельные запросы ожидают завершения обновления в очереди, после чего вызывают исходные эндпоинты с новым токеном. Если обновление не удалось, токены сбрасываются через `clearTokens()`.

## Circuit Breaker и запасные ответы

Circuit Breaker предотвращает повторную отправку запросов к недоступному сервису.

### Передача fallback

```typescript
const users = await api.get<User[]>('/users', {
  serviceKey: 'user-service',
  fallback: (error, config) => {
    console.warn(`Запрос к ${config.url} завершился ошибкой. Возврат локальных данных.`);
    return [{ id: 0, name: 'Offline User' }];
  },
});
```

### Прямой запрос без Circuit Breaker

```typescript
const health = await api.get('/health', {
  skipBreaker: true,
});
```

## Обработка ошибок

Ошибки преобразуются в иерархию `AppError`:
* `ApiError`: Ответы с кодами 4xx и 5xx. Содержит HTTP-статус, `code`, `traceId` и список ошибок валидации.
* `NetworkError`: Сбои сети или отсутствие интернет-соединения.

### Кастомный трансформатор ошибок

```typescript
const api = new TransportAPI({
  customErrorTransformer: (error) => {
    return new Error('Кастомная ошибка приложения');
  },
});
```

### Отключение трансформации

```typescript
try {
  await api.get('/endpoint', { skipErrorTransform: true });
} catch (axiosError) {
  // В catch попадает исходный AxiosError
}
```

## Параметры конфигурации (ApiOptions)

| Параметр | Тип | По умолчанию | Описание |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | `'/api'` | Базовый URL для всех запросов |
| `timeout` | `number` | `10000` | Таймаут ожидания ответа (мс) |
| `authStrategy` | `'bearer' \| 'cookie'` | `'bearer'` | Стратегия передачи токенов |
| `refreshEndpoint` | `string` | `'/auth/refresh'` | Эндпоинт обновления токенов |
| `authTokenKey` | `string` | `'access_token'` | Ключ access-токена в хранилище |
| `refreshTokenKey` | `string` | `'refresh_token'` | Ключ refresh-токена в хранилище |
| `tokenStorage` | `TokenStorage` | `SimpleTokenStorage` | Реализация хранилища токенов |
| `enableCache` | `boolean` | `true` | Кеширование GET-запросов |
| `cacheTTL` | `number` | `300000` | Время жизни кеша (мс) |
| `retryCount` | `number` | `3` | Количество повторов при ошибках сети или 429 |
| `logLevel` | `'none' \| 'error' \| 'verbose'` | `'error'` | Режим логирования |
| `transformErrors` | `boolean` | `true` | Преобразование ошибок в `ApiError` |

## Тестирование

```bash
bun test
```
