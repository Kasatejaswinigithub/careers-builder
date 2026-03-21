import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { LoginPage }         from './pages/LoginPage';
import { RegisterPage }      from './pages/RegisterPage';
import { DashboardPage }     from './pages/DashboardPage';
import { JobsPage }          from './pages/JobsPage';
import { ApplicationsPage }  from './pages/ApplicationsPage';
import { BrandingPage }      from './pages/BrandingPage';
import { EditPage }          from './pages/EditPage';
import { PreviewPage }       from './pages/PreviewPage';
import { PublicCareersPage } from './pages/PublicCareersPage';
import { DashboardLayout }   from './components/DashboardLayout';

export default function App() {
  const loadMe = useAuthStore(function(s) { return s.loadMe; });
  const token  = useAuthStore(function(s) { return s.token; });

  useEffect(function() {
    if (token) loadMe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/:slug/careers" element={<PublicCareersPage />} />
        <Route path="/:slug/edit"    element={<EditPage />} />
        <Route path="/:slug/preview" element={<PreviewPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index               element={<DashboardPage />} />
          <Route path="jobs"         element={<JobsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="branding"     element={<BrandingPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
