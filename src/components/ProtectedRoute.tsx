import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Safe store access with error handling
  const authStore = useAuthStore();
  const isAuthenticated = authStore?.isAuthenticated || false;
  const isInitialized = authStore?.isInitialized || false;
  const user = authStore?.user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authStore) {
          throw new Error('Auth store not available');
        }
        
        // Check localStorage directly for more reliable auth detection
        const checkLocalStorageAuth = () => {
          try {
            const authData = localStorage.getItem('mvp-auth-storage');
            if (authData) {
              const parsed = JSON.parse(authData);
              return parsed.state?.user?.uid ? true : false;
            }
          } catch (e) {
            console.error('Failed to parse auth data:', e);
          }
          return false;
        };
        
        const hasPersistedAuth = checkLocalStorageAuth();
        console.log('Auth check:', { 
          hasPersistedAuth, 
          isInitialized, 
          isAuthenticated, 
          hasUser: !!user 
        });
        
        // If we have persisted auth but store isn't authenticated, initialize it
        if (hasPersistedAuth && !isAuthenticated && isInitialized) {
          console.log('Found persisted auth, reinitializing store');
          authStore.initialize();
          // Give it a moment to process
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Wait for the store to be properly initialized
        if (!isInitialized && !hasPersistedAuth) {
          console.log('Waiting for auth store initialization...');
          return;
        }
        
        console.log('Auth check complete:', { 
          isAuthenticated: authStore.isAuthenticated, 
          user: !!authStore.user 
        });
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication check failed');
        setIsChecking(false);
      }
    };

    checkAuth();
    
    // Retry check every 100ms until initialized
    const interval = setInterval(() => {
      if (!isInitialized || isChecking) {
        checkAuth();
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    // Cleanup interval after 5 seconds max
    setTimeout(() => clearInterval(interval), 5000);
    
    return () => clearInterval(interval);
  }, [authStore, isInitialized, isAuthenticated, user, isChecking]);

  if (authError) {
    console.error('ProtectedRoute auth error:', authError);
    return <Navigate to="/login" replace />;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};