import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSurveys } from '../context/SurveyContext';
import { Window } from '../components/UI';

// ── Profile page ──
export function ProfilePage() {
  const { user, logout } = useAuth();
  const { surveys } = useSurveys();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Window title="Профиль — SurveyPro 98" icon="👤" statusText="">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <div style={{ marginBottom: 12 }}>Войдите, чтобы просмотреть профиль</div>
          <Link to="/login" className="win-btn win-btn--default">🔑 Войти</Link>
        </div>
      </Window>
    );
  }

  const mine = surveys.filter(s => s.authorId === user.id);
  const totalMyResponses = mine.reduce((s, sv) => s + sv.responses, 0);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <Window title={`Профиль: ${user.username} — SurveyPro 98`} icon="👤" statusText={`ID: ${user.id}`}>
      <div className="win-menubar">
        <Link to="/" className="win-menubar__item" style={{ textDecoration: 'none' }}>Главная</Link>
        <button className="win-menubar__item" onClick={handleLogout}>Выход</button>
      </div>
      <div style={{ padding: 16 }}>
        {/* Avatar & info */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div className="win-panel-sunken" style={{
            width: 64, height: 64, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36, flexShrink: 0,
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{user.username}</div>
            <div style={{ color: '#555', fontSize: 13 }}>{user.email}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              Зарегистрирован: {new Date(user.id > 1000000000000 ? parseInt(user.id) : Date.now()).toLocaleDateString('ru-RU')}
            </div>
          </div>
        </div>

        <div className="win-sep" />

        {/* Stats */}
        <fieldset className="win-fieldset">
          <legend>Статистика</legend>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#555' }}>Создано опросов:</td>
                <td style={{ fontWeight: 'bold' }}>{mine.length}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#555' }}>Всего ответов:</td>
                <td style={{ fontWeight: 'bold' }}>{totalMyResponses.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </fieldset>

        {/* My surveys */}
        {mine.length > 0 && (
          <fieldset className="win-fieldset">
            <legend>Мои опросы</legend>
            {mine.map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '4px 0', borderBottom: '1px solid #ddd', fontSize: 13,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{s.title}</span>
                <Link to={`/survey/${s.id}`} className="win-btn"
                  style={{ minWidth: 0, fontSize: 11, padding: '2px 8px' }}>
                  Открыть
                </Link>
              </div>
            ))}
          </fieldset>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Link to="/create" className="win-btn win-btn--default">➕ Создать опрос</Link>
          <button className="win-btn win-btn--danger" onClick={handleLogout}>
            🚪 Выйти
          </button>
        </div>
      </div>
    </Window>
  );
}

// ── 404 Not Found page ──
export function NotFoundPage() {
  return (
    <Window title="404 — Страница не найдена" icon="❌" statusText="Ошибка 404">
      <div style={{ padding: 30, textAlign: 'center' }}>
        <div style={{ fontSize: 72, fontWeight: 'bold', color: 'var(--win-title-start)', fontFamily: "'VT323', monospace", lineHeight: 1 }}>
          404
        </div>
        <div style={{ fontSize: 18, fontWeight: 'bold', margin: '12px 0 8px' }}>
          Страница не найдена
        </div>
        <div style={{ color: '#555', marginBottom: 20, fontSize: 13 }}>
          Запрошенная страница не существует или была удалена.
        </div>
        <div style={{ marginBottom: 16 }}>
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ctext y='48' font-size='48'%3E🖥️%3C/text%3E%3C/svg%3E" alt="" width={64} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to="/" className="win-btn win-btn--default">🏠 На главную</Link>
          <Link to="/dashboard" className="win-btn">📊 Дашборд</Link>
        </div>
      </div>
    </Window>
  );
}
