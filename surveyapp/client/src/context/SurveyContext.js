import { createContext, useContext, useState, useCallback } from 'react';
import { surveysAPI } from '../utils/api';

const SurveyContext = createContext(null);

// ── Seed data for offline/first-load ──
const SEED = [
  {
    id: 'seed-1',
    title: 'Удовлетворённость работой 2025',
    desc: 'Оцените условия труда и корпоративную культуру.',
    category: 'Бизнес', status: 'active',
    authorId: 'system', authorName: 'Admin',
    createdAt: '2025-01-10T10:00:00Z', responses: 342,
    questions: [
      { type:'single', text:'Как вы оцениваете баланс работы и жизни?', options:['Отлично','Хорошо','Удовлетворительно','Плохо'] },
      { type:'multiple', text:'Важные льготы:', options:['ДМС','Гибкий график','Удалёнка','Обучение','Бонусы'] },
      { type:'rating', text:'Оцените корпоративную культуру' },
      { type:'text', text:'Что бы вы изменили?' },
    ],
    results: {
      0: {'Отлично':89,'Хорошо':142,'Удовлетворительно':78,'Плохо':33},
      1: {'ДМС':198,'Гибкий график':245,'Удалёнка':312,'Обучение':167,'Бонусы':289},
      2: [12,28,45,67,190], 3: [],
    },
  },
  {
    id: 'seed-2',
    title: 'Тренды в технологиях',
    desc: 'Какие технологии будут доминировать?',
    category: 'Технологии', status: 'active',
    authorId: 'system', authorName: 'Admin',
    createdAt: '2025-01-15T12:00:00Z', responses: 518,
    questions: [
      { type:'multiple', text:'Перспективные направления AI:', options:['Генеративный AI','Компьютерное зрение','Обработка языка','Автономные агенты'] },
      { type:'single', text:'Используете AI в работе?', options:['Ежедневно','Несколько раз','Иногда','Не использую'] },
      { type:'rating', text:'Готовность к цифровой трансформации' },
    ],
    results: {
      0: {'Генеративный AI':412,'Компьютерное зрение':178,'Обработка языка':234,'Автономные агенты':356},
      1: {'Ежедневно':198,'Несколько раз':145,'Иногда':112,'Не использую':63},
      2: [8,22,67,145,276],
    },
  },
];

export function SurveyProvider({ children }) {
  const [surveys, setSurveys]   = useState(SEED);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [backendUp, setBackend] = useState(false); // tracks if server responded

  // ── Fetch list from backend (with graceful fallback) ──
  const fetchSurveys = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const data = await surveysAPI.list(params);
      setSurveys(data.surveys);
      setBackend(true);
      return data;
    } catch (err) {
      // If backend is unreachable keep seed data, don't show error
      if (!backendUp) {
        console.warn('Backend unavailable, using local data.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUp]);

  const getSurvey = useCallback((id) => surveys.find(s => s.id === id) || null, [surveys]);

  // ── Create via API, fallback to local ──
  const createSurvey = useCallback(async (body, user) => {
    setLoading(true); setError(null);
    try {
      const data = await surveysAPI.create(body);
      setSurveys(prev => [data.survey, ...prev]);
      setBackend(true);
      return data.survey;
    } catch (err) {
      if (err.status) { setError(err.message); throw err; }
      // Offline fallback
      const survey = {
        id: Date.now().toString(), ...body,
        authorId: user.id, authorName: user.username,
        createdAt: new Date().toISOString(),
        responses: 0, status: 'active', results: {},
      };
      setSurveys(prev => [survey, ...prev]);
      return survey;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Submit response via API, fallback to local aggregation ──
  const submitResponse = useCallback(async (surveyId, answers) => {
    try {
      const data = await surveysAPI.respond(surveyId, { answers });
      setSurveys(prev => prev.map(s => s.id === surveyId ? data.survey : s));
      return data;
    } catch {
      // Offline: update local state
      setSurveys(prev => prev.map(s => {
        if (s.id !== surveyId) return s;
        const results = { ...s.results };
        (s.questions || []).forEach((q, qi) => {
          const ans = answers[qi];
          if (ans === undefined || ans === null || ans === '') return;
          if (q.type === 'single') {
            const label = q.options[ans];
            results[qi] = { ...(results[qi] || {}), [label]: ((results[qi] || {})[label] || 0) + 1 };
          } else if (q.type === 'multiple') {
            const cur = { ...(results[qi] || {}) };
            (ans || []).forEach(i => { const l = q.options[i]; if (l) cur[l] = (cur[l] || 0) + 1; });
            results[qi] = cur;
          } else if (q.type === 'rating') {
            const cur = [...(results[qi] || [0,0,0,0,0])];
            cur[Number(ans) - 1] = (cur[Number(ans) - 1] || 0) + 1;
            results[qi] = cur;
          }
        });
        return { ...s, responses: (s.responses || 0) + 1, results };
      }));
    }
  }, []);

  // ── Delete via API, fallback to local ──
  const deleteSurvey = useCallback(async (id) => {
    try {
      await surveysAPI.delete(id);
    } catch (err) {
      if (err.status && err.status !== 404) { setError(err.message); throw err; }
    }
    setSurveys(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <SurveyContext.Provider value={{
      surveys, loading, error, backendUp,
      fetchSurveys, getSurvey, createSurvey, submitResponse, deleteSurvey,
    }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurveys() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurveys must be used within SurveyProvider');
  return ctx;
}
