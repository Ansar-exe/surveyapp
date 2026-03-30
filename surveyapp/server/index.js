// index.js — SurveyPro 98 API Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/auth');
const surveyRoutes  = require('./routes/surveys');
const userRoutes    = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false                       // same-origin in prod
    : 'http://localhost:3000',    // React dev server
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Log requests in dev ──
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.path}`);
    next();
  });
}

// ── API Routes ──
app.use('/api/auth',    authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/users',   userRoutes);

// ── Health check ──
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), version: '1.0.0' });
});

// ── Serve React build in production ──
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ── 404 handler for unknown API routes ──
app.use('/api/{*path}', (_req, res) => {
  res.status(404).json({ error: 'Эндпоинт не найден.' });
});

// ── Global error handler ──
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════╗
  ║   SurveyPro 98 — API Server      ║
  ║   http://localhost:${PORT}          ║
  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(12)}  ║
  ╚══════════════════════════════════╝
  `);
});

module.exports = app;
