import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SurveyProvider } from './context/SurveyContext';
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
import { ProfilePage, NotFoundPage } from './pages/OtherPages';
import './styles/win98.css';

const desktopStyle = {
  backgroundImage: `url(${process.env.PUBLIC_URL}/bliss.jpg)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
};

function DesktopIcons() {
  const navigate = useNavigate();
  const icons = [
    { icon: '📋', label: 'Опросы', path: '/' },
    { icon: '📊', label: 'Дашборд', path: '/dashboard' },
    { icon: '➕', label: 'Создать опрос', path: '/create' },
    { icon: '👤', label: 'Профиль', path: '/profile' },
    { icon: '🔑', label: 'Войти', path: '/login' },
  ];

  return (
    <div style={{
      position: 'fixed', top: 8, left: 8,
      display: 'flex', flexDirection: 'column', gap: 4,
      zIndex: 10,
    }}>
      {icons.map(item => (
        <DesktopIcon
          key={item.path}
          icon={item.icon}
          label={item.label}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
}

function Layout({ onBsod }) {
  return (
    <div className="win-desktop" style={desktopStyle}>
      <DesktopIcons />
      <div style={{ width: '100%', paddingLeft: 80 }}>
        <Routes>
          <Route path="/"           element={<SurveysPage />} />
          <Route path="/survey/:id" element={<SurveyPage />} />
          <Route path="/create"     element={<CreatePage />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="*"           element={<NotFoundPage />} />
        </Routes>
      </div>
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

  // Listen for critical server errors to trigger BSOD
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
    <BrowserRouter>
      <AuthProvider>
        <SurveyProvider>
          <Layout />
        </SurveyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
