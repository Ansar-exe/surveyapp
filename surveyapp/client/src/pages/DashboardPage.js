import { useState } from 'react';
import { useSurveys } from '../context/SurveyContext';
import { useAuth } from '../context/AuthContext';
import { useWindow } from '../context/WindowContext';
import { Window, Tabs, CategoryBadge, BarRow, EmptyState } from '../components/UI';

export default function DashboardPage({ onClose, onMinimize }) {
  const { surveys, deleteSurvey } = useSurveys();
  const { user } = useAuth();
  const { openWindow } = useWindow();
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const totalResponses = surveys.reduce((s, sv) => s + sv.responses, 0);
  const activeCount = surveys.filter(s => s.status === 'active').length;

  const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const activity = [45, 78, 62, 91, 55, 30, 22];
  const maxAct = Math.max(...activity);

  const tabs = [
    {
      key: 'overview',
      label: '📊 Обзор',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'Опросов', value: surveys.length, icon: '📋' },
              { label: 'Активных', value: activeCount, icon: '✅' },
              { label: 'Всего ответов', value: totalResponses.toLocaleString(), icon: '👥' },
              { label: 'Завершаемость', value: '68%', icon: '📈' },
            ].map(stat => (
              <div key={stat.label} className="win-panel-raised" style={{ textAlign: 'center', padding: 10 }}>
                <div style={{ fontSize: 22 }}>{stat.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: 'var(--win-title-start)' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <fieldset className="win-fieldset">
            <legend>Активность за 7 дней</legend>
            {activity.map((v, i) => (
              <BarRow key={i} label={days[i]} count={v} total={maxAct} />
            ))}
          </fieldset>

          <fieldset className="win-fieldset">
            <legend>Распределение по категориям</legend>
            {(() => {
              const cats = {};
              surveys.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
              return Object.entries(cats).map(([cat, count]) => (
                <BarRow key={cat} label={cat} count={count} total={surveys.length} />
              ));
            })()}
          </fieldset>
        </div>
      ),
    },
    {
      key: 'table',
      label: '📋 Все опросы',
      content: (
        <div>
          {surveys.length === 0 ? (
            <EmptyState icon="📂" text="Опросов пока нет" />
          ) : (
            <table className="win-listview">
              <thead>
                <tr>
                  <th>Название</th>
                  <th style={{ width: 80 }}>Категория</th>
                  <th style={{ width: 65 }}>Ответов</th>
                  <th style={{ width: 60 }}>Статус</th>
                  <th style={{ width: 90 }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 'bold' }}>{s.title}</td>
                    <td><CategoryBadge category={s.category} /></td>
                    <td>{s.responses.toLocaleString()}</td>
                    <td>
                      <span style={{ color: s.status === 'active' ? 'var(--win-success)' : '#888', fontSize: 12 }}>
                        {s.status === 'active' ? '✅' : '🔒'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 3 }}>
                        <button className="win-btn"
                          style={{ minWidth: 0, fontSize: 11, padding: '2px 5px' }}
                          onClick={() => openWindow(`survey-${s.id}`, { surveyId: s.id })}>
                          📋
                        </button>
                        {user && (
                          <button className="win-btn win-btn--danger"
                            style={{ minWidth: 0, fontSize: 11, padding: '2px 5px' }}
                            onClick={() => setConfirmDelete(s.id)}
                          >🗑</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ),
    },
    ...(user ? [{
      key: 'mine',
      label: '👤 Мои опросы',
      content: (() => {
        const mine = surveys.filter(s => s.authorId === user.id);
        return mine.length === 0 ? (
          <EmptyState icon="📝" text={
            <span>Вы ещё не создавали опросов.{' '}
              <button style={{ background: 'none', border: 'none', color: 'var(--win-title-start)', cursor: 'pointer', padding: 0 }}
                onClick={() => openWindow('create')}>Создать →</button>
            </span>
          } />
        ) : (
          <table className="win-listview">
            <thead>
              <tr>
                <th>Название</th>
                <th style={{ width: 65 }}>Ответов</th>
                <th style={{ width: 90 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {mine.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 'bold' }}>{s.title}</td>
                  <td>{s.responses.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <button className="win-btn"
                        style={{ minWidth: 0, fontSize: 11, padding: '2px 6px' }}
                        onClick={() => openWindow(`survey-${s.id}`, { surveyId: s.id })}>
                        Открыть
                      </button>
                      <button className="win-btn win-btn--danger"
                        style={{ minWidth: 0, fontSize: 11, padding: '2px 6px' }}
                        onClick={() => setConfirmDelete(s.id)}
                      >🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      })(),
    }] : []),
  ];

  return (
    <Window
      title="Дашборд — SurveyPro 98"
      icon="📊"
      statusText={`Опросов: ${surveys.length} · Ответов: ${totalResponses.toLocaleString()}`}
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <div className="win-menubar">
        <button className="win-menubar__item" onClick={() => openWindow('surveys')}>Опросы</button>
        {user && (
          <button className="win-menubar__item" onClick={() => openWindow('create')}>Создать</button>
        )}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div className="win-window" style={{ width: 320 }}>
            <div className="win-titlebar">
              <div className="win-titlebar__text">⚠️ Подтверждение</div>
              <div className="win-titlebar__controls">
                <button className="win-tb-btn" onClick={() => setConfirmDelete(null)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>⚠️</span>
                <div>
                  <strong>Удалить опрос?</strong>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>Это действие необратимо.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="win-btn win-btn--default win-btn--danger"
                  onClick={() => { deleteSurvey(confirmDelete); setConfirmDelete(null); }}
                >🗑 Удалить</button>
                <button className="win-btn" onClick={() => setConfirmDelete(null)}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Window>
  );
}
