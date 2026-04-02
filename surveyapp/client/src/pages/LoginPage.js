import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validation';
import { Window, FormField, Alert, Loader } from '../components/UI';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear field error on change
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    // Client-side validation
    const errs = validateLoginForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  }

  return (
    <Window draggable title="Вход в систему — SurveyPro 98" icon="🔑" statusText="Введите данные для входа">
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

        {location.state?.message && (
          <Alert type="info">{location.state.message}</Alert>
        )}

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
            <Link to="/" className="win-btn">Отмена</Link>
          </div>
        </form>

        <div className="win-sep" />
        <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--win-title-start)' }}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </Window>
  );
}
