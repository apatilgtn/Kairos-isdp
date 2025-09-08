import React, { useEffect, useState } from 'react';
import { useSimpleAuthStore } from '@/store/simple-auth-store';
import { useAppStore } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ModernProjectView } from './ModernProjectView';
import { CreateProjectDialog } from './CreateProjectDialog';
import { AIInsightsWidget } from './AIInsightsWidget';
import { APIService } from '@/lib/api';
import { 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Users,
  FileText,
  Activity,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import type { MVPProject } from '@/types';

export const ModernDashboard: React.FC = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'draft'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!setLoading || !setError || !setProjects) {
      console.warn('Store methods not available, skipping loadProjects');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const userProjects = await APIService.getProjects();
      setProjects(userProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects');
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Error Loading Projects',
          message: 'Could not load your projects. Please try refreshing the page.',
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: MVPProject['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.problem_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    draft: projects.filter(p => p.status === 'draft').length
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      {/* Header */}
      <div className="border-b border-orange-200 bg-gradient-to-r from-yellow-50/80 to-green-50/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                {welcomeMessage}
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your strategic projects and AI-powered documentation
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden border-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Projects</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-600 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Projects</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-orange-500 mr-1" />
                <span className="text-orange-600 font-medium">+8%</span>
                <span className="text-gray-600 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-yellow-200 bg-gradient-to-br from-yellow-50 to-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Completed</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+15%</span>
                <span className="text-gray-600 ml-1">completion rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">AI Generations</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800">247</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">+23%</span>
                <span className="text-gray-600 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects by name, industry, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('draft')}
            >
              Draft
            </Button>
          </div>
        </div>

        {/* AI Insights Widget */}
        {projects.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <AIInsightsWidget 
                  onViewFullAnalytics={() => {
                    // Navigate to a project with AI analytics tab
                    if (projects.length > 0) {
                      setSelectedProject(projects[0]);
                    }
                  }}
                />
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest project updates and AI generations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projects.slice(0, 3).map((project, index) => (
                        <div key={project._id} className="flex items-center gap-3 p-2 rounded border">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated {formatDate(project.updated_at || project.created_at)}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
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
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-1/3 mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-yellow-50 to-green-50 border-orange-200">
            <CardContent>
              <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {projects.length === 0 ? 'No projects yet' : 'No projects found'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {projects.length === 0 
                  ? 'Start by creating your first strategic project and let AI help you build comprehensive documentation.'
                  : 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                }
              </p>
              {projects.length === 0 && (
                <Button onClick={() => setShowCreateDialog(true)} size="lg" className="bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-white border-0 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card 
                key={project._id} 
                className="group cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-l-4 border-l-orange-300 hover:border-l-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200"
                onClick={() => handleSelectProject(project)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-green-600">
                        {project.industry}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(project.status)}
                      >
                        {project.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle more options
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {project.problem_statement}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(project.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated {formatDate(project.updated_at)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>2 collaborators</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>5 documents</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};