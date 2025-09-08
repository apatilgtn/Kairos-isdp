import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MVPProject } from '@/types';

export const Dashboard: React.FC = () => {
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
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    // Initialize sample data if needed
    await sampleDataInitializer.initializeSampleData();
    
    // Load projects and stats
    await loadProjects();
    await loadDashboardStats();
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProjects = await APIService.getProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
      addNotification({
        type: 'error',
        title: 'Error Loading Projects',
        message: 'Could not load your projects. Please try refreshing the page.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await realtimeDataService.generateRealtimeDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>) => {
    try {
      await APIService.createProject(projectData);
      await loadProjects();
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
      case 'active': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
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
        onUpdate={loadProjects}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">KAIROS</h1>
                <p className="text-sm text-muted-foreground font-medium">Intelligent Strategic Document Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/teams')}
                className="text-purple-600 hover:text-purple-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Teams
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/test')}
                className="text-blue-600 hover:text-blue-700"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test AI
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/analytics-hub')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics Hub
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  try {
                    await sampleDataInitializer.forceSampleDataCreation();
                    await loadProjects();
                    await loadDashboardStats();
                    addNotification({
                      type: 'success',
                      title: 'Sample Data Created',
                      message: 'Sample projects and documents have been created successfully!',
                      duration: 3000
                    });
                  } catch (error) {
                    addNotification({
                      type: 'error',
                      title: 'Sample Data Failed',
                      message: 'Failed to create sample data. Please try again.',
                      duration: 5000
                    });
                  }
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Data
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-purple-600 hover:text-purple-700"
                onClick={() => {
                  // Find a project with documents to demo enterprise export
                  const projectWithDocs = projects.find(p => p._id);
                  if (projectWithDocs) {
                    setSelectedProject(projectWithDocs);
                    // Navigate to project view - the enterprise tab will be available there
                  }
                }}
              >
                <Database className="w-4 h-4 mr-2" />
                Enterprise
              </Button>
              <CollaborationNotifications />
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Enhanced Realtime Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-700">
                    {loadingStats ? '...' : (dashboardStats?.totalProjects || projects.length)}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">Total Projects</p>
                  {dashboardStats?.recentActivity && (
                    <p className="text-xs text-blue-500 mt-1">
                      {dashboardStats.recentActivity.filter(a => a.type === 'project_created').length} this month
                    </p>
                  )}
                </div>
                <Target className="w-8 h-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-emerald-700">
                    {loadingStats ? '...' : (dashboardStats?.activeProjects || projects.filter(p => p.status === 'active').length)}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">Active Projects</p>
                  <p className="text-xs text-emerald-500 mt-1">In development</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {loadingStats ? '...' : (dashboardStats?.totalDocuments || 0)}
                  </p>
                  <p className="text-xs text-purple-600 font-medium">AI Documents</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {loadingStats ? '...' : (dashboardStats?.documentsThisWeek || 0)} this week
                  </p>
                </div>
                <FileText className="w-8 h-8 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-700">
                    {loadingStats ? '...' : (dashboardStats?.completedProjects || projects.filter(p => p.status === 'completed').length)}
                  </p>
                  <p className="text-xs text-amber-600 font-medium">Completed</p>
                  <p className="text-xs text-amber-500 mt-1">Successfully delivered</p>
                </div>
                <BookOpen className="w-8 h-8 text-amber-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Realtime Activity Feed */}
        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-slate-50 to-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across your strategic projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/80 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'project_created' ? 'bg-blue-500' :
                        activity.type === 'document_generated' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        {activity.projectName && (
                          <p className="text-xs text-gray-500">{activity.projectName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">Strategic Projects</h2>
              <p className="text-muted-foreground">
                Enterprise-grade strategic planning and documentation with AI assistance
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="btn-enterprise">
              <Plus className="w-4 h-4 mr-2" />
              New Strategic Project
            </Button>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={loadProjects}
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first MVP project and let AI help you build a comprehensive roadmap.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card 
                  key={project._id} 
                  className="card-enterprise cursor-pointer group border-l-4 border-l-primary/20 hover:border-l-primary hover:shadow-xl transition-all duration-300"
                  onClick={() => handleSelectProject(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {project.industry}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(project.status)}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.problem_statement}
                    </p>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {formatDate(project.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Updated {formatDate(project.updated_at)}</span>
                        </div>
                      </div>
                      
                      {/* Show active collaborators for the first document in the project */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Active Collaborators
                        </div>
                        <ActiveCollaborators 
                          documentId={project._id} 
                          maxShow={2} 
                          size="sm" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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