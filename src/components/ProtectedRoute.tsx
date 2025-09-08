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
  const user = authStore?.user;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Give time for store hydration
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!authStore) {
          throw new Error('Auth store not available');
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication check failed');
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [authStore]);

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