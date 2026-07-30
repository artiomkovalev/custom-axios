# Быстрый старт

Инструкция по установке библиотеки и отправке первого запроса.

## Требования

* Node.js от версии 18 или Bun от версии 1.0
* TypeScript от версии 5.0

## 1. Установка

```bash
bun add custom-axios
```

## 2. Инициализация клиента

Создайте файл `api.ts` и инициализируйте `TransportAPI`:

```ts
import { TransportAPI } from 'custom-axios';

export const api = new TransportAPI({
  baseUrl: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
});
```

## 3. Выполнение запросов

Определите интерфейс ответа и вызовите методы `get` и `post`:

```ts
interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

async function main() {
  const posts = await api.get<Post[]>('/posts');
  console.log('Постов получено:', posts.length);

  const newPost = await api.post<Post, Omit<Post, 'id'>>('/posts', {
    title: 'Заголовок',
    body: 'Текст',
    userId: 1,
  });

  console.log('ID нового поста:', newPost.id);
}

main();
```

## 4. Использование через наследование

Если логика разделена по сервисам, унаследуйте класс от `TransportAPI`:

```ts
import { TransportAPI } from 'custom-axios';

export class PostService extends TransportAPI {
  constructor() {
    super({ baseUrl: 'https://jsonplaceholder.typicode.com' });
  }

  public getPosts() {
    return this.get<Post[]>('/posts', { serviceKey: 'posts-service' });
  }
}

const postService = new PostService();
const posts = await postService.getPosts();
```
