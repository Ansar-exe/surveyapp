import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWindow } from '../context/WindowContext';
import { validateLoginForm } from '../utils/validation';
import { Window, FormField, Alert, Loader } from '../components/UI';

export default function LoginPage({ onClose, onMinimize }) {
  const { login, loading } = useAuth();
  const { openWindow } = useWindow();

  const [form, setForm] = useState({ email: '', password: '' });
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

    const errs = validateLoginForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await login(form);
      onClose && onClose();
      openWindow('surveys');
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Window title="Вход в систему — SurveyPro 98" icon="🔑" statusText="Введите данные для входа" onClose={onClose} onMinimize={onMinimize}>
      <div className="win-menubar">
        <button className="win-menubar__item">Файл</button>
        <button className="win-menubar__item">Справка</button>
      </div>
      <div style={{ padding: 16, maxWidth: 380, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>🔑</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>Вход в SurveyPro 98</div>
            <div style={{ color: '#555', fontSize: 12 }}>Введите email и пароль</div>
          </div>
        </div>

        <div className="win-sep" />

        {serverError && <Alert type="error">{serverError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="win-fieldset">
            <legend>Данные для входа</legend>

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

            <FormField label="Пароль:" error={errors.password}>
              <input
                className={`win-input${errors.password ? ' win-input--error' : ''}`}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </FormField>
          </fieldset>

          {loading && <Loader text="Проверка данных..." />}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              className="win-btn win-btn--default"
              disabled={loading}
            >
              {loading ? '...' : '✔ Войти'}
            </button>
            <button type="button" className="win-btn" onClick={onClose}>Отмена</button>
          </div>
        </form>

        <div className="win-sep" />
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
          Нет аккаунта?{' '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--win-title-start)', cursor: 'pointer', fontSize: 12, padding: 0 }}
            onClick={() => openWindow('register')}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </Window>
  );
}
