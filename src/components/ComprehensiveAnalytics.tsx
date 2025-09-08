import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { realtimeDataService } from '@/lib/realtime-data-service';
import { APIService } from '@/lib/api';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Users, 
  FileText, 
  Brain, 
  Zap, 
  Clock, 
  Target, 
  PieChart,
  LineChart,
  Globe,
  CheckCircle,
  AlertTriangle,
  Star,
  Rocket,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';

export const ComprehensiveAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [aiMetrics, setAIMetrics] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [projectsData, aiMetricsData, statsData, reportDataResult] = await Promise.all([
        APIService.getProjects(),
        realtimeDataService.generateRealtimeAIMetrics(),
        realtimeDataService.generateRealtimeDashboardStats(),
        realtimeDataService.generateRealtimeReportData()
      ]);

      setProjects(projectsData);
      setAIMetrics(aiMetricsData);
      setDashboardStats(statsData);
      setReportData(reportDataResult);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analytics Hub
            </h1>
            <p className="text-slate-600 mt-1">Comprehensive business intelligence and AI performance insights</p>
          </div>
          <Button onClick={loadAnalyticsData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{dashboardStats?.totalProjects || 0}</p>
                  <p className="text-sm font-medium text-blue-100">Total Projects</p>
                  <p className="text-xs text-blue-200">Strategic Portfolio</p>
                </div>
                <Target className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{aiMetrics?.totalGenerations || 0}</p>
                  <p className="text-sm font-medium text-emerald-100">AI Generations</p>
                  <p className="text-xs text-emerald-200">This Month</p>
                </div>
                <Brain className="w-10 h-10 text-emerald-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{Math.round(aiMetrics?.averageQualityScore || 0)}%</p>
                  <p className="text-sm font-medium text-purple-100">Quality Score</p>
                  <p className="text-xs text-purple-200">AI Performance</p>
                </div>
                <Star className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{Math.round(aiMetrics?.successRate || 0)}%</p>
                  <p className="text-sm font-medium text-amber-100">Success Rate</p>
                  <p className="text-xs text-amber-200">Generation Success</p>
                </div>
                <CheckCircle className="w-10 h-10 text-amber-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Model Performance
              </CardTitle>
              <CardDescription>Model utilization and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {aiMetrics?.modelUsage && Object.entries(aiMetrics.modelUsage).map(([model, data]: [string, any]) => (
                  <div key={model} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700">
                        {model === 'kimi-k2-0711-preview' ? 'Kimi Advanced Model' : 'Standard Model'}
                      </h4>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {data.count} uses
                      </Badge>
                    </div>
                    <Progress 
                      value={(data.count / (aiMetrics.totalGenerations || 1)) * 100} 
                      className="h-3" 
                    />
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-slate-700">{Math.round(data.avgQuality)}%</p>
                        <p className="text-xs text-slate-500">Avg Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-700">{Math.round(data.avgTime/1000)}s</p>
                        <p className="text-xs text-slate-500">Avg Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-700">{Math.round((data.count / (aiMetrics.totalGenerations || 1)) * 100)}%</p>
                        <p className="text-xs text-slate-500">Usage</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <PieChart className="w-6 h-6 text-indigo-600" />
                Document Type Distribution
              </CardTitle>
              <CardDescription>Generated document categories and volumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiMetrics?.documentTypeDistribution && Object.entries(aiMetrics.documentTypeDistribution)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([type, count]: [string, any]) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize text-slate-700">
                          {type.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                          {count}
                        </Badge>
                      </div>
                      <Progress 
                        value={(count / Math.max(...Object.values(aiMetrics.documentTypeDistribution).map(v => Number(v)))) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Project Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-emerald-600" />
                Recent AI Generations
              </CardTitle>
              <CardDescription>Latest document generation activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {aiMetrics?.recentGenerations && aiMetrics.recentGenerations.slice(0, 10).map((generation: any) => (
                  <div key={generation.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {generation.documentType.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {generation.projectName} • {generation.modelUsed}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-slate-700">
                        {Math.round(generation.qualityScore)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {Math.round(generation.generationTime/1000)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Project Portfolio Analysis
              </CardTitle>
              <CardDescription>Project distribution and industry insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status Distribution */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Project Status</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Active</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(dashboardStats?.activeProjects / (dashboardStats?.totalProjects || 1)) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium text-emerald-600">{dashboardStats?.activeProjects || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Completed</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(dashboardStats?.completedProjects / (dashboardStats?.totalProjects || 1)) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium text-blue-600">{dashboardStats?.completedProjects || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Draft</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(dashboardStats?.draftProjects / (dashboardStats?.totalProjects || 1)) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium text-amber-600">{dashboardStats?.draftProjects || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Industry Distribution */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Industry Breakdown</h4>
                  <div className="space-y-2">
                    {dashboardStats?.projectsByIndustry && Object.entries(dashboardStats.projectsByIndustry)
                      .sort(([,a], [,b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([industry, count]: [string, any]) => (
                        <div key={industry} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 truncate">{industry}</span>
                          <Badge variant="outline" className="ml-2">
                            {count}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-indigo-600" />
                System Health
              </CardTitle>
              <CardDescription>Platform performance and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">AI Success Rate</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.round(reportData?.aiPerformance?.generationSuccess || 0)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Response Time</span>
                  <Badge variant="outline">
                    {Math.round((reportData?.aiPerformance?.averageResponseTime || 0) / 1000)}s
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">User Satisfaction</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Math.round(reportData?.aiPerformance?.userSatisfaction || 0)}%
                  </Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-slate-700">Integration Status</h5>
                  {reportData?.enterpriseMetrics?.integrationStatus && 
                    Object.entries(reportData.enterpriseMetrics.integrationStatus).map(([service, status]: [string, any]) => (
                      <div key={service} className="flex justify-between items-center">
                        <span className="text-xs capitalize text-slate-600">{service}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            status === 'connected' ? 'text-green-600 border-green-200' :
                            status === 'error' ? 'text-red-600 border-red-200' :
                            'text-amber-600 border-amber-200'
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                Performance Trends
              </CardTitle>
              <CardDescription>7-day performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiMetrics?.trendsData?.last7Days && aiMetrics.trendsData.last7Days.slice(-7).map((day: any, index: number) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {day.generations} docs
                        </span>
                      </div>
                      <Progress value={(day.generations / 25) * 100} className="h-1 mt-1" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(day.avgQuality)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-600" />
                AI Persona Usage
              </CardTitle>
              <CardDescription>Expert persona utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aiMetrics?.personaUsage && Object.entries(aiMetrics.personaUsage)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 6)
                  .map(([persona, count]: [string, any]) => (
                    <div key={persona} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600 truncate">{persona}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                      <Progress 
                        value={(count / Math.max(...Object.values(aiMetrics.personaUsage).map(v => Number(v)))) * 100} 
                        className="h-1" 
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};