import React, { useState } from 'react';
import { 
  TestTube, 
  Brain, 
  FileText, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Play,
  Code,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APIService } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, AIGenerationResponse } from '@/types';

interface TestResult {
  id: string;
  type: 'roadmap' | 'elevatorPitch' | 'modelAdvice' | 'businessCase' | 'feasibilityStudy';
  status: 'pending' | 'running' | 'success' | 'error';
  result?: AIGenerationResponse;
  error?: string;
  startTime?: number;
  endTime?: number;
}

const testProject: MVPProject = {
  _id: 'test-project-123',
  _uid: 'test-user',
  _tid: 'test-table',
  name: 'AI-Powered Task Management App',
  industry: 'Technology/Software',
  problem_statement: 'Small business owners and freelancers struggle to manage multiple projects, track time, and maintain productivity across different tasks. Current solutions are either too complex for simple needs or too simple for growing businesses. Users need an intelligent system that adapts to their workflow patterns and provides insights to improve productivity.',
  status: 'active',
  created_at: Date.now() - 86400000, // 1 day ago
  updated_at: Date.now()
};

export const AITestingDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [authStatus, setAuthStatus] = useState<'unknown' | 'checking' | 'authenticated' | 'unauthenticated'>('unknown');
  const [customProject, setCustomProject] = useState({
    name: '',
    industry: 'Technology/Software',
    problem_statement: ''
  });

  const testTypes = [
    { 
      id: 'roadmap', 
      name: 'MVP Roadmap Generation', 
      description: 'Generate comprehensive development roadmap',
      icon: FileText 
    },
    { 
      id: 'elevatorPitch', 
      name: 'Elevator Pitch Creation', 
      description: 'Create investor-ready elevator pitch',
      icon: Zap 
    },
    { 
      id: 'modelAdvice', 
      name: 'AI Model Recommendations', 
      description: 'Get technical AI implementation advice',
      icon: Brain 
    },
    { 
      id: 'businessCase', 
      name: 'Business Case Document', 
      description: 'Generate professional business case',
      icon: FileText 
    },
    { 
      id: 'feasibilityStudy', 
      name: 'Feasibility Study', 
      description: 'Comprehensive feasibility analysis',
      icon: TestTube 
    }
  ] as const;

  const checkAuthStatus = async () => {
    setAuthStatus('checking');
    try {
      const isAuthenticated = await APIService.checkAuthStatus();
      setAuthStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
      
      if (addNotification) {
        addNotification({
          type: isAuthenticated ? 'success' : 'error',
          title: 'Authentication Status',
          message: isAuthenticated ? 'AI services are accessible' : 'Please log in to access AI services',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthStatus('unauthenticated');
      
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Authentication Check Failed',
          message: 'Unable to verify AI service access',
          duration: 5000
        });
      }
    }
  };

  const runTest = async (testType: string) => {
    if (!user) {
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in to test AI features'
        });
      }
      return;
    }

    const testId = `test-${testType}-${Date.now()}`;
    const newTest: TestResult = {
      id: testId,
      type: testType as TestResult['type'],
      status: 'running',
      startTime: Date.now()
    };

    setTestResults(prev => [newTest, ...prev]);

    try {
      console.log(`Starting ${testType} test...`);
      let result: AIGenerationResponse;

      // Use custom project if provided, otherwise use test project
      const projectToTest = customProject.name ? {
        ...testProject,
        name: customProject.name,
        industry: customProject.industry,
        problem_statement: customProject.problem_statement
      } : testProject;

      switch (testType) {
        case 'roadmap':
          result = await APIService.generateRoadmap(projectToTest);
          break;
        case 'elevatorPitch':
          result = await APIService.generateElevatorPitch(projectToTest);
          break;
        case 'modelAdvice':
          result = await APIService.generateModelAdvice('recommendation system for task prioritization', projectToTest);
          break;
        case 'businessCase':
          result = await APIService.generateBusinessCase(projectToTest);
          break;
        case 'feasibilityStudy':
          result = await APIService.generateFeasibilityStudy(projectToTest);
          break;
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }

      // Update test result
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: result.success ? 'success' : 'error', 
              result,
              error: result.success ? undefined : result.error,
              endTime: Date.now() 
            }
          : test
      ));

      if (addNotification) {
        addNotification({
          type: result.success ? 'success' : 'error',
          title: `${testType} Test ${result.success ? 'Passed' : 'Failed'}`,
          message: result.success 
            ? `Generated ${result.content?.length || 0} characters of content`
            : result.error || 'Unknown error occurred',
          duration: 5000
        });
      }

    } catch (error) {
      console.error(`${testType} test failed:`, error);
      
      setTestResults(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error occurred',
              endTime: Date.now() 
            }
          : test
      ));

      if (addNotification) {
        addNotification({
          type: 'error',
          title: `${testType} Test Failed`,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          duration: 5000
        });
      }
    }
  };

  const runAllTests = async () => {
    for (const testType of testTypes) {
      await runTest(testType.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const exportResults = () => {
    const results = testResults.map(test => ({
      type: test.type,
      status: test.status,
      duration: test.endTime && test.startTime ? test.endTime - test.startTime : null,
      contentLength: test.result?.content?.length || 0,
      error: test.error,
      timestamp: new Date(test.startTime || Date.now()).toISOString()
    }));

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-test-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600">Please log in to test AI features.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Feature Testing</h1>
              <p className="text-gray-600">Test and validate KAIROS AI generation capabilities</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={checkAuthStatus}
                variant="outline"
                disabled={authStatus === 'checking'}
                className="gap-2"
              >
                {authStatus === 'checking' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                Check Auth
              </Button>
              <Button 
                onClick={runAllTests}
                disabled={testResults.some(t => t.status === 'running')}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white gap-2"
              >
                <Play className="h-4 w-4" />
                Run All Tests
              </Button>
            </div>
          </div>
        </div>

        {/* Auth Status */}
        {authStatus !== 'unknown' && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {authStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                {authStatus === 'authenticated' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {authStatus === 'unauthenticated' && <XCircle className="h-5 w-5 text-red-500" />}
                <div>
                  <p className="font-medium">
                    {authStatus === 'checking' && 'Checking authentication...'}
                    {authStatus === 'authenticated' && 'AI Services Accessible'}
                    {authStatus === 'unauthenticated' && 'Authentication Required'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {authStatus === 'authenticated' && 'All AI generation features are available'}
                    {authStatus === 'unauthenticated' && 'Please log in to access AI services'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="tests">Test AI Features</TabsTrigger>
            <TabsTrigger value="custom">Custom Project Test</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-6">
            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testTypes.map((testType) => {
                const IconComponent = testType.icon;
                const isRunning = testResults.some(t => t.type === testType.id && t.status === 'running');
                
                return (
                  <Card key={testType.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="h-6 w-6 text-orange-500 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{testType.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{testType.description}</p>
                          <Button 
                            onClick={() => runTest(testType.id)}
                            disabled={isRunning || authStatus === 'unauthenticated'}
                            className="w-full gap-2"
                            variant={isRunning ? "outline" : "default"}
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" />
                                Test
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Custom Project Testing</CardTitle>
                <p className="text-sm text-gray-600">Test AI generation with your own project details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={customProject.name}
                    onChange={(e) => setCustomProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <select
                    value={customProject.industry}
                    onChange={(e) => setCustomProject(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Technology/Software">Technology/Software</option>
                    <option value="Healthcare/Medical">Healthcare/Medical</option>
                    <option value="Finance/FinTech">Finance/FinTech</option>
                    <option value="E-commerce/Retail">E-commerce/Retail</option>
                    <option value="Education/EdTech">Education/EdTech</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Problem Statement</label>
                  <Textarea
                    value={customProject.problem_statement}
                    onChange={(e) => setCustomProject(prev => ({ ...prev, problem_statement: e.target.value }))}
                    placeholder="Describe the problem your project solves..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => runTest('roadmap')}
                    disabled={!customProject.name || !customProject.problem_statement}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Test Roadmap
                  </Button>
                  <Button 
                    onClick={() => runTest('elevatorPitch')}
                    disabled={!customProject.name || !customProject.problem_statement}
                    variant="outline"
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Test Pitch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Results ({testResults.length})</h3>
              <div className="flex space-x-2">
                <Button onClick={exportResults} variant="outline" disabled={testResults.length === 0} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button onClick={clearResults} variant="outline" disabled={testResults.length === 0}>
                  Clear Results
                </Button>
              </div>
            </div>
            
            {testResults.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No test results yet</h3>
                  <p className="text-gray-600">Run some AI tests to see results here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {testResults.map((test) => (
                  <Card key={test.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h4 className="font-medium">{testTypes.find(t => t.id === test.type)?.name}</h4>
                            <p className="text-sm text-gray-600">
                              {test.endTime && test.startTime 
                                ? `Completed in ${((test.endTime - test.startTime) / 1000).toFixed(1)}s`
                                : test.status === 'running' 
                                ? 'Running...' 
                                : 'Pending'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getStatusColor(test.status)}>
                            {test.status}
                          </Badge>
                          {test.result?.content && (
                            <Badge variant="outline">
                              {test.result.content.length} chars
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {test.error && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-600">{test.error}</p>
                        </div>
                      )}
                      
                      {test.result?.content && (
                        <div className="mt-3">
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 group-open:mb-2">
                              View Generated Content
                            </summary>
                            <div className="p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {test.result.content.substring(0, 500)}
                                {test.result.content.length > 500 && '...'}
                              </pre>
                            </div>
                          </details>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};