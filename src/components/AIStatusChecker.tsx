import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

export const AIStatusChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [testResults, setTestResults] = useState<{
    authStatus: boolean | null;
    aiTest: boolean | null;
    kimiTest: boolean | null;
    error: string | null;
  }>({
    authStatus: null,
    aiTest: null,
    kimiTest: null,
    error: null
  });
  
  const { addNotification } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();

  const runDiagnostics = async () => {
    setIsChecking(true);
    setTestResults({ authStatus: null, aiTest: null, kimiTest: null, error: null });

    try {
      // Check auth status
      const authCheck = await APIService.checkAuthStatus();
      setTestResults(prev => ({ ...prev, authStatus: authCheck }));

      if (!authCheck) {
        setTestResults(prev => ({ ...prev, error: 'Authentication failed - please log in again' }));
        return;
      }

      // Test LLM backend health
      try {
        const healthResponse = await fetch('http://localhost:4001/api/health');
        const healthData = await healthResponse.json();
        console.log('LLM Backend Health:', healthData);

        if (!healthResponse.ok || healthData.status !== 'ok') {
          setTestResults(prev => ({ ...prev, error: 'LLM Backend service is not available' }));
          return;
        }
      } catch (error) {
        console.error('LLM Backend health check failed:', error);
        setTestResults(prev => ({ ...prev, error: 'Cannot connect to LLM Backend service' }));
        return;
      }

      // Test chat AI endpoint
      try {
        const chatResponse = await APIService.chat('Hello, this is a test message.');
        setTestResults(prev => ({ ...prev, aiTest: chatResponse.success }));

        if (!chatResponse.success) {
          setTestResults(prev => ({ ...prev, error: chatResponse.error || 'Chat AI test failed' }));
          return;
        }
      } catch (error) {
        console.error('Chat AI test error:', error);
        setTestResults(prev => ({ 
          ...prev, 
          aiTest: false,
          error: error instanceof Error ? error.message : 'Chat AI test failed'
        }));
        return;
      }

      // Test document generation
      try {
        const testProject = {
          _id: 'test',
          _uid: user?.uid || 'test',
          _tid: 'test',
          name: 'Test Project',
          industry: 'Technology',
          problem_statement: 'Testing AI generation functionality',
          created_at: Date.now(),
          updated_at: Date.now(),
          status: 'active' as const
        };

        const generationResponse = await APIService.generateElevatorPitch(testProject);
        setTestResults(prev => ({ ...prev, kimiTest: generationResponse.success }));

        if (!generationResponse.success) {
          setTestResults(prev => ({ ...prev, error: generationResponse.error || 'Document generation test failed' }));
        }
      } catch (error) {
        console.error('Document generation test error:', error);
        setTestResults(prev => ({ 
          ...prev, 
          kimiTest: false,
          error: error instanceof Error ? error.message : 'Document generation test failed'
        }));
      }

    } catch (error) {
      console.error('Diagnostics error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Diagnostics failed'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    if (status === true) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Not Tested</Badge>;
    if (status === true) return <Badge variant="default" className="bg-green-500">Working</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          AI System Diagnostics
        </CardTitle>
        <CardDescription>
          Test the AI generation system to identify any issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Authentication Status</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.authStatus)}
              {getStatusBadge(testResults.authStatus)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Chat AI Service</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.aiTest)}
              {getStatusBadge(testResults.aiTest)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Document Generation</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.kimiTest)}
              {getStatusBadge(testResults.kimiTest)}
            </div>
          </div>
        </div>

        {testResults.error && (
          <Alert variant="destructive">
            <AlertDescription>{testResults.error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Current Auth Status: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
          </p>
          {user && (
            <p className="text-sm text-muted-foreground">
              User: {user.email} (ID: {user.uid})
            </p>
          )}
        </div>

        <Button 
          onClick={runDiagnostics} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isChecking ? 'Running Diagnostics...' : 'Run AI Diagnostics'}
        </Button>
      </CardContent>
    </Card>
  );
};