import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWindow } from '../context/WindowContext';
import { validateRegisterForm } from '../utils/validation';
import { Window, FormField, Alert, Loader } from '../components/UI';

export default function RegisterPage({ onClose, onMinimize }) {
  const { register, loading } = useAuth();
  const { openWindow } = useWindow();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    const errs = validateRegisterForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await register({ username: form.username, email: form.email, password: form.password });
      onClose && onClose();
      openWindow('surveys');
    } catch (err) {
      setServerError(err.message);
    }
  }

  const pwLen = form.password.length;
  const pwStrength = pwLen === 0 ? null : pwLen < 6 ? 'weak' : pwLen < 10 ? 'ok' : 'strong';
  const pwLabels = { weak: '⚠ Слабый', ok: '▲ Средний', strong: '✔ Надёжный' };
  const pwColors = { weak: 'var(--win-error)', ok: '#996600', strong: 'var(--win-success)' };

  return (
    <Window title="Регистрация — SurveyPro 98" icon="📝" statusText="Создайте новый аккаунт" onClose={onClose} onMinimize={onMinimize}>
      <div className="win-menubar">
        <button className="win-menubar__item">Файл</button>
        <button className="win-menubar__item">Справка</button>
      </div>
      <div style={{ padding: 16, maxWidth: 420, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>📝</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>Регистрация в SurveyPro 98</div>
            <div style={{ color: '#555', fontSize: 12 }}>Заполните все поля</div>
          </div>
        </div>

        <div className="win-sep" />

        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="win-fieldset">
            <legend>Личные данные</legend>

            <FormField label="Имя пользователя:" error={errors.username}>
              <input
                className={`win-input${errors.username ? ' win-input--error' : ''}`}
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="username_98"
                autoComplete="username"
                disabled={loading}
                maxLength={30}
              />
            </FormField>

            <FormField label="Email:" error={errors.email}>
              <input
                className={`win-input${errors.email ? ' win-input--error' : ''}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="user@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </FormField>
          </fieldset>

          <fieldset className="win-fieldset">
            <legend>Безопасность</legend>

            <FormField label="Пароль:" error={errors.password}>
              <input
                className={`win-input${errors.password ? ' win-input--error' : ''}`}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
                disabled={loading}
              />
              {pwStrength && (
                <div style={{ fontSize: 12, marginTop: 3, color: pwColors[pwStrength] }}>
                  {pwLabels[pwStrength]}
                </div>
              )}
            </FormField>

            <FormField label="Подтверждение пароля:" error={errors.confirm}>
              <input
                className={`win-input${errors.confirm ? ' win-input--error' : ''}`}
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Повторите пароль"
                autoComplete="new-password"
                disabled={loading}
              />
              {!errors.confirm && form.confirm && form.confirm === form.password && (
                <div className="win-success-text">✔ Пароли совпадают</div>
              )}
            </FormField>
          </fieldset>

          {loading && <Loader text="Создание аккаунта..." />}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              className="win-btn win-btn--default"
              disabled={loading}
            >
              {loading ? '...' : '✔ Зарегистрироваться'}
            </button>
            <button type="button" className="win-btn" onClick={onClose}>Отмена</button>
          </div>
        </form>

        <div className="win-sep" />
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
          Уже есть аккаунт?{' '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--win-title-start)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            onClick={() => openWindow('login')}
          >
            Войти
          </button>
        </div>
      </div>
    </Window>
  );
}
