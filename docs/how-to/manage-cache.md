# Управление кэшированием

Библиотека поддерживает автоматическое кэширование GET-запросов из коробки.

## Настройка кэширования

По умолчанию кэширование включено, а время жизни кэша составляет 5 минут. Вы можете изменить эти параметры при конфигурации инстанса:

```typescript
import { apiConfig } from 'custom-axios';

apiConfig.configure({
  enableCache: true,
  cacheTTL: 1000 * 60 * 10,
});
```

### Отключение кэша для конкретного запроса

Если вам нужно получить гарантированно свежие данные для определенного запроса, используйте флаг `skipCache`:

```typescript
const data = await api.get('/users/profile', {
  skipCache: true
});
```

## Инвалидация кэша

Часто возникает ситуация, когда после изменения данных на сервере нужно сбросить закэшированные ответы, чтобы следующий `GET` запрос вернул актуальную информацию. 

Для этого в классе `TransportAPI` предусмотрены специальные методы инвалидации.

### 1. Сброс по URL

Позволяет точечно удалить кэш для конкретного эндпоинта.

```typescript
await api.get('/articles'); 

await api.post('/articles', { title: 'Новая статья' });

await api.invalidateCacheByUrl('/articles');

await api.get('/articles');
```

### 2. Сброс по serviceKey

Если у вас сложная структура эндпоинтов, привязанная к одному сервису, вы можете очистить кэш сразу для всего сервиса, используя `serviceKey`.

```typescript
await api.get('/analytics/reports', { serviceKey: 'analytics' });
await api.get('/analytics/stats', { serviceKey: 'analytics' });

await api.invalidateCacheByService('analytics');
```
*Примечание: Если `serviceKey` не передан явно, он автоматически вычисляется как первый сегмент URL (например, для `/users/123` serviceKey будет `users`).*

### 3. Полный сброс кэша

В некоторых ситуациях может потребоваться полностью очистить кэш:

```typescript
await api.invalidateAllCache();
```
