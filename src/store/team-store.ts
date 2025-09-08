import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Team, TeamMember, TeamInvitation, TeamActivity, TeamRole, TeamPermissions } from '@/types';

interface TeamStore {
  // Current team state
  currentTeam: Team | null;
  teams: Team[];
  teamMembers: TeamMember[];
  invitations: TeamInvitation[];
  activities: TeamActivity[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentTeam: (team: Team | null) => void;
  setTeams: (teams: Team[]) => void;
  setTeamMembers: (members: TeamMember[]) => void;
  setInvitations: (invitations: TeamInvitation[]) => void;
  setActivities: (activities: TeamActivity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Team management
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  
  // Member management
  addMember: (member: TeamMember) => void;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  removeMember: (memberId: string) => void;
  
  // Invitation management
  addInvitation: (invitation: TeamInvitation) => void;
  updateInvitation: (invitationId: string, updates: Partial<TeamInvitation>) => void;
  removeInvitation: (invitationId: string) => void;
  
  // Activity tracking
  addActivity: (activity: TeamActivity) => void;
  
  // Permission helpers
  canUserPerformAction: (userId: string, action: keyof TeamPermissions) => boolean;
  getUserRole: (userId: string) => TeamRole | null;
  isTeamOwner: (userId: string) => boolean;
  isTeamAdmin: (userId: string) => boolean;
  
  // Clear state
  clearTeamData: () => void;
}

const defaultPermissions: Record<TeamRole, TeamPermissions> = {
  owner: {
    can_create_projects: true,
    can_edit_projects: true,
    can_delete_projects: true,
    can_invite_members: true,
    can_manage_members: true,
    can_manage_team_settings: true,
    can_export_documents: true,
    can_generate_documents: true,
  },
  admin: {
    can_create_projects: true,
    can_edit_projects: true,
    can_delete_projects: true,
    can_invite_members: true,
    can_manage_members: true,
    can_manage_team_settings: false,
    can_export_documents: true,
    can_generate_documents: true,
  },
  member: {
    can_create_projects: true,
    can_edit_projects: true,
    can_delete_projects: false,
    can_invite_members: false,
    can_manage_members: false,
    can_manage_team_settings: false,
    can_export_documents: true,
    can_generate_documents: true,
  },
  viewer: {
    can_create_projects: false,
    can_edit_projects: false,
    can_delete_projects: false,
    can_invite_members: false,
    can_manage_members: false,
    can_manage_team_settings: false,
    can_export_documents: true,
    can_generate_documents: false,
  },
};

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTeam: null,
      teams: [],
      teamMembers: [],
      invitations: [],
      activities: [],
      isLoading: false,
      error: null,
      
      // Basic setters
      setCurrentTeam: (team) => set({ currentTeam: team }),
      setTeams: (teams) => set({ teams }),
      setTeamMembers: (teamMembers) => set({ teamMembers }),
      setInvitations: (invitations) => set({ invitations }),
      setActivities: (activities) => set({ activities }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Team management
      addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
      updateTeam: (teamId, updates) => set((state) => ({
        teams: state.teams.map(team => 
          team._id === teamId ? { ...team, ...updates } : team
        ),
        currentTeam: state.currentTeam?._id === teamId 
          ? { ...state.currentTeam, ...updates } 
          : state.currentTeam
      })),
      removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter(team => team._id !== teamId),
        currentTeam: state.currentTeam?._id === teamId ? null : state.currentTeam
      })),
      
      // Member management
      addMember: (member) => set((state) => ({ 
        teamMembers: [...state.teamMembers, member] 
      })),
      updateMember: (memberId, updates) => set((state) => ({
        teamMembers: state.teamMembers.map(member => 
          member._id === memberId ? { ...member, ...updates } : member
        )
      })),
      removeMember: (memberId) => set((state) => ({
        teamMembers: state.teamMembers.filter(member => member._id !== memberId)
      })),
      
      // Invitation management
      addInvitation: (invitation) => set((state) => ({ 
        invitations: [...state.invitations, invitation] 
      })),
      updateInvitation: (invitationId, updates) => set((state) => ({
        invitations: state.invitations.map(invitation => 
          invitation._id === invitationId ? { ...invitation, ...updates } : invitation
        )
      })),
      removeInvitation: (invitationId) => set((state) => ({
        invitations: state.invitations.filter(invitation => invitation._id !== invitationId)
      })),
      
      // Activity tracking
      addActivity: (activity) => set((state) => ({ 
        activities: [activity, ...state.activities].slice(0, 100) // Keep last 100 activities
      })),
      
      // Permission helpers
      canUserPerformAction: (userId, action) => {
        const state = get();
        if (!state.currentTeam) return false;
        
        const member = state.teamMembers.find(m => 
          m.user_id === userId && m.team_id === state.currentTeam!._id && m.status === 'active'
        );
        
        if (!member) return false;
        
        // Use custom permissions if available, otherwise use default role permissions
        const permissions = member.permissions || defaultPermissions[member.role];
        return permissions[action];
      },
      
      getUserRole: (userId) => {
        const state = get();
        if (!state.currentTeam) return null;
        
        const member = state.teamMembers.find(m => 
          m.user_id === userId && m.team_id === state.currentTeam!._id && m.status === 'active'
        );
        
        return member?.role || null;
      },
      
      isTeamOwner: (userId) => {
        const state = get();
        return state.currentTeam?.owner_id === userId;
      },
      
      isTeamAdmin: (userId) => {
        const role = get().getUserRole(userId);
        return role === 'owner' || role === 'admin';
      },
      
      // Clear state
      clearTeamData: () => set({
        currentTeam: null,
        teams: [],
        teamMembers: [],
        invitations: [],
        activities: [],
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'team-store',
      partialize: (state) => ({
        currentTeam: state.currentTeam,
        teams: state.teams,
      }),
    }
  )
);

export { defaultPermissions };