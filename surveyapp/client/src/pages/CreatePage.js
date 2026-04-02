import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSurveys } from '../context/SurveyContext';
import { useAuth } from '../context/AuthContext';
import { validateSurveyForm } from '../utils/validation';
import { Window, Alert, FormField } from '../components/UI';

const CATEGORIES = ['Бизнес', 'Технологии', 'Образование', 'Здоровье', 'Развлечения', 'Другое'];
const Q_TYPES = [
  { value: 'single', label: 'Один ответ' },
  { value: 'multiple', label: 'Несколько ответов' },
  { value: 'rating', label: 'Рейтинг ★' },
  { value: 'text', label: 'Свободный текст' },
];

function emptyQuestion(type = 'single') {
  return { type, text: '', options: type === 'single' || type === 'multiple' ? ['', ''] : [] };
}

export default function CreatePage() {
  const { createSurvey } = useSurveys();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Бизнес');
  const [questions, setQuestions] = useState([emptyQuestion('single')]);
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <Window draggable title="Доступ запрещён — SurveyPro 98" icon="🔒" statusText="Необходима авторизация">
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Необходима авторизация</div>
          <div style={{ color: '#555', marginBottom: 16 }}>Войдите, чтобы создавать опросы</div>
          <Link to="/login" state={{ from: { pathname: '/create' } }} className="win-btn win-btn--default">
            🔑 Войти
          </Link>
        </div>
      </Window>
    );
  }

  // ── Question helpers ──
  function addQuestion(type) {
    setQuestions(prev => [...prev, emptyQuestion(type)]);
  }

  function removeQuestion(qi) {
    setQuestions(prev => prev.filter((_, i) => i !== qi));
  }

  function updateQuestion(qi, field, value) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  }

  function addOption(qi) {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q));
  }

  function removeOption(qi, oi) {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: q.options.filter((_, j) => j !== oi) }
      : q
    ));
  }

  function updateOption(qi, oi, val) {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) }
      : q
    ));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validateSurveyForm({ title, questions });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const survey = createSurvey({
      title: title.trim(),
      desc: desc.trim() || 'Без описания',
      category,
      questions: questions.map(q => ({
        ...q,
        options: q.options.filter(Boolean),
        text: q.text.trim() || 'Без текста',
      })),
    }, user);

    navigate(`/survey/${survey.id}`, { state: { message: 'Опрос успешно создан!' } });
  }

  return (
    <Window draggable title="Создать опрос — SurveyPro 98" icon="➕" statusText={`Вопросов добавлено: ${questions.length}`}>
      <div className="win-menubar">
        <Link to="/" className="win-menubar__item" style={{ textDecoration: 'none' }}>Отмена</Link>
      </div>
      <div style={{ padding: '12px 16px', maxHeight: 580, overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* Basic info */}
          <fieldset className="win-fieldset">
            <legend>Основная информация</legend>

            <FormField label="Название опроса: *" error={errors.title}>
              <input
                className={`win-input${errors.title ? ' win-input--error' : ''}`}
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: null })); }}
                placeholder="Например: Удовлетворённость продуктом 2025"
                maxLength={120}
              />
            </FormField>

            <FormField label="Описание (необязательно):">
              <textarea
                className="win-textarea"
                rows={2}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Краткое описание..."
                maxLength={300}
              />
            </FormField>

            <FormField label="Категория:">
              <select
                className="win-select"
                style={{ width: 180 }}
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FormField>
          </fieldset>

          {/* Questions */}
          <fieldset className="win-fieldset">
            <legend>Вопросы</legend>

            {errors.questions && <Alert type="error">{errors.questions}</Alert>}

            {questions.map((q, qi) => (
              <QuestionItem
                key={qi}
                qi={qi}
                q={q}
                total={questions.length}
                onUpdateQuestion={updateQuestion}
                onRemove={removeQuestion}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onUpdateOption={updateOption}
              />
            ))}

            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
              {Q_TYPES.map(t => (
                <button key={t.value} type="button" className="win-btn" onClick={() => addQuestion(t.value)}
                  style={{ fontSize: 12, minWidth: 0 }}>
                  + {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="submit" className="win-btn win-btn--default">✔ Опубликовать</button>
            <Link to="/" className="win-btn">✕ Отмена</Link>
          </div>
        </form>
      </div>
    </Window>
  );
}

// ── Question item component ──
function QuestionItem({ qi, q, total, onUpdateQuestion, onRemove, onAddOption, onRemoveOption, onUpdateOption }) {
  const typeLabel = Q_TYPES.find(t => t.value === q.type)?.label || q.type;

  return (
    <div style={{
      border: '2px solid', borderColor: 'var(--win-dark) var(--win-light) var(--win-light) var(--win-dark)',
      padding: 8, marginBottom: 8, background: '#fff', position: 'relative',
    }}>
      {/* Question header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--win-title-start)', fontWeight: 'bold' }}>
          Вопрос {qi + 1} [{typeLabel}]
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <select
            className="win-select"
            style={{ width: 130, fontSize: 11 }}
            value={q.type}
            onChange={e => onUpdateQuestion(qi, 'type', e.target.value)}
          >
            {Q_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {total > 1 && (
            <button type="button" className="win-btn win-btn--danger"
              style={{ minWidth: 0, padding: '2px 8px', fontSize: 13 }}
              onClick={() => onRemove(qi)}
            >🗑</button>
          )}
        </div>
      </div>

      {/* Question text */}
      <input
        className="win-input"
        type="text"
        value={q.text}
        onChange={e => onUpdateQuestion(qi, 'text', e.target.value)}
        placeholder="Текст вопроса..."
        style={{ marginBottom: 6 }}
        maxLength={200}
      />

      {/* Options */}
      {(q.type === 'single' || q.type === 'multiple') && (
        <div>
          {q.options.map((opt, oi) => (
            <div key={oi} style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
              <input
                className="win-input"
                type="text"
                value={opt}
                onChange={e => onUpdateOption(qi, oi, e.target.value)}
                placeholder={`Вариант ${oi + 1}`}
                maxLength={100}
              />
              {q.options.length > 2 && (
                <button type="button" className="win-btn"
                  style={{ minWidth: 0, padding: '2px 8px' }}
                  onClick={() => onRemoveOption(qi, oi)}
                >×</button>
              )}
            </div>
          ))}
          <button type="button" className="win-btn"
            style={{ fontSize: 12, minWidth: 0, marginTop: 2 }}
            onClick={() => onAddOption(qi)}
          >+ Вариант</button>
        </div>
      )}

      {q.type === 'rating' && (
        <div style={{ fontSize: 12, color: '#555' }}>★★★★★ Шкала от 1 до 5</div>
      )}
      {q.type === 'text' && (
        <div style={{ fontSize: 12, color: '#555' }}>📝 Участник введёт текст свободно</div>
      )}
    </div>
  );
}
