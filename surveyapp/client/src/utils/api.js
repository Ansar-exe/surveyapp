// api.js — centralized API client
// Automatically uses real backend or falls back to localStorage mock

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Token helpers ──
export function getToken() {
  return localStorage.getItem('surveyapp_token');
}
export function setToken(t) {
  if (t) localStorage.setItem('surveyapp_token', t);
  else localStorage.removeItem('surveyapp_token');
}

// ── Core fetch wrapper ──
async function request(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.fields = data.fields || {};
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── Auth ──
export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login:    (body) => request('POST', '/auth/login', body),
  me:       ()     => request('GET',  '/auth/me', null, true),
};

// ── Surveys ──
export const surveysAPI = {
  list:      (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/surveys${q ? '?' + q : ''}`, null, true);
  },
  get:       (id)     => request('GET',    `/surveys/${id}`, null, true),
  create:    (body)   => request('POST',   '/surveys', body, true),
  update:    (id, b)  => request('PUT',    `/surveys/${id}`, b, true),
  delete:    (id)     => request('DELETE', `/surveys/${id}`, null, true),
  respond:   (id, b)  => request('POST',   `/surveys/${id}/respond`, b, true),
  responses: (id)     => request('GET',    `/surveys/${id}/responses`, null, true),
};

// ── Users ──
export const usersAPI = {
  mySurveys: () => request('GET', '/users/me/surveys', null, true),
  myStats:   () => request('GET', '/users/me/stats', null, true),
};
