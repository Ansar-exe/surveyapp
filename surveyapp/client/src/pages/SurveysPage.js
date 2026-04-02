import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSurveys } from '../context/SurveyContext';
import { useAuth } from '../context/AuthContext';
import { Window, CategoryBadge, Alert, EmptyState, Loader } from '../components/UI';

const CATEGORIES = ['Все', 'Бизнес', 'Технологии', 'Образование', 'Здоровье', 'Развлечения', 'Другое'];

export default function SurveysPage() {
  const { surveys, fetchSurveys, deleteSurvey, loading, backendUp } = useSurveys();
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const location = useLocation();

  const [categoryFilter, setCategoryFilter] = useState('Все');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [search, setSearch]                 = useState('');

  // Try to load from backend on mount
  useEffect(() => { fetchSurveys(); }, []); // eslint-disable-line

  const filtered = surveys.filter(s => {
    const matchCat    = categoryFilter === 'Все' || s.category === categoryFilter;
    const matchStatus = statusFilter === 'all'   || s.status === statusFilter;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <Window
      title="Публичные опросы — SurveyPro 98"
      icon="📋"
      statusText={`Найдено: ${filtered.length} из ${surveys.length}${backendUp ? ' · 🟢 сервер' : ' · 📁 локально'}`}
    >
      <div className="win-menubar">
        <button className="win-menubar__item">Файл</button>
        <button className="win-menubar__item">Вид</button>
        {user && <Link to="/create" className="win-menubar__item" style={{ textDecoration: 'none' }}>Создать</Link>}
      </div>

      <div className="win-toolbar">
        {user
          ? <Link to="/create" className="win-btn">📋 Создать опрос</Link>
          : <Link to="/login" className="win-btn">🔑 Войти для создания</Link>}
        <button className="win-btn" onClick={() => { setSearch(''); setCategoryFilter('Все'); setStatusFilter('all'); fetchSurveys(); }}>
          🔄 Обновить
        </button>
      </div>

      <div style={{ padding: '8px 12px' }}>
        {location.state?.message && <Alert type="success">{location.state.message}</Alert>}

        <fieldset className="win-fieldset" style={{ marginBottom: 10 }}>
          <legend>Фильтры</legend>
          <div className="win-filters-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontWeight: 'bold' }}>Поиск:</label>
              <input className="win-input" style={{ width: 180 }} type="text"
                value={search} onChange={e => setSearch(e.target.value)} placeholder="Название..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontWeight: 'bold' }}>Категория:</label>
              <select className="win-select" style={{ width: 130 }}
                value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontWeight: 'bold' }}>Статус:</label>
              <select className="win-select" style={{ width: 110 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Все</option>
                <option value="active">Активные</option>
                <option value="closed">Закрытые</option>
              </select>
            </div>
          </div>
        </fieldset>

        {loading ? <Loader text="Загрузка опросов..." /> : filtered.length === 0
          ? <EmptyState icon="🔍" text="Опросы не найдены." />
          : (
            <table className="win-listview" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 24 }}></th>
                  <th>Название</th>
                  <th className="col-category" style={{ width: 90 }}>Категория</th>
                  <th style={{ width: 70 }}>Ответов</th>
                  <th className="col-status" style={{ width: 65 }}>Статус</th>
                  <th style={{ width: 110 }}>Действие</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ textAlign: 'center' }}>{s.status === 'active' ? '📋' : '📁'}</td>
                    <td style={{ maxWidth: 320 }}>
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{s.desc?.slice(0, 55)}{s.desc?.length > 55 ? '…' : ''}</div>
                    </td>
                    <td className="col-category"><CategoryBadge category={s.category} /></td>
                    <td>{(s.responses || 0).toLocaleString()}</td>
                    <td className="col-status">
                      <span style={{ fontSize: 11, fontWeight: 'bold', color: s.status === 'active' ? 'var(--win-success)' : 'var(--win-disabled)' }}>
                        {s.status === 'active' ? '✅ Активен' : '🔒 Закрыт'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      <Link to={`/survey/${s.id}`} className="win-btn" style={{ minWidth: 0, fontSize: 12, padding: '2px 8px' }}>
                        Открыть
                      </Link>
                      {user && s.authorId === user.id && (
                        confirmDelete === s.id ? (
                          <>
                            <button className="win-btn" style={{ fontSize: 11, padding: '2px 6px', color: 'var(--win-error)' }}
                              onClick={async () => { await deleteSurvey(s.id); setConfirmDelete(null); }}>
                              ✓
                            </button>
                            <button className="win-btn" style={{ fontSize: 11, padding: '2px 6px' }}
                              onClick={() => setConfirmDelete(null)}>
                              ✗
                            </button>
                          </>
                        ) : (
                          <button className="win-btn" style={{ minWidth: 0, fontSize: 12, padding: '2px 8px' }}
                            onClick={() => setConfirmDelete(s.id)}>
                            🗑
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
    </Window>
  );
}
