import { useState } from 'react';
import { useSurveys } from '../context/SurveyContext';
import { useAuth } from '../context/AuthContext';
import { useWindow } from '../context/WindowContext';
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

export default function CreatePage({ onClose, onMinimize }) {
  const { createSurvey } = useSurveys();
  const { user } = useAuth();
  const { openWindow } = useWindow();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Бизнес');
  const [questions, setQuestions] = useState([emptyQuestion('single')]);
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <Window title="Доступ запрещён — SurveyPro 98" icon="🔒" statusText="Необходима авторизация" onClose={onClose} onMinimize={onMinimize}>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Необходима авторизация</div>
          <div style={{ color: '#555', marginBottom: 16 }}>Войдите, чтобы создавать опросы</div>
          <button className="win-btn win-btn--default" onClick={() => openWindow('login')}>
            🔑 Войти
          </button>
        </div>
      </Window>
    );
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateSurveyForm({ title, questions });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const survey = await createSurvey({
      title: title.trim(),
      desc: desc.trim() || 'Без описания',
      category,
      questions: questions.map(q => ({
        ...q,
        options: q.options.filter(Boolean),
        text: q.text.trim() || 'Без текста',
      })),
    }, user);

    onClose && onClose();
    openWindow(`survey-${survey.id}`, { surveyId: survey.id });
  }

  return (
    <Window title="Создать опрос — SurveyPro 98" icon="➕" statusText={`Вопросов добавлено: ${questions.length}`} onClose={onClose} onMinimize={onMinimize}>
      <div className="win-menubar">
        <button className="win-menubar__item" onClick={onClose}>Отмена</button>
      </div>
      <div style={{ padding: '12px 16px', maxHeight: 580, overflowY: 'auto' }}>
        <form onSubmit={handleSubmit} noValidate>

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
            <button type="button" className="win-btn" onClick={onClose}>✕ Отмена</button>
          </div>
        </form>
      </div>
    </Window>
  );
}

function QuestionItem({ qi, q, total, onUpdateQuestion, onRemove, onAddOption, onRemoveOption, onUpdateOption }) {
  const typeLabel = Q_TYPES.find(t => t.value === q.type)?.label || q.type;

  return (
    <div style={{
      border: '2px solid', borderColor: 'var(--win-dark) var(--win-light) var(--win-light) var(--win-dark)',
      padding: 8, marginBottom: 8, background: '#fff', position: 'relative',
    }}>
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

      <input
        className="win-input"
        type="text"
        value={q.text}
        onChange={e => onUpdateQuestion(qi, 'text', e.target.value)}
        placeholder="Текст вопроса..."
        style={{ marginBottom: 6 }}
        maxLength={200}
      />

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
