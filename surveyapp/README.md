# 📊 SurveyPro 98

> Веб-сервис для проведения онлайн-опросов в стиле Windows 98

**Курсовой проект · ПМ04 — Проектирование и обеспечение бесперебойной работы web-сайта**

## 🌐 Демо

| Сервис | Ссылка |
|--------|--------|
| Фронтенд (Vercel) | https://surveyapp-tawny.vercel.app |
| Бэкенд API (Render) | https://surveyapp-ars0.onrender.com/api/health |

---

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm 9+

### 1. Установить зависимости

```bash
# Клиент (React)
cd client && npm install

# Сервер (Node.js)
cd ../server && npm install
```

### 2. Настроить переменные окружения

Создать файл `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/surveyapp
JWT_SECRET=your_secret_key_here
PORT=5000
```

Создать файл `client/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Запустить

**Терминал 1 — Бэкенд:**
```bash
cd server
npm run dev       # с hot-reload (nodemon)
# или
npm start         # без hot-reload
```

**Терминал 2 — Фронтенд:**
```bash
cd client
npm start
```

| Сервис | Адрес |
|--------|-------|
| React (фронтенд) | http://localhost:3000 |
| Express (API) | http://localhost:5000 |
| Health check | http://localhost:5000/api/health |

---

## 🛠 Стек технологий

### Фронтенд
| Технология | Назначение |
|---|---|
| **React 18** | UI (функциональные компоненты + хуки) |
| **React Router v6** | Маршрутизация (страницы) |
| **Context API** | Глобальное состояние |
| **CSS3** | Win98 дизайн-система |

### Бэкенд
| Технология | Назначение |
|---|---|
| **Node.js + Express** | REST API сервер |
| **MongoDB Atlas + Mongoose** | Облачная база данных |
| **bcryptjs** | Хеширование паролей (cost=12) |
| **jsonwebtoken** | JWT аутентификация |
| **express-validator** | Серверная валидация |

---

## 📂 Структура проекта

```
surveyapp/
├── client/                     # React фронтенд
│   └── src/
│       ├── components/
│       │   └── UI.js           # Win98 компоненты (Window, Taskbar, ...)
│       ├── context/
│       │   ├── AuthContext.js  # Авторизация (register/login/logout)
│       │   └── SurveyContext.js# CRUD опросов + offline fallback
│       ├── pages/
│       │   ├── SurveysPage.js  # Список с поиском и фильтрами
│       │   ├── SurveyPage.js   # Прохождение + результаты
│       │   ├── CreatePage.js   # Конструктор опросов
│       │   ├── DashboardPage.js# Статистика + вкладки
│       │   ├── LoginPage.js    # Форма входа с валидацией
│       │   ├── RegisterPage.js # Регистрация + сила пароля
│       │   └── OtherPages.js   # Профиль, 404
│       ├── styles/
│       │   └── win98.css       # Полная Win98 дизайн-система
│       └── utils/
│           ├── api.js          # HTTP клиент (fetch wrapper)
│           └── validation.js   # Клиентская валидация форм
│
├── server/                     # Node.js бэкенд
│   ├── middleware/
│   │   ├── auth.js             # JWT middleware (requireAuth, optionalAuth)
│   │   └── db.js               # Подключение к MongoDB Atlas
│   ├── models/
│   │   ├── User.js             # Mongoose схема пользователя
│   │   ├── Survey.js           # Mongoose схема опроса
│   │   └── Response.js         # Mongoose схема ответа
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   ├── surveys.js          # GET/POST/PUT/DELETE /surveys + /respond
│   │   └── users.js            # GET /me/surveys, GET /me/stats
│   └── index.js                # Точка входа Express
│
├── .gitignore
├── package.json
└── README.md
```

---

## 📡 API Документация

Базовый URL: `https://surveyapp-ars0.onrender.com/api`  
Аутентификация: `Authorization: Bearer <JWT_TOKEN>`

### Аутентификация

#### `POST /auth/register` — Регистрация

**Тело запроса:**
```json
{
  "username": "Ansar",
  "email": "ansar@example.com",
  "password": "secret123"
}
```
**Валидация:** username 3–30 символов, email корректный, пароль ≥ 6 символов

**Ответ `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "64f...", "username": "Ansar", "email": "ansar@example.com" }
}
```
**Ошибки:** `400` (валидация), `409` (email или username уже занят)

---

#### `POST /auth/login` — Вход

**Тело запроса:**
```json
{ "email": "ansar@example.com", "password": "secret123" }
```
**Ответ `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "64f...", "username": "Ansar", "email": "ansar@example.com" }
}
```
**Ошибки:** `401` (неверный пароль или пользователь не найден)

---

#### `GET /auth/me` — Текущий пользователь

**Заголовок:** `Authorization: Bearer <token>`  
**Ответ `200`:** `{ "user": { "id": "...", "username": "...", "email": "..." } }`

---

### Опросы (полный CRUD)

| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `GET` | `/api/surveys` | Список (фильтры, пагинация) | opt |
| `GET` | `/api/surveys/:id` | Один опрос | opt |
| `POST` | `/api/surveys` | Создать | ✅ |
| `PUT` | `/api/surveys/:id` | Обновить (только автор) | ✅ |
| `DELETE` | `/api/surveys/:id` | Удалить (только автор) | ✅ |
| `POST` | `/api/surveys/:id/respond` | Отправить ответы | opt |
| `GET` | `/api/surveys/:id/responses` | Все ответы (только автор) | ✅ |

