import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/store/app-store';
import { useAuthCompat } from '@/hooks/use-auth-compat';
import { APIService } from '@/lib/api';
import { Team, TeamSettings } from '@/types';

interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (team: Team) => void;
}

export function CreateTeamDialog({ open, onOpenChange, onTeamCreated }: CreateTeamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [settings, setSettings] = useState<TeamSettings>({
    allow_member_invites: true,
    require_approval_for_projects: false,
    default_project_visibility: 'team' as const,
    notification_preferences: {
      project_updates: true,
      new_members: true,
      document_generation: true,
      mentions: true,
      email_notifications: false,
    },
  });

  const { auth } = useAuthCompat();
  const { addNotification } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;

    if (!formData.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Team name is required',
      });
      return;
    }

    setIsLoading(true);
    try {
      const teamData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        owner_id: auth.user.uid,
        settings,
        status: 'active' as const,
      };

      await APIService.createTeam(teamData);

      // Log team creation activity
      await APIService.logActivity({
        team_id: '', // Will be filled by the backend
        user_id: auth.user.uid,
        action_type: 'team_created',
        resource_type: 'team',
        resource_id: '',
        details: {
          user_name: auth.user.name,
          team_name: teamData.name,
        },
      });

      // Create a temporary team object for immediate UI update
      const newTeam: Team = {
        _id: Date.now().toString(),
        _uid: auth.user.uid,
        _tid: '',
        ...teamData,
        created_at: Date.now(),
      };

      onTeamCreated(newTeam);

      addNotification({
        type: 'success',
        title: 'Team Created',
        message: `${formData.name} team has been created successfully`,
      });

      // Reset form
      setFormData({ name: '', description: '' });
      setSettings({
        allow_member_invites: true,
        require_approval_for_projects: false,
        default_project_visibility: 'team',
        notification_preferences: {
          project_updates: true,
          new_members: true,
          document_generation: true,
          mentions: true,
          email_notifications: false,
        },
      });
    } catch (error) {
      console.error('Failed to create team:', error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: 'Failed to create team. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingChange = (field: keyof TeamSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof TeamSettings['notification_preferences'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Set up a new team to collaborate on MVP projects with your colleagues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter team name"
                maxLength={50}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your team's purpose and goals"
                maxLength={200}
                rows={3}
              />
            </div>
          </div>

          {/* Team Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Team Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Allow member invitations</Label>
                  <p className="text-xs text-gray-600">Members can invite others to join the team</p>
                </div>
                <Switch
                  checked={settings.allow_member_invites}
                  onCheckedChange={(checked) => handleSettingChange('allow_member_invites', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Require project approval</Label>
                  <p className="text-xs text-gray-600">New projects need admin approval</p>
                </div>
                <Switch
                  checked={settings.require_approval_for_projects}
                  onCheckedChange={(checked) => handleSettingChange('require_approval_for_projects', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900">Default Notifications</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Project updates</Label>
                <Switch
                  checked={settings.notification_preferences.project_updates}
                  onCheckedChange={(checked) => handleNotificationChange('project_updates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">New members</Label>
                <Switch
                  checked={settings.notification_preferences.new_members}
                  onCheckedChange={(checked) => handleNotificationChange('new_members', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Document generation</Label>
                <Switch
                  checked={settings.notification_preferences.document_generation}
                  onCheckedChange={(checked) => handleNotificationChange('document_generation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Email notifications</Label>
                <Switch
                  checked={settings.notification_preferences.email_notifications}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}