// routes/auth.js — Registration & Login
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  return user.toJSON();
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Имя пользователя: от 3 до 30 символов.')
      .matches(/^[a-zA-Zа-яА-Я0-9_]+$/).withMessage('Только буквы, цифры и подчёркивание.'),
    body('email').trim().isEmail().withMessage('Введите корректный email.'),
    body('password').isLength({ min: 6 }).withMessage('Пароль — минимум 6 символов.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        fields: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
      });
    }

    try {
      const { username, email, password } = req.body;

      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(409).json({ error: 'Пользователь с таким email уже существует.', fields: { email: 'Email занят.' } });
      }
      const existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (existingUsername) {
        return res.status(409).json({ error: 'Это имя пользователя уже занято.', fields: { username: 'Имя занято.' } });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ username: username.trim(), email: email.trim().toLowerCase(), passwordHash });

      const token = signToken(user);
      return res.status(201).json({ token, user: safeUser(user) });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Введите корректный email.'),
    body('password').notEmpty().withMessage('Пароль обязателен.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
        fields: errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {}),
      });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res.status(401).json({ error: 'Пользователь с таким email не найден.', fields: { email: 'Не найден.' } });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ error: 'Неверный пароль.', fields: { password: 'Неверный пароль.' } });
      }

      const token = signToken(user);
      return res.json({ token, user: safeUser(user) });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Ошибка сервера. Попробуйте позже.' });
    }
  }
);

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Нет токена.' });
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден.' });

    return res.json({ user: safeUser(user) });
  } catch {
    return res.status(401).json({ error: 'Недействительный токен.' });
  }
});

module.exports = router;
