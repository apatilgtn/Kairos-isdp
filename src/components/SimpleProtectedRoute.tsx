import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSimpleAuthStore } from '@/store/simple-auth-store';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

export const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  
  const authStore = useSimpleAuthStore();
  const { isAuthenticated, user, checkAuth } = authStore;

  useEffect(() => {
    console.log('SimpleProtectedRoute: checking auth');
    
    // Check auth from localStorage
    checkAuth();
    
    // Give a moment for the state to update, but check the result
    const checkComplete = () => {
      const currentState = useSimpleAuthStore.getState();
      console.log('SimpleProtectedRoute: auth check complete', { 
        isAuthenticated: currentState.isAuthenticated, 
        hasUser: !!currentState.user 
      });
      setIsChecking(false);
    };
    
    setTimeout(checkComplete, 100);
  }, []); // Remove dependency on checkAuth to avoid re-runs

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
    console.log('SimpleProtectedRoute: No authentication, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('SimpleProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
};
