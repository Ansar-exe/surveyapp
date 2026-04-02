const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedIfEmpty() {
  const count = await prisma.survey.count();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@surveyapp.com' },
    update: {},
    create: { username: 'demo', email: 'demo@surveyapp.com', passwordHash },
  });

  await prisma.survey.createMany({
    data: [
      {
        title: 'Любимый язык программирования',
        desc: 'Какой язык программирования вы используете чаще всего?',
        category: 'Технологии',
        status: 'active',
        authorId: user.id,
        authorName: user.username,
        questions: [
          { type: 'single', text: 'Какой язык программирования вы предпочитаете?', options: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'] },
          { type: 'rating', text: 'Насколько вам нравится программировать?', options: [] },
          { type: 'text', text: 'Почему именно этот язык?', options: [] },
          { type: 'multiple', text: 'Какие инструменты вы используете?', options: ['VS Code', 'Git', 'Docker', 'Linux'] },
          { type: 'single', text: 'Сколько лет вы программируете?', options: ['< 1 года', '1–3 года', '3–5 лет', '5+ лет'] },
        ],
        results: { 0: { JavaScript: 5, Python: 3, TypeScript: 2 }, 1: [1, 2, 3, 8, 12] },
        responses: 8,
      },
      {
        title: 'Оценка качества обучения',
        desc: 'Помогите нам улучшить учебный процесс',
        category: 'Образование',
        status: 'active',
        authorId: user.id,
        authorName: user.username,
        questions: [
          { type: 'rating', text: 'Оцените качество преподавания', options: [] },
          { type: 'single', text: 'Какой формат обучения вам больше нравится?', options: ['Очный', 'Онлайн', 'Гибридный'] },
          { type: 'multiple', text: 'Какие предметы вам даются сложнее всего?', options: ['Математика', 'Программирование', 'Английский', 'Физика'] },
          { type: 'text', text: 'Ваши пожелания по улучшению курса', options: [] },
          { type: 'single', text: 'Рекомендуете ли вы этот курс?', options: ['Да', 'Нет', 'Не знаю'] },
        ],
        results: { 0: [0, 1, 3, 10, 6], 1: { Очный: 4, Онлайн: 7, Гибридный: 9 } },
        responses: 20,
      },
      {
        title: 'Предпочтения в музыке',
        desc: 'Расскажите о своих музыкальных вкусах',
        category: 'Развлечения',
        status: 'active',
        authorId: user.id,
        authorName: user.username,
        questions: [
          { type: 'multiple', text: 'Какие жанры музыки вы слушаете?', options: ['Поп', 'Рок', 'Хип-хоп', 'Электронная', 'Классика', 'Джаз'] },
          { type: 'single', text: 'Где вы чаще всего слушаете музыку?', options: ['Дома', 'В транспорте', 'На прогулке', 'На работе/учёбе'] },
          { type: 'rating', text: 'Насколько музыка важна для вас?', options: [] },
          { type: 'text', text: 'Любимый исполнитель?', options: [] },
          { type: 'single', text: 'Платите ли вы за стриминг?', options: ['Да', 'Нет', 'Использую бесплатный план'] },
        ],
        results: { 0: { Поп: 8, Рок: 5, 'Хип-хоп': 10, Электронная: 6 }, 1: { Дома: 6, 'В транспорте': 9 }, 2: [0, 1, 2, 5, 14] },
        responses: 22,
      },
    ],
  });

  console.log('База заполнена тестовыми данными (demo@surveyapp.com / demo1234)');
}

async function connectDB() {
  await prisma.$connect();
  console.log('PostgreSQL (Neon) подключена');
  await seedIfEmpty();
}

module.exports = { connectDB, prisma };
