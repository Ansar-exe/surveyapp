// routes/users.js — User profile endpoints
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../middleware/db');

const router = express.Router();

// GET /api/users/me/surveys — my surveys
router.get('/me/surveys', requireAuth, async (req, res) => {
  try {
    const surveys = await prisma.survey.findMany({
      where: { authorId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ surveys, total: surveys.length });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// GET /api/users/me/stats — my statistics
router.get('/me/stats', requireAuth, async (req, res) => {
  try {
    const surveys = await prisma.survey.findMany({ where: { authorId: req.user.id } });
    const totalResponses = surveys.reduce((s, sv) => s + (sv.responses || 0), 0);
    const activeCount = surveys.filter(s => s.status === 'active').length;
    return res.json({ surveysCreated: surveys.length, totalResponses, activeCount });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

module.exports = router;
