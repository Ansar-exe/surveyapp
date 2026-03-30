// routes/users.js — User profile endpoints
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../middleware/db');

const router = express.Router();

// GET /api/users/me/surveys — my surveys
router.get('/me/surveys', requireAuth, (req, res) => {
  try {
    const surveys = db.get('surveys').filter({ authorId: req.user.id }).value();
    const sorted = [...surveys].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ surveys: sorted, total: sorted.length });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

// GET /api/users/me/stats — my statistics
router.get('/me/stats', requireAuth, (req, res) => {
  try {
    const surveys = db.get('surveys').filter({ authorId: req.user.id }).value();
    const totalResponses = surveys.reduce((s, sv) => s + (sv.responses || 0), 0);
    const activeCount = surveys.filter(s => s.status === 'active').length;
    return res.json({
      surveysCreated: surveys.length,
      totalResponses,
      activeCount,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера.' });
  }
});

module.exports = router;
