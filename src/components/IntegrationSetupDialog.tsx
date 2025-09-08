import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEnterpriseStore } from '@/store/enterprise-store';
import { IntegrationType, EnterpriseIntegration } from '@/types';
import { APIService } from '@/lib/api';
import { Cloud, Database, Users, Workflow, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface IntegrationSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIntegration?: EnterpriseIntegration | null;
}

export const IntegrationSetupDialog: React.FC<IntegrationSetupDialogProps> = ({
  open,
  onOpenChange,
  editingIntegration
}) => {
  const { toast } = useToast();
  const { addIntegration, updateIntegration } = useEnterpriseStore();
  
  const [selectedType, setSelectedType] = useState<IntegrationType>(
    editingIntegration?.type || 'sharepoint'
  );
  const [formData, setFormData] = useState({
    name: editingIntegration?.name || '',
    site_url: editingIntegration?.configuration?.site_url || '',
    document_library: (editingIntegration?.configuration as any)?.document_library || 'Documents',
    folder_path: editingIntegration?.configuration?.folder_path || '/MVP Projects',
    space_key: editingIntegration?.configuration?.space_key || '',
    parent_page_id: (editingIntegration?.configuration as any)?.parent_page_id || '',
    auto_sync: editingIntegration?.configuration?.auto_sync || false,
    sync_frequency: editingIntegration?.configuration?.sync_frequency || 'manual'
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saving, setSaving] = useState(false);

  const integrationTypes = [
    {
      id: 'sharepoint' as IntegrationType,
      name: 'Microsoft SharePoint',
      description: 'Export documents to SharePoint document libraries',
      icon: Database,
      features: ['Document Libraries', 'Version Control', 'Team Collaboration', 'Office Integration']
    },
    {
      id: 'confluence' as IntegrationType,
      name: 'Atlassian Confluence',
      description: 'Create and update Confluence wiki pages',
      icon: Users,
      features: ['Wiki Pages', 'Space Management', 'Rich Formatting', 'Team Collaboration']
    },
    {
      id: 'teams' as IntegrationType,
      name: 'Microsoft Teams',
      description: 'Share documents with Teams channels',
      icon: Users,
      features: ['Channel Integration', 'Chat Notifications', 'File Sharing', 'Team Collaboration'],
      comingSoon: true
    },
    {
      id: 'slack' as IntegrationType,
      name: 'Slack',
      description: 'Share documents with Slack channels',
      icon: Workflow,
      features: ['Channel Integration', 'Notifications', 'File Sharing', 'Bot Integration'],
      comingSoon: true
    }
  ];

  const selectedIntegrationType = integrationTypes.find(type => type.id === selectedType);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure based on URL validity
      const isValid = formData.site_url.includes('sharepoint.com') || 
                     formData.site_url.includes('atlassian.net');
      
      if (isValid) {
        setTestResult('success');
        toast({
          title: 'Connection successful',
          description: 'Successfully connected to the integration service.',
        });
      } else {
        throw new Error('Invalid URL format');
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: 'Connection failed',
        description: 'Could not connect to the integration service. Please check your settings.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.site_url) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    
    try {
      const integrationData = {
        id: editingIntegration?.id || `${selectedType}_${Date.now()}`,
        name: formData.name,
        type: selectedType,
        status: 'connected' as const,
        configuration: {
          site_url: formData.site_url,
          document_library: formData.document_library,
          folder_path: formData.folder_path,
          space_key: formData.space_key,
          parent_page_id: formData.parent_page_id,
          auto_sync: formData.auto_sync,
          sync_frequency: formData.sync_frequency,
          auth_token: 'mock_token_' + Date.now(),
          expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        },
        created_at: editingIntegration?.created_at || Date.now(),
        updated_at: Date.now()
      };

      if (editingIntegration) {
        await APIService.updateIntegration(editingIntegration.id, integrationData);
        updateIntegration(editingIntegration.id, integrationData);
        toast({
          title: 'Integration updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await APIService.createIntegration(integrationData);
        addIntegration(integrationData);
        toast({
          title: 'Integration created',
          description: `${formData.name} has been set up successfully.`,
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Could not save the integration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderSharePointForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site_url">SharePoint Site URL *</Label>
        <Input
          id="site_url"
          placeholder="https://company.sharepoint.com/sites/your-site"
          value={formData.site_url}
          onChange={(e) => handleInputChange('site_url', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="document_library">Document Library</Label>
        <Input
          id="document_library"
          placeholder="Documents"
          value={formData.document_library}
          onChange={(e) => handleInputChange('document_library', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="folder_path">Folder Path</Label>
        <Input
          id="folder_path"
          placeholder="/MVP Projects"
          value={formData.folder_path}
          onChange={(e) => handleInputChange('folder_path', e.target.value)}
        />
      </div>
    </div>
  );

  const renderConfluenceForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site_url">Confluence Base URL *</Label>
        <Input
          id="site_url"
          placeholder="https://company.atlassian.net/wiki"
          value={formData.site_url}
          onChange={(e) => handleInputChange('site_url', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="space_key">Space Key *</Label>
        <Input
          id="space_key"
          placeholder="MVP"
          value={formData.space_key}
          onChange={(e) => handleInputChange('space_key', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="parent_page_id">Parent Page ID (Optional)</Label>
        <Input
          id="parent_page_id"
          placeholder="123456789"
          value={formData.parent_page_id}
          onChange={(e) => handleInputChange('parent_page_id', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingIntegration ? 'Edit Integration' : 'Set Up Enterprise Integration'}
          </DialogTitle>
          <DialogDescription>
            Connect to your enterprise systems to automatically export and sync MVP documents.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup">Integration Setup</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name *</Label>
                <Input
                  id="name"
                  placeholder="My SharePoint Integration"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Integration Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {integrationTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'border-primary shadow-md' : 'hover:border-muted-foreground/50'
                        } ${type.comingSoon ? 'opacity-50' : ''}`}
                        onClick={() => !type.comingSoon && setSelectedType(type.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-5 w-5" />
                              <CardTitle className="text-sm">{type.name}</CardTitle>
                            </div>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                            {type.comingSoon && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
                          </div>
                          <CardDescription className="text-xs">{type.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-wrap gap-1">
                            {type.features.slice(0, 2).map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {type.features.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{type.features.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {selectedIntegrationType && !selectedIntegrationType.comingSoon && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <selectedIntegrationType.icon className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">{selectedIntegrationType.name} Configuration</h3>
                  </div>
                  
                  {selectedType === 'sharepoint' && renderSharePointForm()}
                  {selectedType === 'confluence' && renderConfluenceForm()}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={testConnection}
                      disabled={testing || !formData.site_url}
                    >
                      {testing ? 'Testing...' : 'Test Connection'}
                    </Button>
                    
                    {testResult === 'success' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Connection successful</span>
                      </div>
                    )}
                    
                    {testResult === 'error' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Connection failed</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configure how and when documents are synchronized with your enterprise system.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync documents when they are created or updated
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={formData.auto_sync}
                  onCheckedChange={(checked) => handleInputChange('auto_sync', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sync_frequency">Sync Frequency</Label>
                <Select
                  value={formData.sync_frequency}
                  onValueChange={(value) => handleInputChange('sync_frequency', value)}
                  disabled={!formData.auto_sync}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_time">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.name || !formData.site_url || (selectedIntegrationType?.comingSoon)}
          >
            {saving ? 'Saving...' : editingIntegration ? 'Update Integration' : 'Create Integration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};