import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Users, 
  BarChart3, 
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  FileText,
  Database,
  Globe,
  RefreshCw,
  PieChart,
  LineChart,
  Award,
  Briefcase
} from 'lucide-react';
import { realtimeDataService, type RealtimeAIMetrics, type RealtimeDashboardStats, type RealtimeReportData } from '@/lib/realtime-data-service';
import { AIAnalyticsDashboard } from './AIAnalyticsDashboard';

interface EnhancedAnalyticsHubProps {
  className?: string;
}

export const EnhancedAnalyticsHub: React.FC<EnhancedAnalyticsHubProps> = ({
  className = ''
}) => {
  const [aiMetrics, setAIMetrics] = useState<RealtimeAIMetrics | null>(null);
  const [dashboardStats, setDashboardStats] = useState<RealtimeDashboardStats | null>(null);
  const [reportData, setReportData] = useState<RealtimeReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAllAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAllAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [ai, dashboard, report] = await Promise.all([
        realtimeDataService.generateRealtimeAIMetrics(),
        realtimeDataService.generateRealtimeDashboardStats(),
        realtimeDataService.generateRealtimeReportData()
      ]);
      
      setAIMetrics(ai);
      setDashboardStats(dashboard);
      setReportData(report);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getHealthColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value >= thresholds.warning) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  if (loading && !aiMetrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Brain className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Loading Analytics Hub</h3>
                <p className="text-muted-foreground">Gathering realtime insights...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive realtime insights into your KAIROS platform performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatDate(lastUpdated)}
          </div>
          <Button variant="outline" size="sm" onClick={loadAllAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
          <TabsTrigger value="project-insights">Project Insights</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {dashboardStats?.totalProjects || 0}
                    </p>
                    <p className="text-xs text-blue-500">
                      {dashboardStats?.activeProjects || 0} active
                    </p>
                  </div>
                  <Briefcase className="h-8 w-8 text-blue-600 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">AI Generations</p>
                    <p className="text-2xl font-bold text-green-700">
                      {aiMetrics?.totalGenerations || 0}
                    </p>
                    <p className="text-xs text-green-500">
                      {aiMetrics?.successRate.toFixed(1)}% success rate
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-green-600 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg Quality</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {aiMetrics?.averageQualityScore.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-purple-500">
                      Enterprise grade
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Response Time</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {((aiMetrics?.averageGenerationTime || 0) / 1000).toFixed(1)}s
                    </p>
                    <p className="text-xs text-orange-500">
                      Ultra-fast AI
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Project Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Healthy</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold">{reportData.projectHealth.healthy}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Warning</span>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-bold">{reportData.projectHealth.warning}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Critical</span>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-bold">{reportData.projectHealth.critical}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Excellent</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {reportData.documentQuality.excellent}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Good</span>
                      <Badge variant="secondary">
                        {reportData.documentQuality.good}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Needs Improvement</span>
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        {reportData.documentQuality.needsImprovement}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    AI Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm font-bold text-green-600">
                          {reportData.aiPerformance.generationSuccess}%
                        </span>
                      </div>
                      <Progress value={reportData.aiPerformance.generationSuccess} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">User Satisfaction</span>
                        <span className="text-sm font-bold text-blue-600">
                          {reportData.aiPerformance.userSatisfaction}%
                        </span>
                      </div>
                      <Progress value={reportData.aiPerformance.userSatisfaction} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* AI Performance Tab */}
        <TabsContent value="ai-performance">
          <AIAnalyticsDashboard className="space-y-6" />
        </TabsContent>

        {/* Project Insights Tab */}
        <TabsContent value="project-insights" className="space-y-6">
          {dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Projects by Industry
                  </CardTitle>
                  <CardDescription>Industry distribution of your strategic projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.projectsByIndustry)
                      .sort(([,a], [,b]) => b - a)
                      .map(([industry, count]) => {
                        const total = Object.values(dashboardStats.projectsByIndustry).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={industry} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{industry}</span>
                              <span className="text-sm text-muted-foreground">
                                {count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Document Types
                  </CardTitle>
                  <CardDescription>Most generated document types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(dashboardStats.documentsByType)
                      .sort(([,a], [,b]) => b - a)
                      .map(([type, count]) => {
                        const total = Object.values(dashboardStats.documentsByType).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm font-medium capitalize">
                              {type.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">{count}</span>
                              <Progress value={percentage} className="w-20 h-2" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Enterprise Tab */}
        <TabsContent value="enterprise" className="space-y-6">
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>Enterprise system connections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(reportData.enterpriseMetrics.integrationStatus).map(([system, status]) => (
                      <div key={system} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{system}</span>
                        <Badge 
                          variant={status === 'connected' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}
                          className={
                            status === 'connected' ? 'bg-green-100 text-green-800 border-green-200' :
                            status === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Export Metrics
                  </CardTitle>
                  <CardDescription>Document export and sync performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Monthly Export Volume</span>
                        <span className="text-sm font-bold">{reportData.enterpriseMetrics.exportVolume}</span>
                      </div>
                      <Progress value={(reportData.enterpriseMetrics.exportVolume / 150) * 100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Sync Health</span>
                        <span className={`text-sm font-bold ${getHealthColor(reportData.enterpriseMetrics.syncHealth, { good: 90, warning: 75 })}`}>
                          {reportData.enterpriseMetrics.syncHealth}%
                        </span>
                      </div>
                      <Progress value={reportData.enterpriseMetrics.syncHealth} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsHub;