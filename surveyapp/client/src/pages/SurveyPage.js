import { useState } from 'react';
import { useSurveys } from '../context/SurveyContext';
import { useWindow } from '../context/WindowContext';
import { Window, StarRating, BarRow, Alert, CategoryBadge, Loader } from '../components/UI';

export default function SurveyPage({ surveyId, onClose, onMinimize }) {
  const { getSurvey, submitResponse } = useSurveys();
  const { openWindow } = useWindow();

  const survey = getSurvey(surveyId);
  const [phase, setPhase] = useState('take'); // 'take' | 'submitting' | 'results'
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  if (!survey) {
    return (
      <Window title="Ошибка — SurveyPro 98" icon="⚠️" statusText="Опрос не найден" onClose={onClose} onMinimize={onMinimize}>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>❌</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Опрос не найден</div>
          <div style={{ color: '#555', marginBottom: 16 }}>ID: {surveyId}</div>
          <button className="win-btn win-btn--default" onClick={() => openWindow('surveys')}>← Вернуться к списку</button>
        </div>
      </Window>
    );
  }

  if (phase === 'results') return <ResultsView survey={survey} answers={answers} onClose={onClose} onMinimize={onMinimize} />;

  const q = survey.questions[currentQ];
  const total = survey.questions.length;
  const pct = Math.round((currentQ / total) * 100);

  function handleOption(idx, type) {
    if (type === 'single') {
      setAnswers(prev => ({ ...prev, [currentQ]: idx }));
    } else {
      setAnswers(prev => {
        const cur = prev[currentQ] || [];
        const exists = cur.indexOf(idx);
        return {
          ...prev,
          [currentQ]: exists > -1 ? cur.filter(i => i !== idx) : [...cur, idx],
        };
      });
    }
  }

  async function handleNext() {
    if (currentQ < total - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setPhase('submitting');
      await new Promise(r => setTimeout(r, 700));
      submitResponse(survey.id, answers);
      setPhase('results');
    }
  }

  return (
    <Window
      title={`${survey.title} — SurveyPro 98`}
      icon="📝"
      statusText={`Вопрос ${currentQ + 1} из ${total} · ${survey.responses} участников`}
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <div className="win-menubar">
        <button className="win-menubar__item" onClick={() => openWindow('surveys')}>← Назад</button>
      </div>
      <div style={{ padding: '12px 16px' }}>
        {phase === 'submitting' ? (
          <Loader text="Отправка ответов..." />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{survey.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <CategoryBadge category={survey.category} />
                  <span style={{ fontSize: 11, color: '#555' }}>👥 {survey.responses.toLocaleString()} ответов</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 3 }}>
                Прогресс: {currentQ}/{total}
              </div>
              <div className="win-progress">
                <div className="win-progress__fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            <fieldset className="win-fieldset">
              <legend>Вопрос {currentQ + 1} из {total}</legend>
              <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 12 }}>{q.text}</div>

              {q.type === 'single' && (
                <div>
                  {q.options.map((opt, i) => (
                    <label key={i} className="win-radio-item">
                      <input
                        type="radio"
                        name={`q${currentQ}`}
                        checked={answers[currentQ] === i}
                        onChange={() => handleOption(i, 'single')}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'multiple' && (
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>Можно выбрать несколько</div>
                  {q.options.map((opt, i) => {
                    const sel = (answers[currentQ] || []).includes(i);
                    return (
                      <label key={i} className="win-check-item">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => handleOption(i, 'multiple')}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              )}

              {q.type === 'rating' && (
                <div>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Нажмите на звезду</div>
                  <StarRating
                    value={answers[currentQ] || 0}
                    onChange={val => setAnswers(prev => ({ ...prev, [currentQ]: val }))}
                  />
                </div>
              )}

              {q.type === 'text' && (
                <textarea
                  className="win-textarea"
                  rows={4}
                  placeholder="Введите ваш ответ..."
                  value={answers[currentQ] || ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [currentQ]: e.target.value }))}
                />
              )}
            </fieldset>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button
                className="win-btn"
                onClick={() => setCurrentQ(c => c - 1)}
                disabled={currentQ === 0}
              >
                ◀ Назад
              </button>
              <button
                className="win-btn win-btn--default"
                onClick={handleNext}
              >
                {currentQ === total - 1 ? '✔ Завершить' : 'Далее ▶'}
              </button>
            </div>
          </>
        )}
      </div>
    </Window>
  );
}

function ResultsView({ survey, answers, onClose, onMinimize }) {
  const { openWindow } = useWindow();

  function getAvg(counts) {
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return '—';
    return (counts.reduce((s, c, i) => s + c * (i + 1), 0) / total).toFixed(1);
  }

  return (
    <Window
      title={`Результаты: ${survey.title}`}
      icon="📊"
      statusText={`${survey.responses.toLocaleString()} участников`}
      onClose={onClose}
      onMinimize={onMinimize}
    >
      <div className="win-menubar">
        <button className="win-menubar__item" onClick={() => openWindow('surveys')}>← Назад к списку</button>
      </div>
      <div style={{ padding: '12px 16px', maxHeight: 520, overflowY: 'auto' }}>
        <Alert type="success">Ваши ответы успешно отправлены! Спасибо за участие.</Alert>

        <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>{survey.title}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <CategoryBadge category={survey.category} />
          <span style={{ fontSize: 12, color: '#555' }}>👥 {survey.responses.toLocaleString()} ответов</span>
        </div>

        {survey.questions.map((q, qi) => {
          const res = survey.results[qi];
          return (
            <div key={qi} style={{ marginBottom: 20 }}>
              <div className="win-sep" />
              <div style={{ fontWeight: 'bold', color: 'var(--win-title-start)', marginBottom: 8 }}>
                {qi + 1}. {q.text}
              </div>

              {(q.type === 'single' || q.type === 'multiple') && res && (
                <div>
                  {(() => {
                    const total = Object.values(res).reduce((a, b) => a + b, 0);
                    return Object.entries(res).map(([label, count]) => (
                      <BarRow key={label} label={label} count={count} total={total} />
                    ));
                  })()}
                </div>
              )}

              {q.type === 'rating' && res && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>
                    Средняя оценка: {getAvg(res)} / 5
                  </div>
                  {['1★','2★','3★','4★','5★'].map((lbl, i) => (
                    <BarRow key={i} label={lbl} count={res[i] || 0} total={res.reduce((a,b)=>a+b,0)} />
                  ))}
                </div>
              )}

              {q.type === 'text' && (
                <div>
                  {Array.isArray(res) && res.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {res.map((txt, i) => (
                        <div key={i} className="win-panel-sunken" style={{ fontSize: 12, color: '#333', padding: '6px 10px' }}>
                          💬 {txt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#888' }}>Пока нет текстовых ответов</div>
                  )}
                  {answers[qi] && (
                    <div style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                      ✏️ Ваш ответ: <em>{answers[qi]}</em>
                    </div>
                  )}
                </div>
              )}

              {!res && (
                <div style={{ fontSize: 12, color: '#888' }}>Нет данных</div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="win-btn win-btn--default" onClick={() => openWindow('surveys')}>
            ← К списку опросов
          </button>
          <button className="win-btn" onClick={() => openWindow('dashboard')}>
            📊 Дашборд
          </button>
        </div>
      </div>
    </Window>
  );
}
