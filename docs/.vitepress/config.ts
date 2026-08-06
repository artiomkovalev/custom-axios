import { defineConfig } from 'vitepress';
import path from 'node:path';

export default defineConfig({
  title: 'Custom Axios',
  description: 'Документация HTTP-клиента',
  cleanUrls: true,

  vite: {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src')
      }
    }
  },

  themeConfig: {
    nav: [
      { text: 'Быстрый старт', link: '/guide/getting-started' },
      { text: 'Инструкции', link: '/how-to/configure-auth-and-refresh' },
      { text: 'Справочник', link: '/reference/transport-api' },
      { text: 'Архитектура', link: '/explanation/resilience-architecture' }
    ],

    sidebar: [
      {
        text: 'Обучение',
        items: [
          { text: 'Быстрый старт', link: '/guide/getting-started' }
        ]
      },
      {
        text: 'Инструкции',
        items: [
          { text: 'Авторизация и обновление токенов', link: '/how-to/configure-auth-and-refresh' },
          { text: 'Обработка ошибок', link: '/how-to/handle-custom-errors' },
          { text: 'Настройка Circuit Breaker', link: '/how-to/configure-circuit-breaker' },
          { text: 'Управление кэшированием', link: '/how-to/manage-cache' },
        ]
      },
      {
        text: 'Справочник',
        items: [
          { text: 'TransportAPI', link: '/reference/transport-api' },
          { text: 'Параметры конфигурации', link: '/reference/configuration' },
          { text: 'Классы ошибок', link: '/reference/error-classes' }
        ]
      },
      {
        text: 'Архитектура',
        items: [
          { text: 'Схема работы', link: '/explanation/resilience-architecture' }
        ]
      }
    ]
  }
});
