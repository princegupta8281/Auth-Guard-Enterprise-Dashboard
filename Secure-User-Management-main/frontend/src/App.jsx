import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AuthenticatedLayout from './components/AuthenticatedLayout';
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Tickets = lazy(() => import('./pages/Tickets'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Messages = lazy(() => import('./pages/Messages'));
const Settings = lazy(() => import('./pages/Settings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const Projects = lazy(() => import('./pages/Projects'));
const Tasks = lazy(() => import('./pages/Tasks'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-900 transition-colors duration-500 flex flex-col font-sans text-slate-900 dark:text-white selection:bg-primary-500/30">
      
      {/* Global Animated Background for Dark Mode */}
      <div className="fixed inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 animate-gradient-x z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      
      {/* Global Ambient Lights for Dark Mode */}
      <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-accent-light/5 blur-[120px] pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none z-0 opacity-0 dark:opacity-100 transition-opacity duration-500"></div>

      <main className="flex-grow flex flex-col h-full relative z-10">
        <Suspense fallback={<div className="route-loading" role="status"><span className="auth-spinner" /> Loading your workspace…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
            <Route path="/reset-password" element={<><Navbar /><ResetPassword /></>} />

            <Route path="/dashboard" element={<ProtectedRoute><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AuthenticatedLayout><Profile /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/appointments" element={<ProtectedRoute><AuthenticatedLayout><Appointments /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AuthenticatedLayout><AdminDashboard /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuthenticatedLayout><AuditLogs /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><AuthenticatedLayout><Tickets /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><AuthenticatedLayout><Projects /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><AuthenticatedLayout><Tasks /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AuthenticatedLayout><Analytics /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><AuthenticatedLayout><Messages /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AuthenticatedLayout><Settings /></AuthenticatedLayout></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><AuthenticatedLayout><HelpCenter /></AuthenticatedLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
