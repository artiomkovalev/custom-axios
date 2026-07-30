# TransportAPI Reference

Абстрактный класс, предоставляющий методы для создания HTTP-клиентов.

## Методы

### `get<TResponse>(url: string, config?: ExtendedRequestConfig): Promise<TResponse>`
Выполняет GET-запрос.

### `post<TResponse, TData>(url: string, data?: TData, config?: ExtendedRequestConfig): Promise<TResponse>`
Выполняет POST-запрос.

### `put<TResponse, TData>(url: string, data?: TData, config?: ExtendedRequestConfig): Promise<TResponse>`
Выполняет PUT-запрос.

### `delete<TResponse>(url: string, config?: ExtendedRequestConfig): Promise<TResponse>`
Выполняет DELETE-запрос.

## ExtendedRequestConfig

Расширяет стандартный `AxiosRequestConfig`:

| Параметр | Тип | Описание |
| :--- | :--- | :--- |
| `serviceKey` | `string` | Идентификатор сервиса для группировки Circuit Breaker |
| `skipBreaker` | `boolean` | Пропустить Circuit Breaker |
| `skipCache` | `boolean` | Игнорировать кэш для запроса |
| `fallback` | `FallbackHandler` | Функция-фоллбэк при ошибке или открытом Breaker |
