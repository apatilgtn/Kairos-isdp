import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, User, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import { useAuthCompat } from '@/hooks/use-auth-compat';
import { useTeamStore } from '@/store/team-store';
import { APIService } from '@/lib/api';
import { MVPProject } from '@/types';

interface TeamProjectsTabProps {
  teamId: string;
}

export function TeamProjectsTab({ teamId }: TeamProjectsTabProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<MVPProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { auth } = useAppStore();
  const { canUserPerformAction } = useTeamStore();

  const canCreateProjects = auth.user ? canUserPerformAction(auth.user.uid, 'can_create_projects') : false;

  useEffect(() => {
    loadTeamProjects();
  }, [teamId]);

  const loadTeamProjects = async () => {
    try {
      setIsLoading(true);
      const teamProjects = await APIService.getTeamProjects(teamId);
      setProjects(teamProjects);
    } catch (error) {
      console.error('Failed to load team projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/dashboard', { 
      state: { openCreateDialog: true, teamId } 
    });
  };

  const handleViewProject = (project: MVPProject) => {
    navigate(`/project/${project._id}`);
  };

  const getStatusColor = (status: MVPProject['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MVPProject['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Projects</h3>
          <p className="text-sm text-gray-600">
            Collaborative MVP projects created by team members
          </p>
        </div>
        {canCreateProjects && (
          <Button onClick={handleCreateProject} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              {canCreateProjects 
                ? "Create your first team project to start collaborating on MVP development."
                : "Team projects will appear here once members start creating them."}
            </p>
            {canCreateProjects && (
              <Button onClick={handleCreateProject} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Team Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.industry}
                    </p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {project.problem_statement}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {getInitials(project._uid)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-20">
                        {project._uid}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewProject(project)}
                      className="flex-1 gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Project
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Statistics */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </div>
                <div className="text-sm text-gray-600">Total Projects</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}