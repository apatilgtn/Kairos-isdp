import React, { useState } from 'react';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';
import { Team, TeamSettings } from '@/types';

interface TeamSettingsTabProps {
  team: Team;
  onTeamUpdate: (updates: Partial<Team>) => void;
}

export function TeamSettingsTab({ team, onTeamUpdate }: TeamSettingsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: team.name,
    description: team.description,
  });
  const [settings, setSettings] = useState<TeamSettings>(team.settings);

  const { auth, addNotification } = useAppStore();

  const handleSaveGeneral = async () => {
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
      const updates = {
        _uid: team._uid,
        _id: team._id,
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      await APIService.updateTeam(updates);

      // Log activity
      await APIService.logActivity({
        team_id: team._id,
        user_id: auth.user.uid,
        action_type: 'team_settings_updated',
        resource_type: 'team',
        resource_id: team._id,
        details: {
          user_name: auth.user.name,
          changes: 'General information',
        },
      });

      onTeamUpdate(updates);

      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Team information has been updated',
      });
    } catch (error) {
      console.error('Failed to update team:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update team settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!auth.user) return;

    setIsLoading(true);
    try {
      const updates = {
        _uid: team._uid,
        _id: team._id,
        settings,
      };

      await APIService.updateTeam(updates);

      // Log activity
      await APIService.logActivity({
        team_id: team._id,
        user_id: auth.user.uid,
        action_type: 'team_settings_updated',
        resource_type: 'team',
        resource_id: team._id,
        details: {
          user_name: auth.user.name,
          changes: 'Team permissions and notifications',
        },
      });

      onTeamUpdate(updates);

      addNotification({
        type: 'success',
        title: 'Settings Saved',
        message: 'Team settings have been updated',
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update team settings',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!auth.user) return;

    setIsLoading(true);
    try {
      await APIService.deleteTeam(team._uid, team._id);

      addNotification({
        type: 'success',
        title: 'Team Deleted',
        message: 'Team has been permanently deleted',
      });

      // Redirect to dashboard or teams list
      window.location.href = '/teams';
    } catch (error) {
      console.error('Failed to delete team:', error);
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete team. Please try again.',
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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Team Settings</h3>
        <p className="text-sm text-gray-600">
          Manage team information, permissions, and preferences
        </p>
      </div>

      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name *</Label>
            <Input
              id="team-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter team name"
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="team-description">Description</Label>
            <Textarea
              id="team-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your team's purpose and goals"
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveGeneral} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Allow member invitations</Label>
              <p className="text-xs text-gray-600">
                Team members can invite others to join the team
              </p>
            </div>
            <Switch
              checked={settings.allow_member_invites}
              onCheckedChange={(checked) => handleSettingChange('allow_member_invites', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Require project approval</Label>
              <p className="text-xs text-gray-600">
                New projects need admin approval before becoming active
              </p>
            </div>
            <Switch
              checked={settings.require_approval_for_projects}
              onCheckedChange={(checked) => handleSettingChange('require_approval_for_projects', checked)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <Label className="text-sm">Mentions</Label>
              <Switch
                checked={settings.notification_preferences.mentions}
                onCheckedChange={(checked) => handleNotificationChange('mentions', checked)}
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

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-red-600">Delete Team</h4>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete this team and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Team
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Delete Team
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{team.name}"? This will permanently remove:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All team members and invitations</li>
                      <li>Team activity history</li>
                      <li>Team settings and preferences</li>
                    </ul>
                    <strong className="block mt-2 text-red-600">
                      This action cannot be undone.
                    </strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteTeam}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Team'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}