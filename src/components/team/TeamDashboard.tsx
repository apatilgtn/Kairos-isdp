import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Settings, Activity, Crown, Shield, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamStore } from '@/store/team-store';
import { useAppStore } from '@/store/app-store';
import { useAuthCompat } from '@/hooks/use-auth-compat';
import { APIService } from '@/lib/api';
import { Team, TeamMember, TeamActivity } from '@/types';
import { CreateTeamDialog } from './CreateTeamDialog';
import { TeamMembersTab } from './TeamMembersTab';
import { TeamActivityTab } from './TeamActivityTab';
import { TeamSettingsTab } from './TeamSettingsTab';
import { TeamProjectsTab } from './TeamProjectsTab';

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export function TeamDashboard() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [isLoading, setIsLoading] = useState(true);
  
  const { auth } = useAuthCompat();
  const { addNotification } = useAppStore();
  const {
    teams,
    currentTeam,
    teamMembers,
    activities,
    setTeams,
    setCurrentTeam,
    setTeamMembers,
    setActivities,
    getUserRole,
    isTeamOwner,
    canUserPerformAction
  } = useTeamStore();

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      loadTeamData();
    }
  }, [currentTeam]);

  const loadTeams = async () => {
    if (!auth.user) return;
    
    try {
      setIsLoading(true);
      
      // Get teams where user is owner
      const ownedTeams = await APIService.getTeamsByOwner(auth.user.uid);
      
      // Get teams where user is a member
      const memberships = await APIService.getUserTeams(auth.user.uid);
      const memberTeamIds = memberships.map(m => m.team_id);
      
      // Get all teams (we'll filter to just the ones user is part of)
      const allTeams = await APIService.getTeams();
      const memberTeams = allTeams.filter(team => 
        memberTeamIds.includes(team._id) && !ownedTeams.find(ot => ot._id === team._id)
      );
      
      const userTeams = [...ownedTeams, ...memberTeams];
      setTeams(userTeams);
      
      if (userTeams.length > 0 && !currentTeam) {
        setCurrentTeam(userTeams[0]);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamData = async () => {
    if (!currentTeam) return;
    
    try {
      const [members, teamActivities] = await Promise.all([
        APIService.getTeamMembers(currentTeam._id),
        APIService.getTeamActivities(currentTeam._id, 20)
      ]);
      
      setTeamMembers(members);
      setActivities(teamActivities);
    } catch (error) {
      console.error('Failed to load team data:', error);
    }
  };

  const handleTeamSelect = (team: Team) => {
    setCurrentTeam(team);
    setActiveTab('projects');
  };

  const handleCreateTeam = () => {
    setShowCreateDialog(true);
  };

  const handleTeamCreated = (team: Team) => {
    setTeams([team, ...teams]);
    setCurrentTeam(team);
    setShowCreateDialog(false);
  };

  const currentUserRole = auth.user ? getUserRole(auth.user.uid) : null;
  const isOwner = auth.user ? isTeamOwner(auth.user.uid) : false;
  const canManageTeam = auth.user ? canUserPerformAction(auth.user.uid, 'can_manage_team_settings') : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-600 mt-1">
            Manage your teams and collaborate on MVP projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Projects
          </Button>
          <Button onClick={handleCreateTeam} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teams Yet</h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Create your first team to start collaborating on MVP projects with your colleagues.
            </p>
            <Button onClick={handleCreateTeam} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Team Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {teams.map((team) => {
                  const teamMemberCount = teamMembers.filter(m => m.team_id === team._id && m.status === 'active').length;
                  const userRoleInTeam = getUserRole(auth.user?.uid || '');
                  const RoleIcon = roleIcons[userRoleInTeam || 'viewer'];
                  
                  return (
                    <div
                      key={team._id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentTeam?._id === team._id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTeamSelect(team)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{team.name}</h4>
                        <Badge className={roleColors[userRoleInTeam || 'viewer']}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {userRoleInTeam}
                        </Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {teamMemberCount} member{teamMemberCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Team Content */}
          <div className="lg:col-span-3">
            {currentTeam ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{currentTeam.name}</CardTitle>
                      <p className="text-gray-600 mt-1">{currentTeam.description}</p>
                    </div>
                    {canManageTeam && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="projects">Projects</TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                      <TabsTrigger value="activity">Activity</TabsTrigger>
                      {canManageTeam && <TabsTrigger value="settings">Settings</TabsTrigger>}
                    </TabsList>
                    
                    <TabsContent value="projects" className="mt-6">
                      <TeamProjectsTab teamId={currentTeam._id} />
                    </TabsContent>
                    
                    <TabsContent value="members" className="mt-6">
                      <TeamMembersTab 
                        teamId={currentTeam._id}
                        members={teamMembers.filter(m => m.team_id === currentTeam._id)}
                        onMembersUpdate={loadTeamData}
                      />
                    </TabsContent>
                    
                    <TabsContent value="activity" className="mt-6">
                      <TeamActivityTab 
                        activities={activities.filter(a => a.team_id === currentTeam._id)} 
                      />
                    </TabsContent>
                    
                    {canManageTeam && (
                      <TabsContent value="settings" className="mt-6">
                        <TeamSettingsTab 
                          team={currentTeam}
                          onTeamUpdate={(updates) => {
                            const updatedTeam = { ...currentTeam, ...updates };
                            setCurrentTeam(updatedTeam);
                            setTeams(teams.map(t => t._id === currentTeam._id ? updatedTeam : t));
                          }}
                        />
                      </TabsContent>
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Team</h3>
                    <p className="text-gray-600">Choose a team from the sidebar to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <CreateTeamDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTeamCreated={handleTeamCreated}
      />
    </div>
  );
}