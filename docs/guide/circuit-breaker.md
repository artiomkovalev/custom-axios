# Работа с Circuit Breaker

Библиотека автоматически изолирует падающие сервисы, чтобы не создавать лишнюю нагрузку при сбоях.

## Настройка Fallback

Вы можете передать запасной вариант ответа (`fallback`), если сервис временно недоступен или выдал ошибку

```ts
const data = await userService.get<User[]>('/users', {
  serviceKey: 'user-service',
  fallback: (error) => {
    console.warn('Сервис пользователей недоступен, возвращаем кэш/дефолт', error);
    return [{ id: '0', name: 'Offline User' }];
  }
});
```

# Отключение Circuit Breaker для конкретного запроса

Если запрос критичен и не должен проходить через прерыватель:

```ts
const data = await userService.get('/health', {
  skipBreaker: true
});
```
