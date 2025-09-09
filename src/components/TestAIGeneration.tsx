import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { APIService } from '@/lib/api';
import { Loader2, TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AIGenerationTest } from './AIGenerationTest';
import type { MVPProject } from '@/types';

// Test project data for validating AI generation quality
const TEST_PROJECTS: MVPProject[] = [
  {
    _id: 'test-1',
    _uid: 'test-user',
    _tid: 'test-table',
    name: "EcoTrack",
    industry: "Environmental Technology",
    problem_statement: "Individuals and businesses struggle to track and reduce their carbon footprint due to lack of accessible, accurate, and actionable tools. Current solutions are either too complex for everyday users or too expensive for small businesses.",
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    _id: 'test-2',
    _uid: 'test-user',
    _tid: 'test-table',
    name: "StudyBuddy AI",
    industry: "Education Technology",
    problem_statement: "Students struggle with personalized learning and often lack immediate feedback on their progress. Traditional study methods don't adapt to individual learning styles, leading to inefficient study sessions and poor retention rates.",
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now()
  },
  {
    _id: 'test-3',
    _uid: 'test-user',
    _tid: 'test-table',
    name: "LocalMart Connect",
    industry: "E-commerce/Local Business",
    problem_statement: "Small local businesses struggle to compete with large online retailers due to limited digital presence and customer reach. Customers want to support local businesses but find it difficult to discover and purchase from them conveniently.",
    status: 'active',
    created_at: Date.now(),
    updated_at: Date.now()
  }
];

const TEST_USE_CASES = [
  "sentiment analysis for customer reviews",
  "image recognition for product categorization", 
  "natural language processing for chatbot",
  "recommendation system for personalized content",
  "fraud detection for financial transactions"
];

interface TestResult {
  id: string;
  type: 'roadmap' | 'elevator_pitch' | 'model_advice';
  project: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: string;
  error?: string;
  quality_score?: number;
  timestamp: number;
}

// Quality assessment criteria for generated content
const QUALITY_CRITERIA = {
  roadmap: [
    'Contains Executive Summary',
    'Lists 3-6 core features',
    'Includes risk analysis',
    'Defines KPIs and metrics',
    'Has development timeline',
    'Includes go-to-market strategy',
    'Uses specific numbers/timelines',
    'Professional markdown formatting'
  ],
  elevator_pitch: [
    'Has attention-grabbing hook',
    'Clearly defines the problem',
    'Presents unique solution',
    'Quantifies market opportunity',
    'Shows traction/progress',
    'Includes specific ask',
    '150-200 words (60-90 sec)',
    'Conversational tone'
  ],
  model_advice: [
    'Recommends specific models',
    'Lists relevant datasets',
    'Provides implementation approach',
    'Sets performance expectations',
    'Includes fine-tuning strategy',
    'Mentions specific tools/frameworks',
    'Provides cost estimates',
    'Actionable next steps'
  ]
};

