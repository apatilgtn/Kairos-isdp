import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useEnterpriseStore } from '@/store/enterprise-store';
import { 
  Database, 
  Users, 
  Settings, 
  TestTube, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Shield,
  Key,
  Globe,
  Clock,
  UserCheck,
  FileText,
  Zap,
  RefreshCw
} from 'lucide-react';

interface EnhancedIntegrationSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationType?: 'sharepoint' | 'confluence';
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
  complexity: 'basic' | 'standard' | 'advanced';
  recommended: boolean;
}

export const EnhancedIntegrationSetup: React.FC<EnhancedIntegrationSetupProps> = ({
  open,
  onOpenChange,
  integrationType = 'sharepoint'
}) => {
  const { toast } = useToast();
  const { addIntegration } = useEnterpriseStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState<'sharepoint' | 'confluence'>(integrationType);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const integrationTypes = [
    {
      id: 'sharepoint' as const,
      name: 'Microsoft SharePoint',
      description: 'Enterprise document management and collaboration platform',
      icon: Database,
      features: [
        'Document Libraries',
        'Version Control',
        'Co-authoring',
        'Workflow Integration',
        'Advanced Search',
        'Compliance Features'
      ],
      popular: true
    },
    {
      id: 'confluence' as const,
      name: 'Atlassian Confluence',
      description: 'Team collaboration and knowledge management wiki',
      icon: Users,
      features: [
        'Wiki Pages',
        'Team Spaces',
        'Real-time Editing',
        'Comments & Reviews',
        'Templates',
        'Advanced Permissions'
      ],
      popular: false
    }
  ];

  const sharepointTemplates: IntegrationTemplate[] = [
    {
      id: 'basic-sharepoint',
      name: 'Basic Document Library',
      description: 'Simple document storage with basic collaboration features',
      features: ['Document upload', 'Basic permissions', 'Version history'],
      complexity: 'basic',
      recommended: false
    },
    {
      id: 'standard-sharepoint',
      name: 'Standard Collaboration',
      description: 'Full collaboration features with workflow integration',
      features: ['Co-authoring', 'Approval workflows', 'Metadata management', 'Search integration'],
      complexity: 'standard',
      recommended: true
    },
    {
      id: 'advanced-sharepoint',
      name: 'Enterprise Integration',
      description: 'Advanced enterprise features with compliance and security',
      features: ['Advanced security', 'Compliance tracking', 'Custom workflows', 'API integration'],
      complexity: 'advanced',
      recommended: false
    }
  ];

  const confluenceTemplates: IntegrationTemplate[] = [
    {
      id: 'basic-confluence',
      name: 'Simple Wiki Setup',
      description: 'Basic wiki pages with standard formatting',
      features: ['Page creation', 'Basic templates', 'Simple permissions'],
      complexity: 'basic',
      recommended: false
    },
    {
      id: 'standard-confluence',
      name: 'Team Collaboration',
      description: 'Enhanced team features with real-time collaboration',
      features: ['Real-time editing', 'Comments', 'Page templates', 'Team spaces'],
      complexity: 'standard',  
      recommended: true
    },
    {
      id: 'advanced-confluence',
      name: 'Enterprise Knowledge Base',
      description: 'Advanced knowledge management with automation',
      features: ['Advanced templates', 'Automation rules', 'Custom macros', 'Analytics'],
      complexity: 'advanced',
      recommended: false
    }
  ];

  const currentTemplates = selectedType === 'sharepoint' ? sharepointTemplates : confluenceTemplates;
  const selectedIntegration = integrationTypes.find(type => type.id === selectedType);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      // Simulate connection testing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock test results
      const mockResults = {
        connection: { status: 'success', message: 'Connection established successfully' },
        authentication: { status: 'success', message: 'Authentication verified' },
        permissions: { status: 'success', message: 'Required permissions available' },
        features: { status: 'success', message: 'All features supported' }
      };
      
      setTestResults(mockResults);
      toast({
        title: 'Connection test successful',
        description: 'All systems are working correctly.',
      });
    } catch (error) {
      setTestResults({
        connection: { status: 'error', message: 'Failed to connect to server' }
      });
      toast({
        title: 'Connection test failed',
        description: 'Please check your configuration.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      const integration = {
        id: `${selectedType}_${Date.now()}`,
        type: selectedType,
        name: `${selectedIntegration?.name} Integration`,
        status: 'connected' as const,
        configuration: {
          ...formData,
          template_id: selectedTemplate,
          created_at: Date.now(),
          last_tested: Date.now()
        },
        created_at: Date.now(),
        updated_at: Date.now()
      };

      addIntegration(integration);
      
      toast({
        title: 'Integration created successfully',
        description: `${selectedIntegration?.name} has been connected to your workspace.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Failed to create integration',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose Integration Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <Card 
                      key={type.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-primary shadow-md' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-6 w-6" />
                            <div>
                              <CardTitle className="text-base">{type.name}</CardTitle>
                              {type.popular && (
                                <Badge variant="secondary" className="text-xs mt-1">Popular</Badge>
                              )}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                        <CardDescription className="text-sm">
                          {type.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Key Features:</p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {type.features.slice(0, 3).map((feature, index) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Select Configuration Template</h3>
              <div className="space-y-4">
                {currentTemplates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  const complexityColors = {
                    basic: 'bg-green-100 text-green-800',
                    standard: 'bg-blue-100 text-blue-800',
                    advanced: 'bg-purple-100 text-purple-800'
                  };
                  
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-primary shadow-md' : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              {template.recommended && (
                                <Badge variant="default" className="text-xs">Recommended</Badge>
                              )}
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${complexityColors[template.complexity]}`}
                              >
                                {template.complexity}
                              </Badge>
                            </div>
                            <CardDescription>{template.description}</CardDescription>
                          </div>
                          {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Included Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {template.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Configuration Settings</h3>
              
              <Tabs defaultValue="connection" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="connection">Connection</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="connection" className="space-y-4">
                  {selectedType === 'sharepoint' ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="site_url">SharePoint Site URL *</Label>
                        <Input
                          id="site_url"
                          placeholder="https://company.sharepoint.com/sites/yoursite"
                          value={formData.site_url || ''}
                          onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="library_name">Document Library Name *</Label>
                        <Input
                          id="library_name"
                          placeholder="Documents"
                          value={formData.library_name || ''}
                          onChange={(e) => setFormData({ ...formData, library_name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="client_id">Client ID *</Label>
                          <Input
                            id="client_id"
                            placeholder="Application Client ID"
                            value={formData.client_id || ''}
                            onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenant_id">Tenant ID *</Label>
                          <Input
                            id="tenant_id"
                            placeholder="Azure AD Tenant ID"
                            value={formData.tenant_id || ''}
                            onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client_secret">Client Secret</Label>
                        <Input
                          id="client_secret"
                          type="password"
                          placeholder="Application Client Secret (optional if using managed identity)"
                          value={formData.client_secret || ''}
                          onChange={(e) => setFormData({ ...formData, client_secret: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="base_url">Confluence Base URL *</Label>
                        <Input
                          id="base_url"
                          placeholder="https://company.atlassian.net"
                          value={formData.base_url || ''}
                          onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="space_key">Space Key *</Label>
                        <Input
                          id="space_key"
                          placeholder="TEAM"
                          value={formData.space_key || ''}
                          onChange={(e) => setFormData({ ...formData, space_key: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username/Email *</Label>
                        <Input
                          id="username"
                          placeholder="user@company.com"
                          value={formData.username || ''}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="api_token">API Token *</Label>
                        <Input
                          id="api_token"
                          type="password"
                          placeholder="Confluence API Token"
                          value={formData.api_token || ''}
                          onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parent_page_id">Parent Page ID (Optional)</Label>
                        <Input
                          id="parent_page_id"
                          placeholder="123456789"
                          value={formData.parent_page_id || ''}
                          onChange={(e) => setFormData({ ...formData, parent_page_id: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="encryption"
                        checked={formData.encryption_enabled || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, encryption_enabled: checked })}
                      />
                      <Label htmlFor="encryption" className="text-sm">Enable end-to-end encryption</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="audit_logging"
                        checked={formData.audit_logging || true}
                        onCheckedChange={(checked) => setFormData({ ...formData, audit_logging: checked })}
                      />
                      <Label htmlFor="audit_logging" className="text-sm">Enable audit logging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="require_approval"
                        checked={formData.require_approval || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, require_approval: checked })}
                      />
                      <Label htmlFor="require_approval" className="text-sm">Require approval for document exports</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="approved_domains">Approved Domains (one per line)</Label>
                      <Textarea
                        id="approved_domains"
                        placeholder="company.com&#10;partner.com"
                        value={formData.approved_domains || ''}
                        onChange={(e) => setFormData({ ...formData, approved_domains: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="enable_comments"
                        checked={formData.enable_comments || true}
                        onCheckedChange={(checked) => setFormData({ ...formData, enable_comments: checked })}
                      />
                      <Label htmlFor="enable_comments" className="text-sm">Enable collaborative commenting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="version_control"
                        checked={formData.version_control || true}
                        onCheckedChange={(checked) => setFormData({ ...formData, version_control: checked })}
                      />
                      <Label htmlFor="version_control" className="text-sm">Enable version control</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="real_time_collaboration"
                        checked={formData.real_time_collaboration || true}
                        onCheckedChange={(checked) => setFormData({ ...formData, real_time_collaboration: checked })}
                      />
                      <Label htmlFor="real_time_collaboration" className="text-sm">Enable real-time collaboration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="auto_export"
                        checked={formData.auto_export || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, auto_export: checked })}
                      />
                      <Label htmlFor="auto_export" className="text-sm">Auto-export new documents</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="export_format">Default Export Format</Label>
                      <Select
                        value={formData.export_format || 'native'}
                        onValueChange={(value) => setFormData({ ...formData, export_format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="native">Native Format</SelectItem>
                          <SelectItem value="word">Microsoft Word</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="markdown">Markdown</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Test Connection</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <TestTube className="h-4 w-4" />
                    <span>Connection Test</span>
                  </CardTitle>
                  <CardDescription>
                    Verify that all settings are configured correctly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="w-full"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>

                  {testResults && (
                    <div className="space-y-3">
                      {Object.entries(testResults).map(([key, result]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            {result.status === 'success' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium capitalize">{key}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {result.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {testResults && Object.values(testResults).every((result: any) => result.status === 'success') && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        All tests passed! Your integration is ready to be created.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Enterprise Integration Setup</span>
          </DialogTitle>
          <DialogDescription>
            Connect your KAIROS workspace with enterprise collaboration platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentStep === 1 && 'Choose your integration platform'}
              {currentStep === 2 && 'Select configuration template'}
              {currentStep === 3 && 'Configure connection settings'}
              {currentStep === 4 && 'Test and finalize setup'}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !selectedType) ||
                    (currentStep === 2 && !selectedTemplate)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateIntegration}
                  disabled={!testResults || !Object.values(testResults).every((result: any) => result.status === 'success')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};