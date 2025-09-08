import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ProjectView } from './ProjectView';
import { CreateProjectDialog } from './CreateProjectDialog';
import { CollaborationNotifications } from './CollaborationNotifications';
import { ActiveCollaborators } from './ActiveCollaborators';
import { APIService } from '@/lib/api';
import { realtimeDataService } from '@/lib/realtime-data-service';
import { sampleDataInitializer } from '@/lib/sample-data-initializer';
import { 
  Plus, 
  FolderOpen, 
  Calendar, 
  TrendingUp, 
  LogOut,
  Settings,
  Sparkles,
  Target,
  BookOpen,
  Lightbulb,
  TestTube,
  Users,
  Database,
  FileText,
  Activity,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Brain,
  Globe,
  Shield,
  Rocket,
  Star,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MVPProject } from '@/types';

export const EnhancedDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { 
    projects, 
    selectedProject, 
    isLoading, 
    error,
    setProjects, 
    setSelectedProject, 
    setLoading, 
    setError,
    addNotification 
  } = useAppStore();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [aiMetrics, setAIMetrics] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    initializeEnhancedDashboard();
  }, []);

  const initializeEnhancedDashboard = async () => {
    setLoadingStats(true);
    try {
      // Initialize sample data if needed
      await sampleDataInitializer.initializeSampleData();
      
      // Load all dashboard data in parallel
      const [projectsData, statsData, metricsData, reportDataResult] = await Promise.all([
        loadProjects(),
        realtimeDataService.generateRealtimeDashboardStats(),
        realtimeDataService.generateRealtimeAIMetrics(),
        realtimeDataService.generateRealtimeReportData()
      ]);

      setDashboardStats(statsData);
      setAIMetrics(metricsData);
      setReportData(reportDataResult);
    } catch (error) {
      console.error('Failed to initialize enhanced dashboard:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProjects = await APIService.getProjects();
      setProjects(userProjects);
      return userProjects;
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
      addNotification({
        type: 'error',
        title: 'Error Loading Projects',
        message: 'Could not load your projects. Please try refreshing the page.',
        duration: 5000
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>) => {
    try {
      await APIService.createProject(projectData);
      await initializeEnhancedDashboard(); // Refresh all data
      addNotification({
        type: 'success',
        title: 'Project Created',
        message: `${projectData.name} has been created successfully!`,
        duration: 3000
      });
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      addNotification({
        type: 'error',
        title: 'Error Creating Project',
        message: 'Could not create the project. Please try again.',
        duration: 5000
      });
    }
  };

  const handleSelectProject = (project: MVPProject) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      addNotification({
        type: 'success',
        title: 'Logged Out',
        message: 'Successfully logged out. See you next time!',
        duration: 3000
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusColor = (status: MVPProject['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (selectedProject) {
    return (
      <ProjectView 
        project={selectedProject} 
        onBack={handleBackToDashboard}
        onUpdate={initializeEnhancedDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      {/* Executive Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  KAIROS
                </h1>
                <p className="text-sm text-slate-600 font-semibold">Strategic Intelligence Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/teams')}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/analytics-hub')}
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics Hub
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  try {
                    await sampleDataInitializer.forceSampleDataCreation();
                    await initializeEnhancedDashboard();
                    addNotification({
                      type: 'success',
                      title: 'Sample Data Generated',
                      message: 'Sample projects and analytics data created successfully!',
                      duration: 3000
                    });
                  } catch (error) {
                    addNotification({
                      type: 'error',
                      title: 'Generation Failed',
                      message: 'Failed to generate sample data. Please try again.',
                      duration: 5000
                    });
                  }
                }}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Generate Data
              </Button>
              <CollaborationNotifications />
              <Button variant="ghost" size="sm" className="hover:bg-slate-100">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-red-50 text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {loadingStats ? '...' : (dashboardStats?.totalProjects || projects.length)}
                  </p>
                  <p className="text-sm font-medium text-blue-100">Strategic Projects</p>
                  <p className="text-xs text-blue-200 mt-1">Enterprise Portfolio</p>
                </div>
                <Target className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {loadingStats ? '...' : (dashboardStats?.activeProjects || projects.filter(p => p.status === 'active').length)}
                  </p>
                  <p className="text-sm font-medium text-emerald-100">Active Initiatives</p>
                  <p className="text-xs text-emerald-200 mt-1">In Development</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {loadingStats ? '...' : (aiMetrics?.totalGenerations || 0)}
                  </p>
                  <p className="text-sm font-medium text-purple-100">AI Documents</p>
                  <p className="text-xs text-purple-200 mt-1">Generated This Month</p>
                </div>
                <Brain className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">
                    {loadingStats ? '...' : Math.round(aiMetrics?.averageQualityScore || 0)}%
                  </p>
                  <p className="text-sm font-medium text-amber-100">Quality Score</p>
                  <p className="text-xs text-amber-200 mt-1">AI Performance</p>
                </div>
                <Star className="w-10 h-10 text-amber-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Performance Analytics */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Intelligence Analytics
              </CardTitle>
              <CardDescription>Real-time AI model performance and document generation insights</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Model Performance */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-slate-700">Model Performance</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {Math.round(aiMetrics?.successRate || 0)}% Success Rate
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {aiMetrics?.modelUsage && Object.entries(aiMetrics.modelUsage).map(([model, data]: [string, any]) => (
                        <div key={model} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">
                              {model === 'kimi-k2-0711-preview' ? 'Kimi Advanced' : 'Standard Model'}
                            </span>
                            <span className="text-slate-500">{data.count} generations</span>
                          </div>
                          <Progress 
                            value={(data.count / (aiMetrics.totalGenerations || 1)) * 100} 
                            className="h-2" 
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Quality: {Math.round(data.avgQuality)}%</span>
                            <span>Avg Time: {Math.round(data.avgTime/1000)}s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Document Types */}
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3">Document Distribution</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {aiMetrics?.documentTypeDistribution && Object.entries(aiMetrics.documentTypeDistribution).map(([type, count]: [string, any]) => (
                        <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <span className="text-sm font-medium capitalize text-slate-600">
                            {type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Shield className="w-6 h-6 text-emerald-600" />
                System Health
              </CardTitle>
              <CardDescription>Enterprise platform status and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Project Health */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Project Health</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Healthy: {reportData?.projectHealth?.healthy || 0}</span>
                        <span className="text-amber-600">Warning: {reportData?.projectHealth?.warning || 0}</span>
                        <span className="text-red-600">Critical: {reportData?.projectHealth?.critical || 0}</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>

                  {/* AI Performance */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">AI Generation</span>
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-medium text-green-600">
                          {Math.round(reportData?.aiPerformance?.generationSuccess || 0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Response</span>
                        <span className="font-medium text-blue-600">
                          {Math.round((reportData?.aiPerformance?.averageResponseTime || 0) / 1000)}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Integration */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-600">Enterprise Integration</span>
                      <Globe className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="space-y-1">
                      {reportData?.enterpriseMetrics?.integrationStatus && 
                        Object.entries(reportData.enterpriseMetrics.integrationStatus).map(([service, status]: [string, any]) => (
                          <div key={service} className="flex justify-between items-center text-xs">
                            <span className="capitalize text-slate-600">{service}</span>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Feed */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Activity className="w-6 h-6 text-indigo-600" />
                Strategic Activity Feed
              </CardTitle>
              <CardDescription>Real-time updates across your enterprise portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
                  dashboardStats.recentActivity.slice(0, 8).map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-100">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'project_created' ? 'bg-blue-500' :
                        activity.type === 'document_generated' ? 'bg-emerald-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{activity.message}</p>
                        {activity.projectName && (
                          <p className="text-xs text-slate-500 truncate">Project: {activity.projectName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Create a project to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent Projects */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Rocket className="w-6 h-6 text-emerald-600" />
                Strategic Projects
              </CardTitle>
              <CardDescription>Your recent strategic initiatives and quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Quick Create Button */}
                <Button 
                  onClick={() => setShowCreateDialog(true)} 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Strategic Project
                </Button>

                <Separator />

                {/* Recent Projects */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Recent Projects</h4>
                  {projects.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">
                      <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No projects yet</p>
                      <p className="text-xs">Create your first strategic project</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {projects.slice(0, 4).map((project) => (
                        <div 
                          key={project._id} 
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors"
                          onClick={() => handleSelectProject(project)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{project.name}</p>
                            <p className="text-xs text-slate-500 truncate">{project.industry}</p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={getStatusColor(project.status)}
                          >
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate('/analytics-hub')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-indigo-600" />
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Analytics</Badge>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Analytics Hub</h3>
              <p className="text-sm text-slate-600">Comprehensive AI performance analytics and business intelligence insights</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate('/teams')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Collaboration</Badge>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Team Management</h3>
              <p className="text-sm text-slate-600">Enterprise team collaboration and project management capabilities</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">Enterprise</Badge>
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Enterprise Integration</h3>
              <p className="text-sm text-slate-600">Advanced security, compliance, and enterprise system integration</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};