export const TestAIGeneration: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [runningAll, setRunningAll] = useState(false);

  const assessQuality = (content: string, type: keyof typeof QUALITY_CRITERIA): number => {
    const criteria = QUALITY_CRITERIA[type];
    let score = 0;
    
    criteria.forEach(criterion => {
      // Simple keyword and structure checks
      switch (criterion) {
        case 'Contains Executive Summary':
          if (content.toLowerCase().includes('executive summary') || content.toLowerCase().includes('overview')) score++;
          break;
        case 'Lists 3-6 core features':
          const featureMatches = content.match(/feature|functionality/gi);
          if (featureMatches && featureMatches.length >= 3) score++;
          break;
        case 'Includes risk analysis':
          if (content.toLowerCase().includes('risk') && content.toLowerCase().includes('mitigation')) score++;
          break;
        case 'Defines KPIs and metrics':
          if (content.toLowerCase().includes('kpi') || content.toLowerCase().includes('metric')) score++;
          break;
        case 'Has development timeline':
          if (content.toLowerCase().includes('timeline') || content.toLowerCase().includes('week') || content.toLowerCase().includes('phase')) score++;
          break;
        case 'Uses specific numbers/timelines':
          const numberMatches = content.match(/\d+/g);
          if (numberMatches && numberMatches.length >= 5) score++;
          break;
        case 'Professional markdown formatting':
          if (content.includes('##') && content.includes('**') && content.includes('-')) score++;
          break;
        case 'Has attention-grabbing hook':
          if (content.toLowerCase().includes('did you know') || content.toLowerCase().includes('imagine') || content.includes('?')) score++;
          break;
        case '150-200 words (60-90 sec)':
          const wordCount = content.split(/\s+/).length;
          if (wordCount >= 150 && wordCount <= 250) score++;
          break;
        case 'Recommends specific models':
          if (content.toLowerCase().includes('model') && (content.includes('huggingface') || content.includes('openai') || content.includes('google'))) score++;
          break;
        default:
          // Generic keyword matching
          const keywords = criterion.toLowerCase().split(' ');
          if (keywords.some(keyword => content.toLowerCase().includes(keyword))) score++;
      }
    });
    
    return Math.round((score / criteria.length) * 100);
  };

  const runSingleTest = async (
    project: MVPProject,
    type: 'roadmap' | 'elevator_pitch' | 'model_advice',
    useCase?: string
  ) => {
    const testId = `${type}-${project._id}-${Date.now()}`;
    const newTest: TestResult = {
      id: testId,
      type,
      project: project.name,
      status: 'running',
      timestamp: Date.now()
    };

    setTests(prev => [...prev, newTest]);

    try {
      let response;
      switch (type) {
        case 'roadmap':
          response = await APIService.generateRoadmap(project);
          break;
        case 'elevator_pitch':
          response = await APIService.generateElevatorPitch(project);
          break;
        case 'model_advice':
          response = await APIService.generateModelAdvice(useCase || TEST_USE_CASES[0], project);
          break;
      }

      const quality_score = response.success ? assessQuality(response.content, type) : 0;

      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: response.success ? 'success' : 'error',
              result: response.content,
              error: response.error,
              quality_score
            }
          : test
      ));
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.id === testId 
          ? { 
              ...test, 
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : test
      ));
    }
  };

  const runAllTests = async () => {
    setRunningAll(true);
    setTests([]);

    // Test each project with each generation type
    for (const project of TEST_PROJECTS) {
      await runSingleTest(project, 'roadmap');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Prevent rate limiting
      
      await runSingleTest(project, 'elevator_pitch');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await runSingleTest(project, 'model_advice', TEST_USE_CASES[Math.floor(Math.random() * TEST_USE_CASES.length)]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setRunningAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getQualityBadgeColor = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default'; // Green
    if (score >= 60) return 'secondary'; // Yellow
    return 'destructive'; // Red
  };

  const averageQuality = tests.filter(t => t.quality_score).reduce((acc, t) => acc + (t.quality_score || 0), 0) / tests.filter(t => t.quality_score).length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            AI Generation Quality Testing
          </CardTitle>
          <CardDescription>
            Test and validate AI generation quality across different project types and use cases.
            This helps refine prompts and ensure consistent, high-quality outputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={runningAll}
              className="flex items-center gap-2"
            >
              {runningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
              Run Full Test Suite
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Tests: {tests.length}</span>
              <span>Success: {tests.filter(t => t.status === 'success').length}</span>
              <span>Average Quality: {averageQuality.toFixed(1)}%</span>
            </div>
          </div>

          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {tests.map(test => (
                <Card key={test.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.project}</span>
                      <Badge variant="outline">{test.type.replace('_', ' ')}</Badge>
                      {test.quality_score && (
                        <Badge variant={getQualityBadgeColor(test.quality_score)}>
                          {test.quality_score}% Quality
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(test.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {test.error && (
                    <div className="text-sm text-red-500 bg-red-50 p-2 rounded mb-2">
                      Error: {test.error}
                    </div>
                  )}
                  
                  {test.result && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View Generated Content ({test.result.length} chars)
                      </summary>
                      <Textarea 
                        value={test.result} 
                        readOnly 
                        className="mt-2 h-32 text-xs"
                      />
                    </details>
                  )}
                </Card>
              ))}
              
              {tests.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No tests run yet. Click "Run Full Test Suite" to start testing AI generation quality.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* New Unified AI Test */}
      <AIGenerationTest project={TEST_PROJECTS[0]} />

      {/* Quality Criteria Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Assessment Criteria</CardTitle>
          <CardDescription>
            Each generated content is automatically assessed against these criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(QUALITY_CRITERIA).map(([type, criteria]) => (
              <div key={type}>
                <h4 className="font-medium mb-2 capitalize">{type.replace('_', ' ')}</h4>
                <ul className="text-sm space-y-1">
                  {criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                      {criterion}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};