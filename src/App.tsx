import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AppFallback } from './components/AppFallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from '@/store/auth-store';

// Lazy load components to prevent initialization issues
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const HomePage = React.lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
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
  const isAuthenticated = useAuthStore?.getState?.()?.isAuthenticated || false;

  useEffect(() => {
    // Initialize app safely
    const initializeApp = async () => {
      try {
        // Add small delay to ensure all stores are initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Validate stores are properly initialized
        const authStore = useAuthStore.getState();
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
            <Route 
              path="/login" 
              element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
              } 
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <ProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics-hub"
              element={
                <ProtectedRoute>
                  <AnalyticsHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents"
              element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enterprise"
              element={
                <ProtectedRoute>
                  <EnterprisePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <TestAIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Toaster />
      </div>
    </Router>
  );
};