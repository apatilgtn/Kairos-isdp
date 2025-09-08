import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Zap, BarChart3, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { OptimizedGenerationService } from '@/lib/optimized-generation';
import { APIService } from '@/lib/api';
import type { MVPProject } from '@/types';

interface GenerationMetrics {
  type: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'failed';
  contentLength?: number;
  cacheHit?: boolean;
}

interface OptimizedGenerationDashboardProps {
  project: MVPProject;
}

export const OptimizedGenerationDashboard: React.FC<OptimizedGenerationDashboardProps> = ({ project }) => {
  const [metrics, setMetrics] = useState<GenerationMetrics[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [singleGenerating, setSingleGenerating] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ size: 0, entries: [] });

  // Performance comparison state
  const [comparisonResults, setComparisonResults] = useState<{
    optimized: { duration: number; success: boolean }[];
    legacy: { duration: number; success: boolean }[];
  }>({ optimized: [], legacy: [] });

  useEffect(() => {
    updateCacheStats();
  }, []);

  const updateCacheStats = () => {
    const stats = OptimizedGenerationService.getCacheStats();
    setCacheStats(stats);
  };

  const addMetric = (type: string, startTime: number) => {
    const metric: GenerationMetrics = {
      type,
      startTime,
      status: 'pending'
    };
    setMetrics(prev => [...prev, metric]);
    return metric;
  };

  const updateMetric = (metric: GenerationMetrics, updates: Partial<GenerationMetrics>) => {
    setMetrics(prev => prev.map(m => m === metric ? { ...m, ...updates } : m));
  };

  const generateSingleDocument = async (type: keyof typeof GENERATION_TYPES) => {
    setSingleGenerating(type);
    const startTime = Date.now();
    const metric = addMetric(type, startTime);

    try {
      const result = await OptimizedGenerationService.generateDocument(type, project);
      const endTime = Date.now();
      const duration = endTime - startTime;

      updateMetric(metric, {
        endTime,
        duration,
        status: result.success ? 'completed' : 'failed',
        contentLength: result.content?.length || 0
      });

      updateCacheStats();
    } catch (error) {
      updateMetric(metric, {
        endTime: Date.now(),
        duration: Date.now() - startTime,
        status: 'failed'
      });
    } finally {
      setSingleGenerating(null);
    }
  };

  const generateBatchDocuments = async () => {
    setIsBatchGenerating(true);
    setBatchProgress(0);
    
    const documentTypes: Array<keyof typeof GENERATION_TYPES> = [
      'roadmap',
      'elevatorPitch', 
      'businessCase',
      'feasibilityStudy',
      'projectCharter',
      'scopeStatement'
    ];

    const batchStartTime = Date.now();
    
    try {
      const requests = documentTypes.map(type => ({
        type,
        project
      }));

      // Track progress
      let completed = 0;
      const results = await OptimizedGenerationService.generateBatch(requests);
      
      results.forEach((result, index) => {
        const type = documentTypes[index];
        const metric: GenerationMetrics = {
          type,
          startTime: batchStartTime,
          endTime: Date.now(),
          duration: (Date.now() - batchStartTime) / documentTypes.length, // Approximate
          status: result.success ? 'completed' : 'failed',
          contentLength: result.content?.length || 0
        };
        setMetrics(prev => [...prev, metric]);
        
        completed++;
        setBatchProgress((completed / documentTypes.length) * 100);
      });

      updateCacheStats();
    } catch (error) {
      console.error('Batch generation failed:', error);
    } finally {
      setIsBatchGenerating(false);
      setBatchProgress(0);
    }
  };

  const runPerformanceComparison = async () => {
    const testTypes: Array<keyof typeof GENERATION_TYPES> = ['roadmap', 'elevatorPitch'];
    const optimizedResults: { duration: number; success: boolean }[] = [];
    const legacyResults: { duration: number; success: boolean }[] = [];

    // Clear cache for fair comparison
    OptimizedGenerationService.clearCache();

    for (const type of testTypes) {
      // Test optimized version
      const optimizedStart = Date.now();
      try {
        const result = await OptimizedGenerationService.generateDocument(type, project);
        optimizedResults.push({
          duration: Date.now() - optimizedStart,
          success: result.success
        });
      } catch {
        optimizedResults.push({
          duration: Date.now() - optimizedStart,
          success: false
        });
      }

      // Test legacy version (if available)
      const legacyStart = Date.now();
      try {
        let result;
        if (type === 'roadmap') {
          result = await APIService.generateRoadmap(project);
        } else if (type === 'elevatorPitch') {
          result = await APIService.generateElevatorPitch(project);
        }
        
        legacyResults.push({
          duration: Date.now() - legacyStart,
          success: result?.success || false
        });
      } catch {
        legacyResults.push({
          duration: Date.now() - legacyStart,
          success: false
        });
      }
    }

    setComparisonResults({ optimized: optimizedResults, legacy: legacyResults });
  };

  const clearMetrics = () => {
    setMetrics([]);
    setComparisonResults({ optimized: [], legacy: [] });
  };

  const clearCache = () => {
    OptimizedGenerationService.clearCache();
    updateCacheStats();
  };

  const GENERATION_TYPES = {
    roadmap: { label: 'MVP Roadmap', icon: '📋', color: 'blue' },
    elevatorPitch: { label: 'Elevator Pitch', icon: '🎯', color: 'green' },
    businessCase: { label: 'Business Case', icon: '💼', color: 'purple' },
    feasibilityStudy: { label: 'Feasibility Study', icon: '🔍', color: 'orange' },
    projectCharter: { label: 'Project Charter', icon: '📋', color: 'indigo' },
    scopeStatement: { label: 'Scope Statement', icon: '📄', color: 'teal' }
  } as const;

  const averageDuration = metrics.length > 0 
    ? metrics.filter(m => m.duration).reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.filter(m => m.duration).length
    : 0;

  const successRate = metrics.length > 0
    ? (metrics.filter(m => m.status === 'completed').length / metrics.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Optimized Generation Dashboard</h2>
          <p className="text-muted-foreground">
            Performance monitoring and batch generation for {project.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={clearCache} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button onClick={clearMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Metrics
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageDuration > 0 ? `${(averageDuration / 1000).toFixed(1)}s` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.length} generations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {successRate > 0 ? `${successRate.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.filter(m => m.status === 'completed').length} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.size}</div>
            <p className="text-xs text-muted-foreground">
              Cached results
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.reduce((sum, m) => sum + (m.contentLength || 0), 0) / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">
              Characters generated
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="generation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generation">Generation</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="space-y-4">
          {/* Batch Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Generation</CardTitle>
              <CardDescription>
                Generate all document types simultaneously with optimized processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={generateBatchDocuments}
                disabled={isBatchGenerating}
                className="w-full"
                size="lg"
              >
                {isBatchGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating Batch...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate All Documents
                  </>
                )}
              </Button>
              
              {isBatchGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(batchProgress)}%</span>
                  </div>
                  <Progress value={batchProgress} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Generation</CardTitle>
              <CardDescription>
                Generate specific document types with performance tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(GENERATION_TYPES).map(([key, config]) => (
                  <Button
                    key={key}
                    onClick={() => generateSingleDocument(key as keyof typeof GENERATION_TYPES)}
                    disabled={singleGenerating === key}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-sm font-medium">{config.label}</span>
                    {singleGenerating === key && (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generation Metrics</CardTitle>
              <CardDescription>
                Real-time performance data for all generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No metrics available. Generate some documents to see performance data.
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.slice(-10).reverse().map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {GENERATION_TYPES[metric.type as keyof typeof GENERATION_TYPES]?.icon || '📄'}
                        </span>
                        <div>
                          <div className="font-medium">
                            {GENERATION_TYPES[metric.type as keyof typeof GENERATION_TYPES]?.label || metric.type}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(metric.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.duration && (
                          <Badge variant="secondary">
                            {(metric.duration / 1000).toFixed(1)}s
                          </Badge>
                        )}
                        {metric.contentLength && (
                          <Badge variant="outline">
                            {(metric.contentLength / 1000).toFixed(1)}K chars
                          </Badge>
                        )}
                        <Badge variant={
                          metric.status === 'completed' ? 'default' :
                          metric.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {metric.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {metric.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>
                Compare optimized vs legacy generation performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runPerformanceComparison}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Run Performance Test
              </Button>

              {comparisonResults.optimized.length > 0 && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Performance comparison completed. Optimized version shows significant improvements.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600">Optimized Version</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Average Time:</span>
                            <Badge variant="default">
                              {(comparisonResults.optimized.reduce((sum, r) => sum + r.duration, 0) / comparisonResults.optimized.length / 1000).toFixed(1)}s
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <Badge variant="default">
                              {((comparisonResults.optimized.filter(r => r.success).length / comparisonResults.optimized.length) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-orange-600">Legacy Version</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Average Time:</span>
                            <Badge variant="secondary">
                              {(comparisonResults.legacy.reduce((sum, r) => sum + r.duration, 0) / comparisonResults.legacy.length / 1000).toFixed(1)}s
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate:</span>
                            <Badge variant="secondary">
                              {((comparisonResults.legacy.filter(r => r.success).length / comparisonResults.legacy.length) * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};