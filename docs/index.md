---
layout: home

hero:
  name: "Custom Axios"
  text: "HTTP-клиент для TypeScript"
  tagline: "Обёртка над Axios с поддержкой Circuit Breaker, повторными запросами, кешированием и автоматическим обновлением токенов"
  actions:
    - theme: brand
      text: Быстрый старт
      link: /guide/getting-started
    - theme: alt
      text: Справочник API
      link: /reference/transport-api

features:
  - title: Инстансы и наследование
    details: Создание экземпляров через new TransportAPI() или наследование сервисных классов.
  - title: Изоляция сбоев
    details: Использование Opossum для группировки запросов по serviceKey и блокировки упавших сервисов.
  - title: Настройка ошибок
    details: Парсинг ответов сервера в ApiError, точечное отключение через skipErrorTransform или замена через customErrorTransformer.
---
