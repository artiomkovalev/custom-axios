# Класс TransportAPI

Класс `TransportAPI` содержит методы выполнения HTTP-запросов и управления состоянием.

## Конструктор

```typescript
constructor(options?: ApiOptions)
```

Принимает объект `ApiOptions`. Если аргумент пропущен, применяются значения из `DEFAULT_CONFIG`.

## Методы

### `get`
```typescript
public get<TResponse>(
  url: string, 
  config?: ExtendedRequestConfig<unknown, TResponse>
): Promise<TResponse>
```

### `post`
```typescript
public post<TResponse, TData = unknown>(
  url: string, 
  data?: TData, 
  config?: ExtendedRequestConfig<TData, TResponse>
): Promise<TResponse>
```

### `put`
```typescript
public put<TResponse, TData = unknown>(
  url: string, 
  data?: TData, 
  config?: ExtendedRequestConfig<TData, TResponse>
): Promise<TResponse>
```

### `patch`
```typescript
public patch<TResponse, TData = unknown>(
  url: string, 
  data?: TData, 
  config?: ExtendedRequestConfig<TData, TResponse>
): Promise<TResponse>
```

### `delete`
```typescript
public delete<TResponse>(
  url: string, 
  config?: ExtendedRequestConfig<unknown, TResponse>
): Promise<TResponse>
```

### `request`
```typescript
public request<TResponse, TData = unknown>(
  config: ExtendedRequestConfig<TData, TResponse>
): Promise<TResponse>
```
Базовый метод отправки запросов. Вызывается внутри `get`, `post`, `put`, `patch` и `delete`.

## Методы управления кэшем

### `invalidateCacheByUrl`
```typescript
public invalidateCacheByUrl(url: string): Promise<void>
```
Удаляет из кэша все сохраненные ответы для указанного относительного URL.

### `invalidateCacheByService`
```typescript
public invalidateCacheByService(serviceKey: string): Promise<void>
```
Очищает весь кэш, привязанный к указанному `serviceKey` (группе запросов).

### `invalidateAllCache`
```typescript
public invalidateAllCache(): Promise<void>
```
Полностью очищает внутреннее хранилище кэша для данного экземпляра API.

## ExtendedRequestConfig

Расширяет стандартный `AxiosRequestConfig`:

| Параметр | Тип | Описание |
| :--- | :--- | :--- |
| `serviceKey` | `string` | Идентификатор сервиса для группировки Circuit Breaker и кэша |
| `skipBreaker` | `boolean` | Пропустить Circuit Breaker |
| `skipCache` | `boolean` | Игнорировать кэш для текущего запроса |
| `fallback` | `FallbackHandler` | Функция-фоллбэк при ошибке или открытом Breaker |
