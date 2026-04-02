import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWindow } from '../context/WindowContext';
import useDrag from '../hooks/useDrag';

// ── Window chrome wrapper ──
export function Window({ title, icon = '🖥️', children, statusText, className = '', onClose, onMinimize }) {
  const { pos, onMouseDown } = useDrag({ x: 0, y: 0 });

  return (
    <div
      className={`win-window ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, width: '100%' }}
    >
      <div
        className="win-titlebar"
        onMouseDown={onMouseDown}
        style={{ cursor: 'move' }}
      >
        <div className="win-titlebar__text">{icon && <span>{icon}</span>} {title}</div>
        <div className="win-titlebar__controls">
          <button
            className="win-tb-btn"
            onMouseDown={e => e.stopPropagation()}
            onClick={onMinimize}
          >_</button>
          <button
            className="win-tb-btn"
            onMouseDown={e => e.stopPropagation()}
          >□</button>
          <button
            className="win-tb-btn"
            onMouseDown={e => e.stopPropagation()}
            onClick={onClose}
          >✕</button>
        </div>
      </div>
      {children}
      {statusText !== undefined && (
        <div className="win-statusbar">
          <div className="win-statusbar__panel">{statusText}</div>
        </div>
      )}
    </div>
  );
}

// ── Loader indicator ──
export function Loader({ text = 'Загрузка...' }) {
  return (
    <div className="win-loader">
      <div className="win-loader__dots">
        <span>▪</span><span>▪</span><span>▪</span>
      </div>
      {text}
    </div>
  );
}

// ── Alert box ──
export function Alert({ type = 'info', children }) {
  const icons = { error: '⚠️', success: '✅', info: 'ℹ️' };
  return (
    <div className={`win-alert win-alert--${type}`}>
      <span>{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
}

// ── Form input with error ──
export function FormField({ label, error, children }) {
  return (
    <div className="win-form-group">
      {label && <label>{label}</label>}
      {children}
      {error && <div className="win-error-text">⚠ {error}</div>}
    </div>
  );
}

// ── Clock ──
export function Clock() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  });

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return <div className="win-taskbar__clock">🔊 {time}</div>;
}

// ── Taskbar ──
const WINDOW_LABELS = {
  surveys:   '📋 Опросы',
  dashboard: '📊 Дашборд',
  create:    '➕ Создать',
  login:     '🔑 Войти',
  register:  '📝 Регистрация',
  profile:   '👤 Профиль',
};

export function Taskbar() {
  const { user, logout } = useAuth();
  const { windows, openWindow, focusWindow, minimizeWindow } = useWindow();

  return (
    <div className="win-taskbar">
      <button className="win-taskbar__start" onClick={() => openWindow('surveys')}>
        🪟 <strong>Пуск</strong>
      </button>
      <div className="win-taskbar__divider" />
      {windows.map(win => {
        const label = win.id.startsWith('survey-')
          ? '📝 Опрос'
          : (WINDOW_LABELS[win.id] || win.id);
        const isActive = !win.minimized;
        return (
          <button
            key={win.id}
            className={`win-taskbar__btn${isActive ? ' win-taskbar__btn--active' : ''}`}
            onClick={() => win.minimized ? focusWindow(win.id) : minimizeWindow(win.id)}
          >
            {label}
          </button>
        );
      })}
      {user && (
        <button
          className="win-taskbar__btn hide-tablet"
          onClick={logout}
          style={{ cursor: 'pointer', marginLeft: 'auto' }}
        >
          🚪 Выйти
        </button>
      )}
      <Clock />
    </div>
  );
}

// ── Star rating widget ──
export function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="win-stars">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          className={`win-star${i <= (hover || value) ? ' win-star--lit' : ''}`}
          onClick={() => !readOnly && onChange && onChange(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          aria-label={`${i} звезд`}
        >★</button>
      ))}
      {value > 0 && <span style={{ fontSize: 12, marginLeft: 6, color: '#555' }}>{value}/5</span>}
    </div>
  );
}

// ── Bar chart item ──
export function BarRow({ label, count, total }) {
  const pct = total > 0 ? Math.round(count / total * 100) : 0;
  return (
    <div className="win-bar-row">
      <div className="win-bar-label" title={label}>{label}</div>
      <div className="win-bar-track">
        <div className="win-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="win-bar-count">{count} ({pct}%)</div>
    </div>
  );
}

// ── Category badge ──
export function CategoryBadge({ category }) {
  const colors = {
    'Бизнес': '#000080',
    'Технологии': '#006400',
    'Образование': '#8B4513',
    'Здоровье': '#8B0000',
    'Развлечения': '#4B0082',
    'Другое': '#555',
  };
  return (
    <span style={{
      background: colors[category] || '#555',
      color: '#fff',
      fontSize: 11,
      padding: '1px 8px',
      fontWeight: 'bold',
      letterSpacing: '0.04em',
    }}>
      {category}
    </span>
  );
}

// ── Tabs ──
export function Tabs({ tabs, active, onChange }) {
  return (
    <div>
      <div className="win-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`win-tab${active === tab.key ? ' win-tab--active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="win-tab-body">
        {tabs.find(t => t.key === active)?.content}
      </div>
    </div>
  );
}

// ── Empty state ──
export function EmptyState({ icon = '📂', text = 'Ничего не найдено' }) {
  return (
    <div style={{ textAlign: 'center', padding: '30px 20px', color: '#666' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <div>{text}</div>
    </div>
  );
}
