import React from 'react';
import { Calendar, Users, FileText, Settings, Plus, UserPlus, UserMinus, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TeamActivity, ActivityType } from '@/types';

interface TeamActivityTabProps {
  activities: TeamActivity[];
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  project_created: Plus,
  project_updated: FileText,
  project_deleted: FileText,
  document_generated: FileText,
  document_updated: FileText,
  member_invited: UserPlus,
  member_joined: UserPlus,
  member_left: UserMinus,
  member_role_changed: Crown,
  team_settings_updated: Settings,
  team_created: Users,
};

const activityColors: Record<ActivityType, string> = {
  project_created: 'bg-green-100 text-green-800',
  project_updated: 'bg-blue-100 text-blue-800',
  project_deleted: 'bg-red-100 text-red-800',
  document_generated: 'bg-purple-100 text-purple-800',
  document_updated: 'bg-purple-100 text-purple-800',
  member_invited: 'bg-yellow-100 text-yellow-800',
  member_joined: 'bg-green-100 text-green-800',
  member_left: 'bg-red-100 text-red-800',
  member_role_changed: 'bg-blue-100 text-blue-800',
  team_settings_updated: 'bg-gray-100 text-gray-800',
  team_created: 'bg-green-100 text-green-800',
};

const activityLabels: Record<ActivityType, string> = {
  project_created: 'Created Project',
  project_updated: 'Updated Project',
  project_deleted: 'Deleted Project',
  document_generated: 'Generated Document',
  document_updated: 'Updated Document',
  member_invited: 'Invited Member',
  member_joined: 'Joined Team',
  member_left: 'Left Team',
  member_role_changed: 'Role Changed',
  team_settings_updated: 'Updated Settings',
  team_created: 'Created Team',
};

export function TeamActivityTab({ activities }: TeamActivityTabProps) {
  const getInitials = (userId: string) => {
    return userId.substring(0, 2).toUpperCase();
  };

  const formatActivityMessage = (activity: TeamActivity) => {
    const { action_type, details } = activity;
    const userName = details.user_name || activity.user_id;

    switch (action_type) {
      case 'project_created':
        return `${userName} created project "${details.project_name || 'Untitled'}"`;
      case 'project_updated':
        return `${userName} updated project "${details.project_name || 'Untitled'}"`;
      case 'project_deleted':
        return `${userName} deleted project "${details.project_name || 'Untitled'}"`;
      case 'document_generated':
        return `${userName} generated ${details.document_type || 'document'} for "${details.project_name || 'project'}"`;
      case 'document_updated':
        return `${userName} updated ${details.document_type || 'document'} for "${details.project_name || 'project'}"`;
      case 'member_invited':
        return `${userName} invited ${details.invited_email || 'someone'} to join as ${details.role || 'member'}`;
      case 'member_joined':
        return `${userName} joined the team`;
      case 'member_left':
        return `${userName} left the team`;
      case 'member_role_changed':
        return `${userName} changed role from ${details.old_role || 'unknown'} to ${details.new_role || 'unknown'}`;
      case 'team_settings_updated':
        return `${userName} updated team settings`;
      case 'team_created':
        return `${userName} created the team`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-600 text-center max-w-md">
            Team activity will appear here as members create projects, generate documents, and collaborate.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
        <p className="text-sm text-gray-600">
          Track team collaboration and project updates
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.action_type];
              
              return (
                <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={activityColors[activity.action_type]}>
                          <Icon className="h-3 w-3 mr-1" />
                          {activityLabels[activity.action_type]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900">
                        {formatActivityMessage(activity)}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}