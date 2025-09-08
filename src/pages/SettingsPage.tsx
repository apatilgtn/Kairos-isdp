import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  Zap,
  Key,
  Mail
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and platform configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <div className="text-sm text-muted-foreground">John Doe</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="text-sm text-muted-foreground">john@company.com</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Badge variant="default">Enterprise</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Email Notifications</label>
                <div className="text-xs text-muted-foreground">Receive email alerts</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Project Updates</label>
                <div className="text-xs text-muted-foreground">Team collaboration alerts</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">AI Generation</label>
                <div className="text-xs text-muted-foreground">AI completion notifications</div>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Two-Factor Authentication</label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Enabled</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Keys</label>
              <Button variant="outline" size="sm" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Manage Keys
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Timeout</label>
              <div className="text-sm text-muted-foreground">30 minutes</div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>
              Customize your platform experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Dark Mode</label>
                <div className="text-xs text-muted-foreground">Toggle theme</div>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <div className="text-sm text-muted-foreground">English (US)</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <div className="text-sm text-muted-foreground">UTC-8 (PST)</div>
            </div>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Settings</span>
            </CardTitle>
            <CardDescription>
              Configure AI generation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Model</label>
              <div className="text-sm text-muted-foreground">GPT-4 Turbo</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Generation Quality</label>
              <div className="text-sm text-muted-foreground">High</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Auto-save Drafts</label>
                <div className="text-xs text-muted-foreground">Save work automatically</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data & Privacy</span>
            </CardTitle>
            <CardDescription>
              Manage your data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Location</label>
              <div className="text-sm text-muted-foreground">United States</div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="destructive" size="sm" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageLayout>
  );
};