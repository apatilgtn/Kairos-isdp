import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Database, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  Download,
  Activity,
  MoreVertical,
  RefreshCw,
  FileText,
  Upload,
  Share,
  Zap,
  Globe,
  Shield,
  Folder,
  Send,
  Edit,
  Info
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedExportIntegrationSystemProps {
  projectId: string;
}

interface MockIntegration {
  id: string;
  name: string;
  type: 'sharepoint' | 'confluence' | 'teams' | 'slack';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  configuration: {
    site_url: string;
    auto_sync: boolean;
    folder_path?: string;
    permissions?: string;
  };
  last_sync?: number;
  created_at: number;
  documents_synced: number;
  storage_used: string;
}

interface MockExportJob {
  id: string;
  integration_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_documents: number;
  processed_documents: number;
  started_at: number;
  completed_at?: number;
  export_format: string;
  exported_urls?: string[];
  error_message?: string;
}

export const EnhancedExportIntegrationSystem: React.FC<EnhancedExportIntegrationSystemProps> = ({
  projectId
}) => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { projects, documents } = useAppStore();
  
  const [integrations, setIntegrations] = useState<MockIntegration[]>([]);
  const [exportJobs, setExportJobs] = useState<MockExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [exporting, setExporting] = useState(false);
  const [currentExportJob, setCurrentExportJob] = useState<MockExportJob | null>(null);
  
  // New integration form
  const [newIntegration, setNewIntegration] = useState<{
    name: string;
    type: 'sharepoint' | 'confluence';
    site_url: string;
    auto_sync: boolean;
  }>({
    name: '',
    type: 'sharepoint',
    site_url: '',
    auto_sync: true
  });

  const project = projects.find(p => p._id === projectId);
  const projectDocuments = documents.filter(doc => doc.project_id === projectId);

  useEffect(() => {
    initializeData();
  }, [projectId]);

  const initializeData = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access enterprise features.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize with sample data
      const sampleIntegrations: MockIntegration[] = [
        {
          id: 'int-1',
          name: 'Corporate SharePoint',
          type: 'sharepoint',
          status: 'connected',
          configuration: {
            site_url: 'https://company.sharepoint.com/sites/projects',
            auto_sync: true,
            folder_path: '/Shared Documents/KAIROS Projects',
            permissions: 'read-write'
          },
          last_sync: Date.now() - 3600000, // 1 hour ago
          created_at: Date.now() - 86400000 * 7, // 7 days ago
          documents_synced: 24,
          storage_used: '12.3 GB'
        },
        {
          id: 'int-2',
          name: 'Development Wiki',
          type: 'confluence',
          status: 'connected',
          configuration: {
            site_url: 'https://company.atlassian.net/wiki',
            auto_sync: false,
            folder_path: '/KAIROS Documentation',
            permissions: 'read-write'
          },
          last_sync: Date.now() - 7200000, // 2 hours ago
          created_at: Date.now() - 86400000 * 14, // 14 days ago
          documents_synced: 18,
          storage_used: '8.7 GB'
        }
      ];

      const sampleExportJobs: MockExportJob[] = [
        {
          id: 'job-1',
          integration_id: 'int-1',
          status: 'completed',
          progress: 100,
          total_documents: 5,
          processed_documents: 5,
          started_at: Date.now() - 1800000, // 30 minutes ago
          completed_at: Date.now() - 1200000, // 20 minutes ago
          export_format: 'pdf',
          exported_urls: [
            'https://company.sharepoint.com/sites/projects/MVP_Roadmap_2024.pdf',
            'https://company.sharepoint.com/sites/projects/Business_Case_Analysis.pdf',
            'https://company.sharepoint.com/sites/projects/Feasibility_Study.pdf'
          ]
        },
        {
          id: 'job-2',
          integration_id: 'int-2',
          status: 'processing',
          progress: 65,
          total_documents: 3,
          processed_documents: 2,
          started_at: Date.now() - 600000, // 10 minutes ago
          export_format: 'word'
        }
      ];

      setIntegrations(sampleIntegrations);
      setExportJobs(sampleExportJobs);
      
      toast({
        title: 'Data loaded successfully',
        description: 'Enterprise integrations and export history loaded.',
      });
    } catch (error) {
      console.error('Error initializing data:', error);
      toast({
        title: 'Loading failed',
        description: 'Could not load enterprise data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    if (!newIntegration.name || !newIntegration.site_url) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both name and site URL.',
        variant: 'destructive',
      });
      return;
    }

    const integration: MockIntegration = {
      id: `int-${Date.now()}`,
      ...newIntegration,
      status: 'connected',
      configuration: {
        site_url: newIntegration.site_url,
        auto_sync: newIntegration.auto_sync,
        folder_path: '/Shared Documents',
        permissions: 'read-write'
      },
      created_at: Date.now(),
      documents_synced: 0,
      storage_used: '0 MB'
    };

    setIntegrations(prev => [...prev, integration]);
    setShowAddIntegration(false);
    setNewIntegration({
      name: '',
      type: 'sharepoint',
      site_url: '',
      auto_sync: true
    });

    toast({
      title: 'Integration added',
      description: `${integration.name} has been connected successfully.`,
    });
  };

  const handleDeleteIntegration = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    setIntegrations(prev => prev.filter(i => i.id !== integrationId));
    
    toast({
      title: 'Integration deleted',
      description: `${integration?.name} has been removed.`,
    });
  };

  const handleSyncIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // Update status to syncing
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'syncing' as const } : i
    ));

    toast({
      title: 'Sync started',
      description: `Syncing with ${integration.name}...`,
    });

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId ? { 
          ...i, 
          status: 'connected' as const,
          last_sync: Date.now(),
          documents_synced: i.documents_synced + Math.floor(Math.random() * 3)
        } : i
      ));

      toast({
        title: 'Sync completed',
        description: `Successfully synced with ${integration.name}.`,
      });
    }, 3000);
  };

  const handleStartExport = async () => {
    if (!selectedIntegration || selectedDocuments.length === 0) {
      toast({
        title: 'Export configuration incomplete',
        description: 'Please select an integration and at least one document.',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    const integration = integrations.find(i => i.id === selectedIntegration);
    
    const exportJob: MockExportJob = {
      id: `job-${Date.now()}`,
      integration_id: selectedIntegration,
      status: 'processing',
      progress: 0,
      total_documents: selectedDocuments.length,
      processed_documents: 0,
      started_at: Date.now(),
      export_format: exportFormat
    };

    setCurrentExportJob(exportJob);
    setExportJobs(prev => [exportJob, ...prev]);

    toast({
      title: 'Export started',
      description: `Exporting ${selectedDocuments.length} documents to ${integration?.name}.`,
    });

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setCurrentExportJob(prev => {
        if (!prev || prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }

        const newProgress = Math.min(prev.progress + Math.random() * 15, 100);
        const newProcessed = Math.floor((newProgress / 100) * prev.total_documents);
        
        const updatedJob = {
          ...prev,
          progress: Math.round(newProgress),
          processed_documents: newProcessed,
          ...(newProgress >= 100 ? {
            status: 'completed' as const,
            completed_at: Date.now(),
            exported_urls: selectedDocuments.map((_, index) => 
              `${integration?.configuration.site_url}/Document_${index + 1}.${exportFormat}`
            )
          } : {})
        };

        setExportJobs(prevJobs => prevJobs.map(job => 
          job.id === prev.id ? updatedJob : job
        ));

        if (newProgress >= 100) {
          setTimeout(() => {
            toast({
              title: 'Export completed',
              description: `Successfully exported ${selectedDocuments.length} documents.`,
            });
            setExporting(false);
          }, 500);
        }

        return updatedJob;
      });
    }, 800);

    return () => clearInterval(progressInterval);
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'sharepoint': return Database;
      case 'confluence': return Users;
      case 'teams': return Users;
      case 'slack': return Send;
      default: return Folder;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'syncing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'connected': return 'default';
      case 'error': return 'destructive';
      case 'syncing': return 'secondary';
      default: return 'outline';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access enterprise export and integration features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Loading enterprise integrations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export & Integration</h2>
          <p className="text-muted-foreground">
            Connect and export documents to your enterprise systems
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={initializeData} 
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddIntegration(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center space-x-3 p-4">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-sm">{integrations.length}</CardTitle>
              <CardDescription className="text-xs">Active Integrations</CardDescription>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowExportDialog(true)}>
          <CardContent className="flex items-center space-x-3 p-4">
            <Download className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle className="text-sm">Export Now</CardTitle>
              <CardDescription className="text-xs">Export documents</CardDescription>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center space-x-3 p-4">
            <Activity className="h-8 w-8 text-orange-600" />
            <div>
              <CardTitle className="text-sm">{exportJobs.length}</CardTitle>
              <CardDescription className="text-xs">Export Jobs</CardDescription>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center space-x-3 p-4">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <CardTitle className="text-sm">{projectDocuments.length}</CardTitle>
              <CardDescription className="text-xs">Available Documents</CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Connected Integrations</h3>
          <Badge variant="outline">
            {integrations.length} integration{integrations.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {integrations.length === 0 ? (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              No integrations configured yet. Add an integration to start exporting documents.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const Icon = getIntegrationIcon(integration.type);
              
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-6 w-6" />
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span className="capitalize">{integration.type}</span>
                            <span>•</span>
                            <span className="truncate max-w-48">
                              {integration.configuration.site_url}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(integration.status)}
                        <Badge variant={getStatusBadgeVariant(integration.status)}>
                          {integration.status}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSyncIntegration(integration.id)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteIntegration(integration.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Sync:</span>
                        <p className="font-medium">
                          {integration.last_sync 
                            ? new Date(integration.last_sync).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Documents:</span>
                        <p className="font-medium">{integration.documents_synced}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Storage:</span>
                        <p className="font-medium">{integration.storage_used}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Auto Sync:</span>
                        <p className="font-medium">
                          {integration.configuration.auto_sync ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedIntegration(integration.id);
                          setShowExportDialog(true);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Documents
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => window.open(integration.configuration.site_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Export Jobs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Export Jobs</h3>
          <Badge variant="outline">
            {exportJobs.length} job{exportJobs.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {exportJobs.length === 0 ? (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              No export jobs found. Start an export to see job history here.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {exportJobs.map((job) => {
              const integration = integrations.find(i => i.id === job.integration_id);
              const getJobStatusIcon = () => {
                switch (job.status) {
                  case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
                  case 'processing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
                  default: return <Clock className="h-4 w-4 text-yellow-600" />;
                }
              };

              return (
                <Card key={job.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getJobStatusIcon()}
                        <CardTitle className="text-sm">
                          Export to {integration?.name || 'Unknown'}
                        </CardTitle>
                      </div>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {job.total_documents} documents • {job.export_format} format
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {(job.status === 'processing' || job.status === 'pending') && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Started {new Date(job.started_at).toLocaleString()}
                      {job.completed_at && (
                        <> • Completed {new Date(job.completed_at).toLocaleString()}</>
                      )}
                    </div>
                    
                    {job.status === 'completed' && job.exported_urls && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Exported Files:</p>
                        {job.exported_urls.slice(0, 2).map((url, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 justify-start text-xs"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {url.split('/').pop()}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Integration Dialog */}
      <Dialog open={showAddIntegration} onOpenChange={setShowAddIntegration}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Connect a new enterprise system to export your documents.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Integration Name</Label>
              <Input
                placeholder="e.g., Corporate SharePoint"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Integration Type</Label>
              <Select 
                value={newIntegration.type} 
                onValueChange={(value: 'sharepoint' | 'confluence') => 
                  setNewIntegration(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sharepoint">SharePoint</SelectItem>
                  <SelectItem value="confluence">Confluence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Site URL</Label>
              <Input
                placeholder="https://company.sharepoint.com/sites/projects"
                value={newIntegration.site_url}
                onChange={(e) => setNewIntegration(prev => ({ ...prev, site_url: e.target.value }))}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={newIntegration.auto_sync}
                onCheckedChange={(checked) => 
                  setNewIntegration(prev => ({ ...prev, auto_sync: checked as boolean }))
                }
              />
              <Label>Enable automatic sync</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddIntegration(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIntegration}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Documents</DialogTitle>
            <DialogDescription>
              Export selected documents to your connected enterprise systems.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {integrations.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No integrations available. Please add an integration first.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Select Integration</Label>
                  <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an integration..." />
                    </SelectTrigger>
                    <SelectContent>
                      {integrations.filter(i => i.status === 'connected').map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          {integration.name} ({integration.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="word">Microsoft Word</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Select Documents ({projectDocuments.length} available)</Label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedDocuments.length === projectDocuments.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedDocuments(projectDocuments.map(doc => doc._id));
                          } else {
                            setSelectedDocuments([]);
                          }
                        }}
                      />
                      <Label className="text-sm font-medium">Select All</Label>
                    </div>
                    {projectDocuments.map((doc) => (
                      <div key={doc._id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedDocuments.includes(doc._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDocuments(prev => [...prev, doc._id]);
                            } else {
                              setSelectedDocuments(prev => prev.filter(id => id !== doc._id));
                            }
                          }}
                        />
                        <Label className="text-sm">
                          {doc.document_type} ({new Date(doc.generated_at).toLocaleDateString()})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {currentExportJob && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Export Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{currentExportJob.progress}%</span>
                      </div>
                      <Progress value={currentExportJob.progress} />
                      <p className="text-xs text-muted-foreground">
                        {currentExportJob.processed_documents} of {currentExportJob.total_documents} processed
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            {integrations.length > 0 && (
              <Button 
                onClick={handleStartExport}
                disabled={exporting || !selectedIntegration || selectedDocuments.length === 0}
              >
                {exporting ? 'Exporting...' : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {selectedDocuments.length} Document{selectedDocuments.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};