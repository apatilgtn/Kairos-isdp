import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Home, LogIn } from 'lucide-react';

interface AppFallbackProps {
  error?: string;
}

export const AppFallback: React.FC<AppFallbackProps> = ({ error }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleReset = () => {
    // Clear all localStorage and reload
    localStorage.clear();
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">KAIROS Platform Error</CardTitle>
          <CardDescription>
            We encountered an unexpected error. This might be due to authentication issues, 
            network problems, or a temporary system glitch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Try these solutions:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                Try refreshing the page
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                Check your internet connection
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                Clear browser cache if needed
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                Sign in again if necessary
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleReload} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={handleReload}>
                Reload Page
              </Button>
              <Button variant="outline" size="sm" onClick={handleGoToLogin}>
                <LogIn className="w-4 h-4 mr-1" />
                Go to Login
              </Button>
              <Button variant="outline" size="sm" onClick={handleGoHome}>
                <Home className="w-4 h-4 mr-1" />
                New Tab
              </Button>
            </div>
            
            <Button variant="destructive" size="sm" onClick={handleReset}>
              Emergency Reset
            </Button>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Technical Details (for developers)
            </summary>
            <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs">
              <pre>{JSON.stringify({
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                referrer: document.referrer,
                error: error || 'Unknown error',
                localStorage: Object.keys(localStorage).reduce((acc, key) => {
                  try {
                    acc[key] = JSON.parse(localStorage.getItem(key) || '{}');
                  } catch {
                    acc[key] = localStorage.getItem(key);
                  }
                  return acc;
                }, {} as Record<string, any>)
              }, null, 2)}</pre>
            </div>
          </details>

          <p className="text-xs text-muted-foreground text-center">
            If problems persist, try opening KAIROS in an incognito window or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};