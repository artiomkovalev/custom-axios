# Использование Circuit Breaker

Circuit Breaker отслеживает частоту ошибок при вызовах. Если процент ответов с ошибкой превышает порог, прерыватель размыкает цепь и блокирует последующие запросы к сервису без отправки реальных сетевых пакетов.

## Группировка по serviceKey

По умолчанию `serviceKey` берется из первого сегмента URL (из `/users/123` формируется `serviceKey = 'users'`). Переопределить ключ можно в конфиге запроса:

```typescript
await api.get('/v2/analytics/reports', {
  serviceKey: 'analytics-service'
});
```

Запросы с одинаковым `serviceKey` управляются одним экземпляром Circuit Breaker.

## Возврат резервных данных через fallback

Параметр `fallback` позволяет вернуть значение по умолчанию вместо выброса ошибки при замкнутой цепи или сбое запроса:

```ts
const userList = await api.get<User[]>('/users', {
  serviceKey: 'users-service',
  fallback: (error, config) => {
    console.warn(`Запрос к ${config.url} завершился ошибкой. Возврат дефолтных данных.`);
    return [{ id: '0', name: 'Default User' }];
  }
});
```

## Обход Circuit Breaker

Чтобы запрос выполнялся напрямую независимо от состояния прерывателя:

```ts
const status = await api.get('/health', {
  skipBreaker: true
});
```
