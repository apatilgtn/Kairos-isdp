import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { realtimeDataService } from '@/lib/realtime-data-service';
import { APIService } from '@/lib/api';
import { 
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Clock,
  Star,
  BarChart3,
  PieChart,
  Download,
  Share,
  Filter,
  Calendar,
  Database,
  Brain,
  Shield,
  Globe,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';

export const ComprehensiveReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [aiMetrics, setAIMetrics] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [projectsData, reportDataResult, aiMetricsData, statsData] = await Promise.all([
        APIService.getProjects(),
        realtimeDataService.generateRealtimeReportData(),
        realtimeDataService.generateRealtimeAIMetrics(),
        realtimeDataService.generateRealtimeDashboardStats()
      ]);

      setProjects(projectsData);
      setReportData(reportDataResult);
      setAIMetrics(aiMetricsData);
      setDashboardStats(statsData);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'csv' | 'xlsx') => {
    // Mock export functionality
    console.log(`Exporting report as ${format}`);
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Executive Reports
            </h1>
            <p className="text-slate-600 mt-1">Comprehensive business intelligence and performance reports</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTimeRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('7d')}
              >
                7 Days
              </Button>
              <Button
                variant={selectedTimeRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('30d')}
              >
                30 Days
              </Button>
              <Button
                variant={selectedTimeRange === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeRange('90d')}
              >
                90 Days
              </Button>
            </div>
            <Button variant="outline" onClick={loadReportsData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{reportData?.projectHealth?.healthy || 0}</p>
                  <p className="text-sm font-medium text-emerald-100">Healthy Projects</p>
                  <p className="text-xs text-emerald-200">On Track</p>
                </div>
                <CheckCircle className="w-10 h-10 text-emerald-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{reportData?.projectHealth?.warning || 0}</p>
                  <p className="text-sm font-medium text-amber-100">Need Attention</p>
                  <p className="text-xs text-amber-200">Warning Status</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-amber-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{reportData?.documentQuality?.excellent || 0}</p>
                  <p className="text-sm font-medium text-blue-100">Excellent Docs</p>
                  <p className="text-xs text-blue-200">High Quality</p>
                </div>
                <Star className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{Math.round(reportData?.aiPerformance?.userSatisfaction || 0)}%</p>
                  <p className="text-sm font-medium text-purple-100">Satisfaction</p>
                  <p className="text-xs text-purple-200">User Rating</p>
                </div>
                <Users className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Health Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="w-6 h-6 text-emerald-600" />
                Project Health Overview
              </CardTitle>
              <CardDescription>Strategic project portfolio health analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700">{reportData?.projectHealth?.healthy || 0}</p>
                    <p className="text-sm text-emerald-600 font-medium">Healthy</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-700">{reportData?.projectHealth?.warning || 0}</p>
                    <p className="text-sm text-amber-600 font-medium">Warning</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700">{reportData?.projectHealth?.critical || 0}</p>
                    <p className="text-sm text-red-600 font-medium">Critical</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Health Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Healthy Projects</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(reportData?.projectHealth?.healthy || 0) / Math.max(1, (reportData?.projectHealth?.healthy || 0) + (reportData?.projectHealth?.warning || 0) + (reportData?.projectHealth?.critical || 0)) * 100} 
                          className="w-24 h-2" 
                        />
                        <span className="text-sm font-medium text-emerald-600">
                          {Math.round((reportData?.projectHealth?.healthy || 0) / Math.max(1, (reportData?.projectHealth?.healthy || 0) + (reportData?.projectHealth?.warning || 0) + (reportData?.projectHealth?.critical || 0)) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Need Attention</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(reportData?.projectHealth?.warning || 0) / Math.max(1, (reportData?.projectHealth?.healthy || 0) + (reportData?.projectHealth?.warning || 0) + (reportData?.projectHealth?.critical || 0)) * 100} 
                          className="w-24 h-2" 
                        />
                        <span className="text-sm font-medium text-amber-600">
                          {Math.round((reportData?.projectHealth?.warning || 0) / Math.max(1, (reportData?.projectHealth?.healthy || 0) + (reportData?.projectHealth?.warning || 0) + (reportData?.projectHealth?.critical || 0)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                Document Quality Assessment
              </CardTitle>
              <CardDescription>AI-generated document quality analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Star className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-blue-700">{reportData?.documentQuality?.excellent || 0}</p>
                    <p className="text-xs text-blue-600">Excellent</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-700">{reportData?.documentQuality?.good || 0}</p>
                    <p className="text-xs text-green-600">Good</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-amber-700">{reportData?.documentQuality?.needsImprovement || 0}</p>
                    <p className="text-xs text-amber-600">Needs Work</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Quality Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Average Quality Score</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {Math.round(aiMetrics?.averageQualityScore || 0)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Documents</span>
                      <Badge variant="outline">
                        {dashboardStats?.totalDocuments || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">This Month</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {dashboardStats?.documentsThisMonth || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Performance Report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Performance Analysis
              </CardTitle>
              <CardDescription>Comprehensive AI model performance and utilization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">{Math.round(reportData?.aiPerformance?.generationSuccess || 0)}%</p>
                    <p className="text-sm text-purple-600 font-medium">Success Rate</p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-indigo-700">{Math.round((reportData?.aiPerformance?.averageResponseTime || 0) / 1000)}s</p>
                    <p className="text-sm text-indigo-600 font-medium">Avg Response</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">{Math.round(reportData?.aiPerformance?.userSatisfaction || 0)}%</p>
                    <p className="text-sm text-green-600 font-medium">User Satisfaction</p>
                  </div>
                </div>

                {/* Model Usage */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Model Utilization</h4>
                  <div className="space-y-3">
                    {aiMetrics?.modelUsage && Object.entries(aiMetrics.modelUsage).map(([model, data]: [string, any]) => (
                      <div key={model} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            {model === 'kimi-k2-0711-preview' ? 'Kimi Advanced Model' : 'Standard Model'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{data.count} uses</Badge>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {Math.round(data.avgQuality)}% quality
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={(data.count / (aiMetrics.totalGenerations || 1)) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-indigo-600" />
                Enterprise Metrics
              </CardTitle>
              <CardDescription>Platform health and integration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Integration Status */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Integration Health</h4>
                  <div className="space-y-2">
                    {reportData?.enterpriseMetrics?.integrationStatus && 
                      Object.entries(reportData.enterpriseMetrics.integrationStatus).map(([service, status]: [string, any]) => (
                        <div key={service} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              status === 'connected' ? 'bg-green-500' :
                              status === 'error' ? 'bg-red-500' :
                              'bg-amber-500'
                            }`} />
                            <span className="text-sm capitalize text-slate-700">{service}</span>
                          </div>
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

                {/* Export Metrics */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Export Activity</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Export Volume</span>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        {reportData?.enterpriseMetrics?.exportVolume || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Sync Health</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {Math.round(reportData?.enterpriseMetrics?.syncHealth || 0)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {dashboardStats?.recentActivity && dashboardStats.recentActivity.slice(0, 4).map((activity: any) => (
                      <div key={activity.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          activity.type === 'project_created' ? 'bg-blue-500' :
                          activity.type === 'document_generated' ? 'bg-emerald-500' :
                          'bg-purple-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 truncate">{activity.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Download className="w-6 h-6 text-indigo-600" />
              Export Reports
            </CardTitle>
            <CardDescription>Download comprehensive reports in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1"
                onClick={() => exportReport('pdf')}
              >
                <FileText className="w-6 h-6 text-red-600" />
                <span className="text-sm font-medium">PDF Report</span>
                <span className="text-xs text-slate-500">Executive summary</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1"
                onClick={() => exportReport('xlsx')}
              >
                <BarChart3 className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium">Excel Export</span>
                <span className="text-xs text-slate-500">Detailed data</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex flex-col gap-1"
                onClick={() => exportReport('csv')}
              >
                <Database className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">CSV Data</span>
                <span className="text-xs text-slate-500">Raw metrics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};