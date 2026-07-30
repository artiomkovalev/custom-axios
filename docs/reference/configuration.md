# Справочник параметров конфигурации

## ApiOptions

Настройки экземпляра клиента или глобального объекта `apiConfig`.

| Параметр | Тип | По умолчанию | Описание |
| :--- | :--- | :--- | :--- |
| `baseUrl` | `string` | `'/api'` | Базовый адрес API |
| `timeout` | `number` | `10000` | Таймаут запроса в миллисекундах |
| `withCredentials` | `boolean` | `false` | Передача авторизационных куки |
| `transformErrors` | `boolean` | `true` | Преобразование ошибок в формат `ApiError` |
| `customErrorTransformer` | `(error: unknown) => Error` | `undefined` | Функция трансформации ошибок |
| `enableCache` | `boolean` | `true` | Кеширование GET-запросов |
| `cacheTTL` | `number` | `300000` | Время жизни кеша в миллисекундах (5 минут) |
| `retryCount` | `number` | `3` | Количество повторов при ошибках сети или статусе 429 |
| `authStrategy` | `'bearer' \| 'cookie'` | `'bearer'` | Метод передачи токена |
| `refreshEndpoint` | `string` | `'/auth/refresh'` | URL обновления токенов |
| `authTokenKey` | `string` | `'access_token'` | Ключ access-токена в хранилище |
| `refreshTokenKey` | `string` | `'refresh_token'` | Ключ refresh-токена в хранилище |
| `tokenStorage` | `TokenStorage` | `SimpleTokenStorage` | Реализация хранилища токенов |
| `logLevel` | `'none' \| 'error' \| 'verbose'` | `'error'` | Режим логирования |

## ExtendedRequestConfig

Расширение интерфейса `AxiosRequestConfig` для отдельных запросов.

| Параметр | Тип | По умолчанию | Описание |
| :--- | :--- | :--- | :--- |
| `serviceKey` | `string` | `undefined` | Идентификатор группы для Circuit Breaker |
| `skipBreaker` | `boolean` | `false` | Игнорирование состояния Circuit Breaker |
| `skipCache` | `boolean` | `false` | Выполнение запроса в обход кеша |
| `skipErrorTransform` | `boolean` | `false` | Возврат исходного `AxiosError` при ошибке |
| `fallback` | `(error: unknown, config: ExtendedRequestConfig) => TResponse` | `undefined` | Обработчик для возврата резервных данных |
