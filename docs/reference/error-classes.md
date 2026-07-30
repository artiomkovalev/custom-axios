# Классы ошибок

Иерархия классов, используемых при включенном параметре `transformErrors: true`.

```text
AppError
 ├── ApiError
 │    └── SyntheticError
 └── NetworkError
```

## AppError
Базовый класс ошибок библиотеки. Наследуется от стандартного `Error`.

* `code: string` (по умолчанию `'UNKNOWN_ERROR'`)

## ApiError
Наследуется от `AppError`. Создается при получении ответа от сервера со статусом 4xx или 5xx.

* `status: number` (HTTP-статус ответа)
* `path: string` (URL запроса)
* `timestamp: string` (время ошибки в формате ISO)
* `traceId: string` (уникальный UUID запроса)
* `errors?: ApiErrorField[]` (список ошибок валидации)
* `params?: Record<string, ApiErrorParamValue>` (дополнительные структуры данных ответа)

## NetworkError
Наследуется от `AppError`. Выбрасывается при отсутствии соединения с сервером. Поле `code` имеет значение `'NETWORK_ERROR'`.

## SyntheticError
Наследуется от `ApiError`. Используется для ручного создания объектов ошибок с заполнением полей `timestamp` и `traceId`.
