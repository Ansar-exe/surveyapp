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

```bash
cd server
cp .env.example .env
# Откройте .env и смените JWT_SECRET на свой секретный ключ
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
| **bcryptjs** | Хеширование паролей (cost=12) |
| **jsonwebtoken** | JWT аутентификация |
| **lowdb** | JSON файловая база данных |
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
│   ├── data/
│   │   └── db.json             # База данных (создаётся автоматически)
│   ├── middleware/
│   │   ├── auth.js             # JWT middleware (requireAuth, optionalAuth)
│   │   └── db.js               # Подключение к lowdb
│   ├── routes/
│   │   ├── auth.js             # POST /register, POST /login, GET /me
│   │   ├── surveys.js          # GET/POST/PUT/DELETE /surveys + /respond
│   │   └── users.js            # GET /me/surveys, GET /me/stats
│   ├── .env.example            # Шаблон конфига
│   └── index.js                # Точка входа Express
│
├── .gitignore
├── package.json
└── README.md
```

---

## 📡 API Эндпоинты

### Аутентификация
| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Регистрация | — |
| `POST` | `/api/auth/login` | Вход | — |
| `GET` | `/api/auth/me` | Текущий пользователь | ✅ |

### Опросы (полный CRUD)
| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `GET` | `/api/surveys` | Список (фильтры, пагинация) | opt |
| `GET` | `/api/surveys/:id` | Один опрос | opt |
| `POST` | `/api/surveys` | Создать | ✅ |
| `PUT` | `/api/surveys/:id` | Обновить (автор) | ✅ |
| `DELETE` | `/api/surveys/:id` | Удалить (автор) | ✅ |
| `POST` | `/api/surveys/:id/respond` | Отправить ответы | opt |
| `GET` | `/api/surveys/:id/responses` | Все ответы (автор) | ✅ |

### Пользователи
| Метод | Путь | Описание | Auth |
|---|---|---|---|
| `GET` | `/api/users/me/surveys` | Мои опросы | ✅ |
| `GET` | `/api/users/me/stats` | Моя статистика | ✅ |

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

Импортируйте следующие запросы:

```
POST http://localhost:5000/api/auth/register
Body: { "username": "user1", "email": "u@test.com", "password": "pass123" }

POST http://localhost:5000/api/auth/login  
Body: { "email": "u@test.com", "password": "pass123" }

GET http://localhost:5000/api/surveys
Authorization: Bearer <token>
```

---

## 👤 Автор

Курсовой проект по дисциплине **ПМ04**  
Платформа: React + Node.js + Express + JWT + bcrypt
