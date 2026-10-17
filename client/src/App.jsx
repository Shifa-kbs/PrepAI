import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import QuestionBankPage from './pages/QuestionBankPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import PracticePage from './pages/PracticePage';
import AptitudePage from './pages/AptitudePage';
import InterviewPage from './pages/InterviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import AdminPage from './pages/AdminPage';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: '#0f172a',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/questions" element={<QuestionBankPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/aptitude" element={<AptitudePage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />

            {/* Admin Portal (Protected by both ProtectedRoute and AdminRoute) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
