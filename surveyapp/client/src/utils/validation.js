// ── Form validation utilities ──

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.trim()) return 'Email обязателен.';
  if (!re.test(email.trim())) return 'Введите корректный email.';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Пароль обязателен.';
  if (password.length < 6) return 'Пароль должен содержать минимум 6 символов.';
  return null;
}

export function validateUsername(username) {
  if (!username || !username.trim()) return 'Имя пользователя обязательно.';
  if (username.trim().length < 3) return 'Минимум 3 символа.';
  if (username.trim().length > 30) return 'Максимум 30 символов.';
  if (!/^[a-zA-Zа-яА-Я0-9_]+$/.test(username.trim())) {
    return 'Только буквы, цифры и подчёркивание.';
  }
  return null;
}

export function validateRequired(value, label = 'Поле') {
  if (!value || !String(value).trim()) return `${label} обязательно.`;
  return null;
}

export function validateMinLength(value, min, label = 'Поле') {
  if (!value || value.trim().length < min) return `${label}: минимум ${min} символов.`;
  return null;
}

/**
 * Validate a full registration form.
 * Returns an object with field-level errors.
 */
export function validateRegisterForm({ username, email, password, confirm }) {
  const errors = {};
  const usernameErr = validateUsername(username);
  if (usernameErr) errors.username = usernameErr;

  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = validatePassword(password);
  if (passwordErr) errors.password = passwordErr;

  if (!confirm) {
    errors.confirm = 'Подтвердите пароль.';
  } else if (confirm !== password) {
    errors.confirm = 'Пароли не совпадают.';
  }

  return errors;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  if (!password) errors.password = 'Пароль обязателен.';
  return errors;
}

export function validateSurveyForm({ title, questions }) {
  const errors = {};
  if (!title || !title.trim()) errors.title = 'Введите название опроса.';
  else if (title.trim().length < 5) errors.title = 'Минимум 5 символов.';

  if (!questions || questions.length < 5) {
    errors.questions = `Добавьте минимум 5 вопросов (сейчас: ${(questions || []).length}).`;
  }
  return errors;
}