#### `GET /surveys` — Список опросов

**Query-параметры:**
| Параметр | Тип | Описание |
|---|---|---|
| `category` | string | Фильтр по категории (Технологии, Образование, ...) |
| `status` | string | `active` или `closed` |
| `search` | string | Поиск по названию и описанию |
| `page` | number | Номер страницы (default: 1) |
| `limit` | number | Записей на странице (default: 20) |

**Ответ `200`:**
```json
{
  "surveys": [{ "id": "...", "title": "...", "responses": 5, ... }],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

---

#### `POST /surveys` — Создать опрос

**Тело запроса:**
```json
{
  "title": "Мой опрос",
  "desc": "Описание опроса",
  "category": "Технологии",
  "questions": [
    { "type": "single", "text": "Вопрос 1?", "options": ["Да", "Нет"] },
    { "type": "multiple", "text": "Вопрос 2?", "options": ["A", "B", "C"] },
    { "type": "rating", "text": "Оцените от 1 до 5" },
    { "type": "text", "text": "Ваш комментарий" },
    { "type": "single", "text": "Вопрос 5?", "options": ["Вариант 1", "Вариант 2"] }
  ]
}
```

**Типы вопросов:** `single` (одиночный), `multiple` (множественный), `rating` (1–5), `text` (свободный ответ)  
**Валидация:** минимум 5 вопросов, название 5–120 символов  
**Ответ `201`:** `{ "survey": { "id": "...", ... } }`

---

#### `POST /surveys/:id/respond` — Отправить ответы

**Тело запроса:**
```json
{
  "answers": {
    "0": 1,
    "1": [0, 2],
    "2": 4,
    "3": "Отличный проект!"
  }
}
```
Формат `answers`: ключ — индекс вопроса (0, 1, 2...), значение — индекс варианта (single), массив индексов (multiple), число 1–5 (rating), строка (text).

**Ответ `200`:** `{ "survey": { ...с обновлёнными результатами... }, "responseId": "..." }`

---

### Пользователи

| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `GET` | `/api/users/me/surveys` | Мои опросы | ✅ |
| `GET` | `/api/users/me/stats` | Моя статистика | ✅ |

**`GET /users/me/stats` — Ответ:**
```json
{
  "totalSurveys": 3,
  "totalResponses": 27,
  "avgResponses": 9
}
```

---

## ✨ Функциональность

### Опросы
- 📋 Список с живым поиском, фильтром по категории/статусу
- 📝 Пошаговое прохождение (4 типа вопросов)
- 📊 Bar-chart визуализация результатов
- ➕ Конструктор с динамическими вопросами и вариантами
- 🗑 Удаление с диалогом подтверждения

### Аутентификация
- 📝 Регистрация с серверной и клиентской валидацией
- 🔑 Вход с JWT-токеном (хранится в localStorage)
- 🔒 bcrypt хеширование паролей (cost factor 12)
- 🛡 Защищённые маршруты — только для авторизованных

### UX / Качество
- ⌛ Индикаторы загрузки при каждом async действии
- ✅ / ⚠️ Уведомления об успехе и ошибках
- 📱 Адаптивный дизайн (мобильный, планшет, десктоп, 4K)
- 📡 Offline fallback — работает без бэкенда на seed-данных
- 🕹️ Win98 дизайн-система (рельефные кнопки, titlebar, taskbar)
- 404 страница для несуществующих маршрутов

---

## 🌐 Деплой

### Vercel (фронтенд)
```bash
cd client
npm run build
npx vercel --prod
```

### Render (бэкенд)
1. Создайте Web Service на render.com
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Добавьте env-переменные: `JWT_SECRET`, `NODE_ENV=production`

### Одним сервером (production)
```bash
cd client && npm run build          # собирает в client/build/
cd ../server && NODE_ENV=production npm start  # раздаёт build + API
```

---

## 🧪 Тестирование API (Postman)

### Тестовый аккаунт (задеплоен)

```
Email:    demo@surveyapp.com
Пароль:   demo1234
```

### Пример сценария тестирования

**Шаг 1 — Регистрация:**
```
POST https://surveyapp-ars0.onrender.com/api/auth/register
Content-Type: application/json

{ "username": "testuser", "email": "test@example.com", "password": "pass123" }
```

**Шаг 2 — Получить список опросов:**
```
GET https://surveyapp-ars0.onrender.com/api/surveys
```

**Шаг 3 — Создать опрос (нужен токен из шага 1):**
```
POST https://surveyapp-ars0.onrender.com/api/surveys
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Тест через Postman",
  "category": "Технологии",
  "questions": [
    { "type": "single", "text": "Вопрос 1?", "options": ["Да", "Нет"] },
    { "type": "rating", "text": "Оцените" },
    { "type": "text", "text": "Комментарий" },
    { "type": "single", "text": "Вопрос 4?", "options": ["A", "B"] },
    { "type": "multiple", "text": "Вопрос 5?", "options": ["X", "Y", "Z"] }
  ]
}
```

**Шаг 4 — Удалить свой опрос:**
```
DELETE https://surveyapp-ars0.onrender.com/api/surveys/<id>
Authorization: Bearer <token>
```

---

## 👤 Автор

Курсовой проект по дисциплине **ПМ04**  
Стек: React · Node.js · Express · MongoDB Atlas · JWT · bcrypt
