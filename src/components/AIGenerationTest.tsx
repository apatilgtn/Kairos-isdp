/**
 * AI Generation Test Component
 * Simple component to test the new unified AI service
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import type { MVPProject } from '@/types';

interface AITestProps {
  project: MVPProject;
}

export function AIGenerationTest({ project }: AITestProps) {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<Array<{
    type: string;
    status: 'pending' | 'success' | 'error';
    content?: string;
    error?: string;
  }>>([]);

  const testDocumentTypes = [
    { key: 'roadmap', label: 'MVP Roadmap', method: 'generateRoadmap' },
    { key: 'elevator_pitch', label: 'Elevator Pitch', method: 'generateElevatorPitch' },
    { key: 'business_case', label: 'Business Case', method: 'generateBusinessCase' },
  ];

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    for (const docType of testDocumentTypes) {
      setResults(prev => [...prev, { type: docType.label, status: 'pending' }]);

      try {
        console.log(`🧪 Testing ${docType.label} generation`);
        
        // Call the API method
        const method = APIService[docType.method as keyof typeof APIService] as any;
        const response = await method(project);

        if (response.success && response.content?.length > 50) {
          setResults(prev => prev.map(r => 
            r.type === docType.label 
              ? { ...r, status: 'success' as const, content: response.content.substring(0, 200) + '...' }
              : r
          ));
        } else {
          throw new Error(response.error || 'No content generated');
        }
      } catch (error) {
        console.error(`❌ ${docType.label} test failed:`, error);
        setResults(prev => prev.map(r => 
          r.type === docType.label 
            ? { ...r, status: 'error' as const, error: error instanceof Error ? error.message : 'Unknown error' }
            : r
        ));
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Generation System Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the unified AI generation service with your project: <strong>{project.name}</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm">
            This test will verify AI document generation works for different document types.
          </p>
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Run AI Tests
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Test Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.type}</span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    result.status === 'success' ? 'bg-green-100 text-green-800' :
                    result.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {result.status.toUpperCase()}
                  </span>
                </div>
                
                {result.content && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Generated content preview:</strong><br />
                    {result.content}
                  </div>
                )}
                
                {result.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!testing && results.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Test Complete!</strong> 
              {results.every(r => r.status === 'success') 
                ? ' All AI generation tests passed successfully. The system is working properly.'
                : ' Some tests failed. Check the LLM backend service status and try again.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
