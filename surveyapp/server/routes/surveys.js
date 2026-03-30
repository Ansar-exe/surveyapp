// routes/surveys.js — Full CRUD for surveys
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const db = require('../middleware/db');

const router = express.Router();

function validationError(res, errors) {
  return res.status(400).json({
    error: errors.array()[0].msg,
    fields: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
  });
}

// ─────────────────────────────────────────
//  GET /api/surveys — list all surveys
// ─────────────────────────────────────────
router.get('/', optionalAuth, (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;

    let surveys = db.get('surveys').value();

    // Filters
    if (category && category !== 'Все') {
      surveys = surveys.filter(s => s.category === category);
    }
    if (status && status !== 'all') {
      surveys = surveys.filter(s => s.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      surveys = surveys.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.desc || '').toLowerCase().includes(q)
      );
    }

    // Sort newest first
    surveys = [...surveys].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const total = surveys.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = surveys.slice(start, start + Number(limit));

    return res.json({
      surveys: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// ─────────────────────────────────────────
//  GET /api/surveys/:id — single survey
// ─────────────────────────────────────────
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const survey = db.get('surveys').find({ id: req.params.id }).value();
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    return res.json({ survey });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// ─────────────────────────────────────────
//  POST /api/surveys — create survey (auth required)
// ─────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  [
    body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Название: от 5 до 120 символов.'),
    body('category').notEmpty().withMessage('Категория обязательна.'),
    body('questions').isArray({ min: 1 }).withMessage('Добавьте хотя бы один вопрос.'),
    body('questions.*.text').notEmpty().withMessage('Текст вопроса обязателен.'),
    body('questions.*.type')
      .isIn(['single', 'multiple', 'rating', 'text'])
      .withMessage('Недопустимый тип вопроса.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const { title, desc, category, questions } = req.body;

      const survey = {
        id: Date.now().toString(),
        title: title.trim(),
        desc: (desc || '').trim(),
        category,
        status: 'active',
        authorId: req.user.id,
        authorName: req.user.username,
        createdAt: new Date().toISOString(),
        responses: 0,
        questions: questions.map(q => ({
          type: q.type,
          text: q.text.trim(),
          options: (q.options || []).filter(Boolean).map(o => o.trim()),
        })),
        results: {},
      };

      db.get('surveys').push(survey).write();
      return res.status(201).json({ survey });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// ─────────────────────────────────────────
//  PUT /api/surveys/:id — update survey (owner only)
// ─────────────────────────────────────────
router.put(
  '/:id',
  requireAuth,
  [
    body('title').optional().trim().isLength({ min: 5, max: 120 }).withMessage('Название: от 5 до 120 символов.'),
    body('status').optional().isIn(['active', 'closed']).withMessage('Недопустимый статус.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const survey = db.get('surveys').find({ id: req.params.id }).value();
      if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
      if (survey.authorId !== req.user.id) {
        return res.status(403).json({ error: 'Нет прав для редактирования этого опроса.' });
      }

      const allowed = ['title', 'desc', 'category', 'status', 'questions'];
      const updates = {};
      allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
      updates.updatedAt = new Date().toISOString();

      db.get('surveys').find({ id: req.params.id }).assign(updates).write();
      const updated = db.get('surveys').find({ id: req.params.id }).value();
      return res.json({ survey: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// ─────────────────────────────────────────
//  DELETE /api/surveys/:id — delete survey (owner only)
// ─────────────────────────────────────────
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const survey = db.get('surveys').find({ id: req.params.id }).value();
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    if (survey.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав для удаления этого опроса.' });
    }

    db.get('surveys').remove({ id: req.params.id }).write();
    // Also remove all responses for this survey
    db.get('responses').remove({ surveyId: req.params.id }).write();

    return res.json({ message: 'Опрос удалён.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// ─────────────────────────────────────────
//  POST /api/surveys/:id/respond — submit answers
// ─────────────────────────────────────────
router.post(
  '/:id/respond',
  optionalAuth,
  [
    body('answers').isObject().withMessage('Ответы должны быть объектом.'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return validationError(res, errors);

    try {
      const survey = db.get('surveys').find({ id: req.params.id }).value();
      if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
      if (survey.status !== 'active') {
        return res.status(400).json({ error: 'Этот опрос уже закрыт.' });
      }

      const { answers } = req.body;

      // Save individual response record
      const responseRecord = {
        id: Date.now().toString(),
        surveyId: survey.id,
        userId: req.user ? req.user.id : null,
        answers,
        submittedAt: new Date().toISOString(),
      };
      db.get('responses').push(responseRecord).write();

      // Aggregate into survey results
      const results = { ...survey.results };
      survey.questions.forEach((q, qi) => {
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
        }
        // text answers are stored in responseRecord only
      });

      db.get('surveys')
        .find({ id: survey.id })
        .assign({ results, responses: (survey.responses || 0) + 1 })
        .write();

      const updated = db.get('surveys').find({ id: survey.id }).value();
      return res.json({ survey: updated, responseId: responseRecord.id });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка сервера.' });
    }
  }
);

// ─────────────────────────────────────────
//  GET /api/surveys/:id/responses — get all responses (owner only)
// ─────────────────────────────────────────
router.get('/:id/responses', requireAuth, (req, res) => {
  try {
    const survey = db.get('surveys').find({ id: req.params.id }).value();
    if (!survey) return res.status(404).json({ error: 'Опрос не найден.' });
    if (survey.authorId !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав.' });
    }

    const responses = db.get('responses').filter({ surveyId: req.params.id }).value();
    return res.json({ responses, total: responses.length });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

module.exports = router;
