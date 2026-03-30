// auth.js — JWT authentication middleware
const jwt = require('jsonwebtoken');

/**
 * Protect routes — requires a valid Bearer token.
 * Attaches req.user = { id, username, email } on success.
 */
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Необходима авторизация.' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, username: payload.username, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Сессия истекла. Войдите заново.' });
    }
    return res.status(401).json({ error: 'Недействительный токен.' });
  }
}

/**
 * Optional auth — attaches req.user if token is valid,
 * but does NOT block the request if token is missing.
 */
function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, username: payload.username, email: payload.email };
    }
  } catch {
    // ignore — user just won't be attached
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
