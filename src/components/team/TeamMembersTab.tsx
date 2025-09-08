import React, { useState, useEffect } from 'react';
import { Plus, Mail, Crown, Shield, User, Eye, MoreHorizontal, Trash2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAppStore } from '@/store/app-store';
import { useAuthCompat } from '@/hooks/use-auth-compat';
import { useTeamStore } from '@/store/team-store';
import { APIService } from '@/lib/api';
import { TeamMember, TeamInvitation, TeamRole } from '@/types';
import { InviteMemberDialog } from './InviteMemberDialog';

interface TeamMembersTabProps {
  teamId: string;
  members: TeamMember[];
  onMembersUpdate: () => void;
}

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

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

export function TeamMembersTab({ teamId, members, onMembersUpdate }: TeamMembersTabProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { auth } = useAuthCompat();
  const { addNotification } = useAppStore();
  const { canUserPerformAction, isTeamOwner, getUserRole } = useTeamStore();

  const canInviteMembers = auth.user ? canUserPerformAction(auth.user.uid, 'can_invite_members') : false;
  const canManageMembers = auth.user ? canUserPerformAction(auth.user.uid, 'can_manage_members') : false;
  const isOwner = auth.user ? isTeamOwner(auth.user.uid) : false;
  const currentUserRole = auth.user ? getUserRole(auth.user.uid) : null;

  useEffect(() => {
    loadInvitations();
  }, [teamId]);

  const loadInvitations = async () => {
    try {
      const teamInvitations = await APIService.getTeamInvitations(teamId);
      setInvitations(teamInvitations.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    if (!auth.user) return;

    try {
      setIsLoading(true);
      const member = members.find(m => m._id === memberId);
      if (!member) return;

      await APIService.updateTeamMember({
        _uid: member._uid,
        _id: member._id,
        role: newRole,
      });

      // Log activity
      await APIService.logActivity({
        team_id: teamId,
        user_id: auth.user.uid,
        action_type: 'member_role_changed',
        resource_type: 'member',
        resource_id: memberId,
        details: {
          user_name: auth.user.name,
          old_role: member.role,
          new_role: newRole,
        },
      });

      addNotification({
        type: 'success',
        title: 'Role Updated',
        message: `Member role changed to ${roleLabels[newRole]}`,
      });

      onMembersUpdate();
    } catch (error) {
      console.error('Failed to update role:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update member role',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!auth.user) return;
    if (!confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      setIsLoading(true);
      const member = members.find(m => m._id === memberId);
      if (!member) return;

      await APIService.removeTeamMember(member._uid, member._id);

      // Log activity
      await APIService.logActivity({
        team_id: teamId,
        user_id: auth.user.uid,
        action_type: 'member_left',
        resource_type: 'member',
        resource_id: memberId,
        details: {
          user_name: auth.user.name,
        },
      });

      addNotification({
        type: 'success',
        title: 'Member Removed',
        message: 'Member has been removed from the team',
      });

      onMembersUpdate();
    } catch (error) {
      console.error('Failed to remove member:', error);
      addNotification({
        type: 'error',
        title: 'Removal Failed',
        message: 'Failed to remove member from team',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!auth.user) return;

    try {
      const invitation = invitations.find(inv => inv._id === invitationId);
      if (!invitation) return;

      await APIService.updateInvitation({
        _uid: invitation._uid,
        _id: invitation._id,
        status: 'revoked',
      });

      addNotification({
        type: 'success',
        title: 'Invitation Revoked',
        message: 'Team invitation has been cancelled',
      });

      loadInvitations();
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      addNotification({
        type: 'error',
        title: 'Revocation Failed',
        message: 'Failed to revoke invitation',
      });
    }
  };

  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const canModifyMember = (member: TeamMember) => {
    if (!auth.user || !currentUserRole) return false;
    if (member.user_id === auth.user.uid) return false; // Can't modify self
    if (member.role === 'owner') return false; // Can't modify owner
    
    // Only owners can modify admins
    if (member.role === 'admin' && currentUserRole !== 'owner') return false;
    
    return canManageMembers;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-gray-600">
            Manage team members and their permissions
          </p>
        </div>
        {canInviteMembers && (
          <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              const isCurrentUser = member.user_id === auth.user?.uid;
              
              return (
                <div key={member._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm">
                        {getInitials(member.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.user_id}
                          {isCurrentUser && <span className="text-sm text-gray-500">(You)</span>}
                        </span>
                        <Badge className={roleColors[member.role]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleLabels[member.role]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {!isCurrentUser && canModifyMember(member) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentUserRole === 'owner' && member.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'admin')}>
                            <Shield className="h-4 w-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {currentUserRole === 'owner' && member.role === 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'member')}>
                            <User className="h-4 w-4 mr-2" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        {(member.role === 'member' || member.role === 'viewer') && (
                          <>
                            {member.role !== 'viewer' && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'viewer')}>
                                <Eye className="h-4 w-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'member' && (
                              <DropdownMenuItem onClick={() => handleRoleChange(member._id, 'member')}>
                                <User className="h-4 w-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-600"
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invitations ({invitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const RoleIcon = roleIcons[invitation.role];
                
                return (
                  <div key={invitation._id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-gray-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{invitation.email}</span>
                          <Badge className={roleColors[invitation.role]}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleLabels[invitation.role]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Invited {new Date(invitation.invited_at).toLocaleDateString()} • 
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {canManageMembers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInvitation(invitation._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        teamId={teamId}
        onInvitationSent={() => {
          loadInvitations();
          setShowInviteDialog(false);
        }}
      />
    </div>
  );
}