import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppFallback } from './components/AppFallback';
import { SimpleProtectedRoute } from './components/SimpleProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import { useSimpleAuthStore } from '@/store/simple-auth-store';
import { DevvAIDebugPanel } from './components/DevvAIDebugPanel';

// Lazy load components to prevent initialization issues
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const ChatPage = React.lazy(() => import('./pages/ChatPage').then(module => ({ default: module.ChatPage })));
const TeamsPage = React.lazy(() => import('./pages/TeamsPage').then(module => ({ default: module.TeamsPage })));
const AnalyticsHubPage = React.lazy(() => import('./pages/AnalyticsHubPage').then(module => ({ default: module.AnalyticsHubPage })));
const DocumentsPage = React.lazy(() => import('./pages/DocumentsPage').then(module => ({ default: module.DocumentsPage })));
const EnterprisePage = React.lazy(() => import('./pages/EnterprisePage').then(module => ({ default: module.EnterprisePage })));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const TestAIPage = React.lazy(() => import('./pages/TestAIPage').then(module => ({ default: module.TestAIPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Loading component
const AppLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
      <div>
        <h2 className="text-lg font-semibold text-primary">Loading KAIROS</h2>
        <p className="text-sm text-muted-foreground">Initializing your strategic document platform...</p>
      </div>
    </div>
  </div>
);

export const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  
  // Safe store access
  const isAuthenticated = useSimpleAuthStore?.getState?.()?.isAuthenticated || false;

  useEffect(() => {
    // Initialize app safely
    const initializeApp = async () => {
      try {
        // Add small delay to ensure all stores are initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Validate stores are properly initialized
        const authStore = useSimpleAuthStore.getState();
        if (!authStore) {
          throw new Error('Authentication store not initialized');
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return <AppFallback error={initError} />;
  }

  if (!isInitialized) {
    return <AppLoading />;
  }

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<AppLoading />}>
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/debug" element={<DevvAIDebugPanel />} />
            <Route path="/" element={<SimpleProtectedRoute><HomePage /></SimpleProtectedRoute>} />
            <Route path="/projects" element={<SimpleProtectedRoute><ProjectsPage /></SimpleProtectedRoute>} />
            <Route path="/chat" element={<SimpleProtectedRoute><ChatPage /></SimpleProtectedRoute>} />
            <Route path="/teams" element={<SimpleProtectedRoute><TeamsPage /></SimpleProtectedRoute>} />
            <Route path="/analytics-hub" element={<SimpleProtectedRoute><AnalyticsHubPage /></SimpleProtectedRoute>} />
            <Route path="/documents" element={<SimpleProtectedRoute><DocumentsPage /></SimpleProtectedRoute>} />
            <Route path="/enterprise" element={<SimpleProtectedRoute><EnterprisePage /></SimpleProtectedRoute>} />
            <Route path="/reports" element={<SimpleProtectedRoute><ReportsPage /></SimpleProtectedRoute>} />
            <Route path="/test" element={<SimpleProtectedRoute><TestAIPage /></SimpleProtectedRoute>} />
            <Route path="/settings" element={<SimpleProtectedRoute><SettingsPage /></SimpleProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </Router>
  );
};