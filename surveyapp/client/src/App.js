import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SurveyProvider } from './context/SurveyContext';
import { WindowProvider, useWindow } from './context/WindowContext';
import { Taskbar } from './components/UI';
import BootScreen from './components/BootScreen';
import BSOD from './components/BSOD';
import DesktopIcon from './components/DesktopIcon';
import SurveysPage from './pages/SurveysPage';
import SurveyPage from './pages/SurveyPage';
import CreatePage from './pages/CreatePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProfilePage } from './pages/OtherPages';
import './styles/win98.css';

const desktopStyle = {
  backgroundImage: `url(${process.env.PUBLIC_URL}/bliss.jpg)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
};

const WINDOW_REGISTRY = {
  surveys:   { Component: SurveysPage },
  dashboard: { Component: DashboardPage },
  create:    { Component: CreatePage },
  login:     { Component: LoginPage },
  register:  { Component: RegisterPage },
  profile:   { Component: ProfilePage },
  survey:    { Component: SurveyPage },
};

function DesktopIcons() {
  const { openWindow } = useWindow();
  const icons = [
    { icon: '📋', label: 'Опросы',        id: 'surveys' },
    { icon: '📊', label: 'Дашборд',       id: 'dashboard' },
    { icon: '➕', label: 'Создать опрос', id: 'create' },
    { icon: '👤', label: 'Профиль',       id: 'profile' },
    { icon: '🔑', label: 'Войти',         id: 'login' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 8, left: 8,
      display: 'flex', flexDirection: 'column', gap: 4,
      zIndex: 5,
    }}>
      {icons.map(item => (
        <DesktopIcon
          key={item.id}
          icon={item.icon}
          label={item.label}
          onClick={() => openWindow(item.id)}
        />
      ))}
    </div>
  );
}

function Desktop() {
  const { windows, focusWindow, closeWindow, minimizeWindow } = useWindow();

  return (
    <div className="win-desktop" style={{
      ...desktopStyle,
      position: 'relative',
      height: 'calc(100vh - 28px)',
      overflow: 'hidden',
    }}>
      <DesktopIcons />
      {windows.map(win => {
        const registryKey = win.id.startsWith('survey-') ? 'survey' : win.id;
        const reg = WINDOW_REGISTRY[registryKey];
        if (!reg) return null;
        const { Component } = reg;
        return (
          <div
            key={win.id}
            style={{
              display: win.minimized ? 'none' : 'block',
              position: 'absolute',
              left: win.spawnX,
              top: win.spawnY,
              zIndex: win.zIndex,
              width: 780,
              maxWidth: 'calc(100vw - 90px)',
            }}
            onMouseDown={() => focusWindow(win.id)}
          >
            <Component
              {...win.props}
              winId={win.id}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
            />
          </div>
        );
      })}
      <Taskbar />
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('booted') === '1');
  const [bsod, setBsod] = useState(false);

  function handleBoot() {
    sessionStorage.setItem('booted', '1');
    setBooted(true);
  }

  useEffect(() => {
    function handler(e) {
      if (e.detail?.critical) setBsod(true);
    }
    window.addEventListener('surveypro:error', handler);
    return () => window.removeEventListener('surveypro:error', handler);
  }, []);

  if (!booted) return <BootScreen onDone={handleBoot} />;

  if (bsod) return (
    <BSOD
      error="CONNECTION_REFUSED: Backend server unreachable"
      onRestart={() => { setBsod(false); window.location.reload(); }}
    />
  );

  return (
    <AuthProvider>
      <SurveyProvider>
        <WindowProvider>
          <Desktop />
        </WindowProvider>
      </SurveyProvider>
    </AuthProvider>
  );
}
