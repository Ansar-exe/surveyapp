import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SurveyProvider } from './context/SurveyContext';
import { Taskbar } from './components/UI';
import SurveysPage from './pages/SurveysPage';
import SurveyPage from './pages/SurveyPage';
import CreatePage from './pages/CreatePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ProfilePage, NotFoundPage } from './pages/OtherPages';
import './styles/win98.css';

function Layout() {
  return (
    <div className="win-desktop">
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
      <Taskbar />
    </div>
  );
}

export default function App() {
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
