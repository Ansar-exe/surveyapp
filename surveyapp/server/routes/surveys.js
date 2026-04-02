// routes/surveys.js — Full CRUD for surveys
const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { prisma } = require('../middleware/db');

const router = express.Router();

function validationError(res, errors) {
  return res.status(400).json({
    error: errors.array()[0].msg,
    fields: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
  });
}

// GET /api/surveys — list all surveys
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (category && category !== 'Все') where.category = category;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { desc:  { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.survey.count({ where });
    const surveys = await prisma.survey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return res.json({ surveys, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// GET /api/surveys/:id — single survey
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    return res.json({ survey });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// POST /api/surveys — create survey
router.post(
  '/',
  requireAuth,
  [
    body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Название: от 5 до 120 символов.'),
    body('category').notEmpty().withMessage('Категория обязательна.'),
    body('questions').isArray({ min: 5 }).withMessage('Добавьте минимум 5 вопросов.'),
    body('questions.*.text').notEmpty().withMessage('Текст вопроса обязателен.'),
    body('questions.*.type').isIn(['single', 'multiple', 'rating', 'text']).withMessage('Недопустимый тип вопроса.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const { title, desc, category, questions } = req.body;

      const survey = await prisma.survey.create({
        data: {
          title: title.trim(),
          desc: (desc || '').trim(),
          category,
          authorId: req.user.id,
          authorName: req.user.username,
          questions: questions.map(q => ({
            type: q.type,
            text: q.text.trim(),
            options: (q.options || []).filter(Boolean).map(o => o.trim()),
          })),
        },
      });

      return res.status(201).json({ survey });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// PUT /api/surveys/:id — update survey (owner only)
router.put(
  '/:id',
  requireAuth,
  [
    body('title').optional().trim().isLength({ min: 5, max: 120 }).withMessage('Название: от 5 до 120 символов.'),
    body('status').optional().isIn(['active', 'closed']).withMessage('Недопустимый статус.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
      if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
      if (survey.authorId !== req.user.id) {
        return res.status(403).json({ error: 'Нет прав для редактирования этого опроса.' });
      }

      const allowed = ['title', 'desc', 'category', 'status', 'questions'];
      const data = {};
      allowed.forEach(key => { if (req.body[key] !== undefined) data[key] = req.body[key]; });

      const updated = await prisma.survey.update({ where: { id: req.params.id }, data });
      return res.json({ survey: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// DELETE /api/surveys/:id — delete survey (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    if (survey.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого опроса.' });
    }

    await prisma.survey.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Опрос удалён.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// POST /api/surveys/:id/respond — submit answers
router.post(
  '/:id/respond',
  optionalAuth,
  [body('answers').isObject().withMessage('Ответы должны быть объектом.')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
      if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
      if (survey.status !== 'active') {
        return res.status(400).json({ error: 'Этот опрос уже закрыт.' });
      }

      const { answers } = req.body;

      const responseRecord = await prisma.response.create({
        data: {
          surveyId: survey.id,
          userId: req.user ? req.user.id : null,
          answers,
        },
      });

      // Aggregate results
      const questions = survey.questions;
      const results = { ...(survey.results || {}) };

      questions.forEach((q, qi) => {
        const ans = answers[qi];
        if (ans === undefined || ans === null || ans === '') return;

        if (q.type === 'single') {
          const label = q.options[ans];
          if (!label) return;
          results[qi] = { ...(results[qi] || {}), [label]: ((results[qi] || {})[label] || 0) + 1 };
        } else if (q.type === 'multiple') {
          const cur = results[qi] || {};
          (Array.isArray(ans) ? ans : []).forEach(i => {
            const label = q.options[i];
            if (label) cur[label] = (cur[label] || 0) + 1;
          });
          results[qi] = cur;
        } else if (q.type === 'rating') {
          const cur = results[qi] || [0, 0, 0, 0, 0];
          const idx = Number(ans) - 1;
          if (idx >= 0 && idx < 5) cur[idx] = (cur[idx] || 0) + 1;
          results[qi] = [...cur];
        } else if (q.type === 'text' && typeof ans === 'string' && ans.trim()) {
          const cur = results[qi] || [];
          results[qi] = [...cur, ans.trim()];
        }
      });

      const updated = await prisma.survey.update({
        where: { id: survey.id },
        data: { results, responses: survey.responses + 1 },
      });

      return res.json({ survey: updated, responseId: responseRecord.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// GET /api/surveys/:id/responses — get all responses (owner only)
router.get('/:id/responses', requireAuth, async (req, res) => {
  try {
    const survey = await prisma.survey.findUnique({ where: { id: req.params.id } });
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    if (survey.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав.' });
    }

    const responses = await prisma.response.findMany({ where: { surveyId: req.params.id } });
    return res.json({ responses, total: responses.length });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

module.exports = router;
