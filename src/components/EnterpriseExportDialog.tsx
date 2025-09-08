import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useEnterpriseStore } from '@/store/enterprise-store';
import { useAppStore } from '@/store/app-store';
import { ExportFormat, IntegrationType, ExportJob } from '@/types';
import { APIService } from '@/lib/api';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Database,
  Users,
  Folder,
  Info
} from 'lucide-react';

interface EnterpriseExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  preSelectedDocuments?: string[];
}

export const EnterpriseExportDialog: React.FC<EnterpriseExportDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  preSelectedDocuments = []
}) => {
  const { toast } = useToast();
  const { 
    integrations, 
    getConnectedIntegrations, 
    addExportJob, 
    updateExportJob,
    selectedDocuments,
    setSelectedDocuments
  } = useEnterpriseStore();
  
  const { projects, documents } = useAppStore();
  
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('native');
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [addMetadata, setAddMetadata] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentExportJob, setCurrentExportJob] = useState<ExportJob | null>(null);

  const connectedIntegrations = getConnectedIntegrations();
  const project = projects.find(p => p._id === projectId);
  const projectDocuments = documents.filter(doc => doc.project_id === projectId);

  // Initialize selected documents
  useEffect(() => {
    if (preSelectedDocuments.length > 0) {
      setSelectedDocuments(preSelectedDocuments);
    } else {
      setSelectedDocuments(projectDocuments.map(doc => doc._id));
    }
  }, [preSelectedDocuments, projectDocuments, setSelectedDocuments]);

  const selectedIntegrationData = integrations.find(i => i.id === selectedIntegration);
  
  const exportFormats: Array<{
    value: ExportFormat;
    label: string;
    description: string;
    supportedBy: IntegrationType[];
  }> = [
    {
      value: 'native',
      label: 'Native Format',
      description: 'Export in the platform\'s native format',
      supportedBy: ['sharepoint', 'confluence']
    },
    {
      value: 'word',
      label: 'Microsoft Word',
      description: 'Export as .docx files',
      supportedBy: ['sharepoint', 'confluence']
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Export as PDF documents',
      supportedBy: ['sharepoint', 'confluence']
    },
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Export as .md files',
      supportedBy: ['confluence']
    },
    {
      value: 'html',
      label: 'HTML',
      description: 'Export as HTML files',
      supportedBy: ['confluence']
    }
  ];

  const availableFormats = exportFormats.filter(format => 
    !selectedIntegrationData || format.supportedBy.includes(selectedIntegrationData.type)
  );

  const handleDocumentToggle = (documentId: string, checked: boolean) => {
    const updated = checked 
      ? [...selectedDocuments, documentId]
      : selectedDocuments.filter(id => id !== documentId);
    setSelectedDocuments(updated);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(projectDocuments.map(doc => doc._id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const startExport = async () => {
    if (!selectedIntegration || selectedDocuments.length === 0) {
      toast({
        title: 'Export configuration incomplete',
        description: 'Please select an integration and at least one document.',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    
    try {
      const exportOptions = {
        project_id: projectId,
        document_ids: selectedDocuments,
        integration_id: selectedIntegration,
        export_format: exportFormat,
        include_attachments: includeAttachments,
        preserve_formatting: preserveFormatting,
        add_metadata: addMetadata
      };

      let exportJob: ExportJob;
      
      if (selectedIntegrationData?.type === 'sharepoint') {
        exportJob = await APIService.exportToSharePoint(exportOptions);
      } else if (selectedIntegrationData?.type === 'confluence') {
        exportJob = await APIService.exportToConfluence(exportOptions);
      } else {
        throw new Error('Unsupported integration type');
      }

      setCurrentExportJob(exportJob);
      addExportJob(exportJob);

      toast({
        title: 'Export started',
        description: `Started exporting ${selectedDocuments.length} documents to ${selectedIntegrationData?.name}.`,
      });

      // Monitor export progress
      const progressInterval = setInterval(async () => {
        try {
          const jobs = await APIService.getExportJobs(projectId);
          const updatedJob = jobs.find(job => job._id === exportJob._id);
          
          if (updatedJob) {
            setCurrentExportJob(updatedJob);
            updateExportJob(updatedJob._id, updatedJob);
            
            if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
              clearInterval(progressInterval);
              
              if (updatedJob.status === 'completed') {
                toast({
                  title: 'Export completed',
                  description: `Successfully exported ${updatedJob.processed_documents} documents.`,
                });
              } else {
                toast({
                  title: 'Export failed',
                  description: updatedJob.error_message || 'Export failed for unknown reason.',
                  variant: 'destructive',
                });
              }
            }
          }
        } catch (error) {
          console.error('Error monitoring export progress:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Could not start the export process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case 'sharepoint':
        return Database;
      case 'confluence':
        return Users;
      default:
        return Folder;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      roadmap: 'MVP Roadmap',
      elevator_pitch: 'Elevator Pitch',
      model_advice: 'AI Model Advice',
      business_case: 'Business Case',
      feasibility_study: 'Feasibility Study',
      project_charter: 'Project Charter',
      scope_statement: 'Scope Statement',
      rfp: 'RFP Document'
    };
    return labels[type] || type;
  };

  const renderExportProgress = () => {
    if (!currentExportJob) return null;

    const getStatusIcon = () => {
      switch (currentExportJob.status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'failed':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'processing':
          return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
        default:
          return <Clock className="h-5 w-5 text-yellow-600" />;
      }
    };

    const getStatusColor = () => {
      switch (currentExportJob.status) {
        case 'completed':
          return 'text-green-600';
        case 'failed':
          return 'text-red-600';
        case 'processing':
          return 'text-blue-600';
        default:
          return 'text-yellow-600';
      }
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <CardTitle className="text-sm">Export Progress</CardTitle>
            </div>
            <Badge variant="outline" className={getStatusColor()}>
              {currentExportJob.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentExportJob.progress}%</span>
            </div>
            <Progress value={currentExportJob.progress} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentExportJob.processed_documents} of {currentExportJob.total_documents} processed</span>
              <span>{currentExportJob.export_results?.filter(r => r.status === 'success').length || 0} successful</span>
            </div>
          </div>

          {currentExportJob.status === 'completed' && currentExportJob.exported_urls && (
            <div className="space-y-2">
              <Label>Exported Documents</Label>
              <div className="space-y-1">
                {currentExportJob.exported_urls.slice(0, 3).map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate flex-1">{url.split('/').pop()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {currentExportJob.exported_urls.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{currentExportJob.exported_urls.length - 3} more documents exported
                  </p>
                )}
              </div>
            </div>
          )}

          {currentExportJob.error_message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentExportJob.error_message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export to Enterprise System</DialogTitle>
          <DialogDescription>
            Export your MVP documents to connected enterprise systems like SharePoint or Confluence.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {connectedIntegrations.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No connected integrations found. Please set up an integration first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Integration Selection */}
              <div className="space-y-4">
                <Label>Select Integration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedIntegrations.map((integration) => {
                    const Icon = getIntegrationIcon(integration.type);
                    const isSelected = selectedIntegration === integration.id;
                    
                    return (
                      <Card 
                        key={integration.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'border-primary shadow-md' : 'hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setSelectedIntegration(integration.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <CardTitle className="text-sm">{integration.name}</CardTitle>
                            </div>
                            {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                          </div>
                          <CardDescription className="text-xs">
                            {integration.configuration.site_url}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Export Settings */}
              {selectedIntegration && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Export Format</Label>
                        <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                <div className="flex flex-col">
                                  <span>{format.label}</span>
                                  <span className="text-xs text-muted-foreground">{format.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Export Options</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="attachments"
                            checked={includeAttachments}
                            onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
                          />
                          <Label htmlFor="attachments" className="text-sm">Include attachments</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="formatting"
                            checked={preserveFormatting}
                            onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                          />
                          <Label htmlFor="formatting" className="text-sm">Preserve formatting</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="metadata"
                            checked={addMetadata}
                            onCheckedChange={(checked) => setAddMetadata(checked as boolean)}
                          />
                          <Label htmlFor="metadata" className="text-sm">Add metadata</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Select Documents to Export</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDocuments.length === projectDocuments.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label className="text-sm">Select All</Label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {projectDocuments.map((doc) => (
                    <div 
                      key={doc._id} 
                      className="flex items-center space-x-3 p-3 border rounded hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedDocuments.includes(doc._id)}
                        onCheckedChange={(checked) => handleDocumentToggle(doc._id, checked as boolean)}
                      />
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getDocumentTypeLabel(doc.document_type)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated {new Date(doc.generated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                {selectedDocuments.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Export Progress */}
              {currentExportJob && renderExportProgress()}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {currentExportJob?.status === 'completed' ? 'Close' : 'Cancel'}
          </Button>
          {connectedIntegrations.length > 0 && (
            <Button 
              onClick={startExport}
              disabled={exporting || !selectedIntegration || selectedDocuments.length === 0 || currentExportJob?.status === 'processing'}
            >
              {exporting ? 'Starting Export...' : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Documents
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};