import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  Users,
  TrendingUp,
  FileText,
  Settings,
  MoreHorizontal,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useSimpleAuthStore } from '@/store/simple-auth-store';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { APIService } from '@/lib/api';
import type { MVPProject } from '@/types';

// Status configuration for UI display
const statusConfig = {
  active: { 
    label: 'Active', 
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-blue-100 text-blue-700',
    icon: CheckCircle 
  },
  paused: { 
    label: 'Paused', 
    color: 'bg-yellow-100 text-yellow-700',
    icon: Clock 
  },
  draft: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-700',
    icon: FileText 
  }
};

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Low', color: 'bg-green-100 text-green-700' }
};

export const ProjectsManagement: React.FC = () => {
  const { user } = useSimpleAuthStore();
  const { addNotification } = useAppStore();
  
  // State
  const [projects, setProjects] = useState<MVPProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await APIService.getProjects();
      setProjects(response);
      
      console.log('Loaded projects:', response);
      
      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Projects loaded',
          message: `Loaded ${response.length} projects successfully`,
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects');
      
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load projects. Please try again.',
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<MVPProject, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please log in to create projects'
        });
      }
      return;
    }
    
    try {
      console.log('Creating project with data:', projectData);
      
      await APIService.createProject(projectData);
      
      if (addNotification) {
        addNotification({
          type: 'success',
          title: 'Success!',
          message: `Project "${projectData.name}" created successfully`,
          duration: 5000
        });
      }
      
      setShowCreateDialog(false);
      
      // Reload projects to show the new one
      await loadProjects();
      
    } catch (err) {
      console.error('Failed to create project:', err);
      
      if (addNotification) {
        addNotification({
          type: 'error',
          title: 'Failed to create project',
          message: err instanceof Error ? err.message : 'An unknown error occurred',
          duration: 5000
        });
      }
    }
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const projectStatus = project.status || 'draft'; // Default to 'draft' if status is missing
    
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.problem_statement && project.problem_statement.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || projectStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: projects.length,
    active: projects.filter(p => (p.status || 'draft') === 'active').length,
    completed: projects.filter(p => (p.status || 'draft') === 'completed').length,
    paused: projects.filter(p => (p.status || 'draft') === 'paused').length,
    draft: projects.filter(p => (p.status || 'draft') === 'draft').length
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: MVPProject['status'] | undefined) => {
    const safeStatus = status || 'draft';
    const IconComponent = statusConfig[safeStatus]?.icon || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const ProjectCard: React.FC<{ project: MVPProject }> = ({ project }) => {
    const progress = Math.floor(Math.random() * 100); // Mock progress for now
    const teamMembers = Math.floor(Math.random() * 10) + 1; // Mock team size
    const documentsCount = Math.floor(Math.random() * 20) + 1; // Mock document count
    const aiGenerationsCount = Math.floor(Math.random() * 50) + 1; // Mock AI generations
    const projectStatus = project.status || 'draft'; // Default to 'draft' if status is missing
    
    return (
      <Card className="group bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:bg-white/90">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={statusConfig[projectStatus].color}>
                {getStatusIcon(projectStatus)}
                <span className="ml-1">{statusConfig[projectStatus].label}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                High Priority
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <CardTitle className="text-lg font-semibold group-hover:text-orange-600 transition-colors">
            {project.name}
          </CardTitle>
          <p className="text-sm text-gray-600 line-clamp-2">
            {project.problem_statement || 'No description available'}
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Project Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center space-x-1 text-gray-600">
                <Users className="h-3 w-3" />
                <span>{teamMembers}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <FileText className="h-3 w-3" />
                <span>{documentsCount}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <TrendingUp className="h-3 w-3" />
                <span>{aiGenerationsCount}</span>
              </div>
            </div>

            {/* Industry and Created Date */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created: {formatDate(project.created_at)}</span>
              <Badge variant="outline" className="text-xs">
                {project.industry}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectRow: React.FC<{ project: MVPProject }> = ({ project }) => {
    const progress = Math.floor(Math.random() * 100);
    const teamMembers = Math.floor(Math.random() * 10) + 1;
    const projectStatus = project.status || 'draft'; // Default to 'draft' if status is missing
    
    return (
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {getStatusIcon(projectStatus)}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                <p className="text-xs text-gray-600 truncate">
                  {project.problem_statement || 'No description'}
                </p>
              </div>
              
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                High Priority
              </Badge>
              
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{teamMembers}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(project.created_at)}</span>
                </div>
                <div className="w-20">
                  <div className="text-xs text-gray-500 mb-1">{progress}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-yellow-400 h-1 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600">Please log in to view and manage your projects.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600">Manage your KAIROS strategic projects and track progress</p>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Paused</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects by name, description, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {filterStatus === 'all' ? 'All Status' : statusConfig[filterStatus as keyof typeof statusConfig]?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Projects
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <DropdownMenuItem key={status} onClick={() => setFilterStatus(status)}>
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                onClick={loadProjects} 
                variant="outline" 
                disabled={loading}
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Refresh
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading projects...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Projects</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={loadProjects} className="gap-2">
                <FileText className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Projects Display */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {projects.length === 0 ? 'No projects yet' : 'No projects found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Get started by creating your first strategic project.'
                    }
                  </p>
                  {(!searchTerm && filterStatus === 'all') && (
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Project
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProjects.map((project) => (
                      <ProjectRow key={project._id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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