import React, { useEffect, useState } from 'react';
import { useSimpleAuthStore } from '@/store/simple-auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernProjectView } from './ModernProjectView';
import { CreateProjectDialog } from './CreateProjectDialog';
import { AIInsightsWidget } from './AIInsightsWidget';
import { APIService } from '@/lib/api';
import { 
  Plus, 
  TrendingUp,
  Target,
  Clock,
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  CheckCircle2,
  AlertCircle,
  Brain,
  Sparkles,
  Timer,
  Globe
} from 'lucide-react';
import type { MVPProject } from '@/types';

export const OverviewDashboard: React.FC = () => {
  // Safe store access with error handling
  const authStore = useSimpleAuthStore();
  const appStore = useAppStore();
  
  const user = authStore?.user;
  const projects = appStore?.projects || [];
  const selectedProject = appStore?.selectedProject;
  const isLoading = appStore?.isLoading || false;
  const error = appStore?.error;
  const setProjects = appStore?.setProjects;
  const setSelectedProject = appStore?.setSelectedProject;
  const setLoading = appStore?.setLoading;
  const setError = appStore?.setError;
  const addNotification = appStore?.addNotification;
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!setLoading || !setProjects || !setError || !user) return;
    
    try {
      setLoading(true);
      const response = await APIService.getProjects();
      setProjects(response);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    if (!setLoading || !addNotification || !user) return;
    
    try {
      setLoading(true);
      await APIService.createProject(projectData);
      addNotification({
        type: 'success',
        title: 'Success!',
        message: 'Project created successfully'
      });
      setShowCreateDialog(false);
      loadProjects(); // Refresh projects list
    } catch (err) {
      console.error('Failed to create project:', err);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create project'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (project: MVPProject) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate dashboard statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length
  };

  // Calculate additional analytics
  const analytics = {
    totalDocuments: projects.length * 2, // Mock data - average 2 documents per project
    aiGenerations: Math.floor(Math.random() * 150) + 50, // Mock data
    teamMembers: Math.floor(Math.random() * 25) + 5, // Mock data
    completionRate: projects.length > 0 ? Math.round((stats.completed / projects.length) * 100) : 0
  };

  // Recent activity mock data
  const recentActivity = [
    { action: 'Business Case generated', project: 'Enterprise CRM', time: '2 hours ago', type: 'ai' },
    { action: 'Project created', project: 'Healthcare Analytics', time: '1 day ago', type: 'project' },
    { action: 'Team member added', project: 'Supply Chain Initiative', time: '2 days ago', type: 'team' },
    { action: 'Document exported', project: 'FinTech Mobile App', time: '3 days ago', type: 'export' },
    { action: 'AI Testing completed', project: 'E-Learning Platform', time: '1 week ago', type: 'test' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'project': return <Target className="w-4 h-4 text-blue-500" />;
      case 'team': return <Users className="w-4 h-4 text-green-500" />;
      case 'export': return <FileText className="w-4 h-4 text-orange-500" />;
      case 'test': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (selectedProject) {
    return (
      <ModernProjectView 
        project={selectedProject} 
        onBack={handleBackToDashboard}
        onUpdate={loadProjects}
      />
    );
  }

  const welcomeMessage = `Welcome back${user?.email ? `, ${user.email.split('@')[0]}` : ''}!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100">
      {/* Header */}
      <div className="border-b border-orange-200 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                {welcomeMessage}
              </h1>
              <p className="text-gray-600 mt-1">
                Your strategic project overview and analytics dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowCreateDialog(true)}
                data-create-project
                className="bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white shadow-lg border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{stats.total}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2 this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Projects</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{stats.active}</p>
                  <p className="text-xs text-orange-600 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    In progress
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">AI Generations</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{analytics.aiGenerations}</p>
                  <p className="text-xs text-purple-600 mt-1 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    +24 this week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold mt-1 text-gray-900">{analytics.completionRate}%</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Above average
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Status Overview */}
          <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <PieChart className="w-5 h-5 mr-2 text-orange-500" />
                Project Status Overview
              </CardTitle>
              <CardDescription>Current status distribution of your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Active Projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-green-600">{stats.active}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Completed Projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">{stats.completed}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Draft Projects</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-orange-600">{stats.draft}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {stats.total > 0 ? Math.round((stats.draft / stats.total) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {activity.project}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access to Recent Projects */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <Timer className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Quick access to your recently worked on projects</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/projects">
                  View All Projects
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first strategic project</p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => (
                  <Card 
                    key={project._id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50 border-gray-200"
                    onClick={() => handleSelectProject(project)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 truncate flex-1">
                          {project.name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 text-xs px-2 py-1 ${
                            project.status === 'active' ? 'bg-green-100 text-green-800' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {project.problem_statement}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(project.created_at)}
                        </span>
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          {project.industry}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Widget */}
        <div className="mt-8">
          <AIInsightsWidget />
        </div>
      </div>

      {/* Create Project Dialog */}
      <CreateProjectDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};