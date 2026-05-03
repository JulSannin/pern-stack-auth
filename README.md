# PERN Stack Authentication

Учебный проект — реализация аутентификации на стеке **PERN** (PostgreSQL, Express, React, Node.js) с использованием JWT, хранящегося в `httpOnly` cookie.

## Стек

**Backend**
- Node.js + Express v5 (ES modules)
- PostgreSQL + `pg` (пул соединений)
- `bcryptjs` — хэширование паролей
- `jsonwebtoken` — генерация и верификация JWT
- `cookie-parser` — чтение cookie из запросов
- `cors`, `dotenv`

**Frontend**
- React v19 + Vite v8
- React Router DOM v7
- Axios (с `withCredentials: true`)
- Tailwind CSS v4

## Структура проекта

```
├── backend/
│   ├── server.js              — точка входа Express
│   ├── config/db.js           — пул соединений с PostgreSQL
│   ├── middleware/auth.js     — JWT-middleware (protect)
│   └── routes/auth.js         — маршруты аутентификации
└── frontend/src/
    ├── app/
    │   ├── main.jsx           — точка входа React
    │   ├── App.jsx            — роутинг и глобальный state
    │   └── index.css
    ├── pages/
    │   ├── home/              — главная страница
    │   ├── login/             — страница входа
    │   └── register/          — страница регистрации
    ├── widgets/header/navbar/ — навигационная панель
    └── shared/NotFound.jsx    — страница 404
```

## API

| Метод | Маршрут | Описание |
|-------|---------|----------|
| `POST` | `/api/auth/register` | Регистрация — `{ name, email, password }` |
| `POST` | `/api/auth/login` | Вход — `{ email, password }` |
| `POST` | `/api/auth/logout` | Выход (удаляет cookie) |
| `GET` | `/api/auth/me` | Данные текущего пользователя (требует токен) |

## Запуск

### Требования

- Node.js ≥ 18
- PostgreSQL

### База данных

```sql
CREATE TABLE users (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(100) NOT NULL,
    email    VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

### Backend

Создайте `backend/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
NODE_ENV=development
```

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite автоматически проксирует запросы `/api/*` на `http://localhost:5000`.

## Безопасность

- JWT хранится в **httpOnly cookie** — недоступен из JavaScript (защита от XSS)
- `sameSite: Strict` — защита от CSRF
- `secure: true` в продакшене — передача только по HTTPS
- Пароли хранятся в виде bcrypt-хэша (10 раундов соли)
- При неверных credentials возвращается общее сообщение — не раскрывается, что именно неверно
