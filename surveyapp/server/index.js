// index.js — SurveyPro 98 API Server
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./middleware/db');

const authRoutes    = require('./routes/auth');
const surveyRoutes  = require('./routes/surveys');
const userRoutes    = require('./routes/users');

connectDB().catch(err => { console.error('Ошибка подключения к MongoDB:', err); process.exit(1); });

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, cb) => {
        const allowed = process.env.CLIENT_URL || '';
        if (!origin || origin === allowed || origin.endsWith('.vercel.app')) {
          cb(null, true);
        } else {
          cb(new Error('CORS: origin not allowed'));
        }
      }
    : 'http://localhost:3000',
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
