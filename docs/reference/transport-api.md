# Класс TransportAPI

Класс `TransportAPI` содержит методы выполнения HTTP-запросов.

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
