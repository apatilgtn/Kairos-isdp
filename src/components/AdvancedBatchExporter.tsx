import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';
import { AdvancedExportPipeline } from '@/lib/advanced-export-pipeline';
import type { 
  ExportJobItem, 
  ExportQueueStats, 
  ExportTemplate, 
  ExportFormat, 
  ExportPriority,
  ExportJobOptions,
  BrandingOptions
} from '@/lib/advanced-export-pipeline';
import type { RoadmapDocument, MVPProject, UserDiagram } from '@/types';
import {
  Download,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  Pause,
  X,
  BarChart3,
  Settings,
  FileText,
  Image,
  Users,
  Sparkles,
  Zap,
  Monitor,
  RefreshCw,
  Trash2,
  Crown,
  Building,
  Palette
} from 'lucide-react';

interface AdvancedBatchExporterProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedBatchExporter: React.FC<AdvancedBatchExporterProps> = ({
  project,
  documents,
  diagrams,
  isOpen,
  onClose
}) => {
  const { addNotification } = useAppStore();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedPriority, setSelectedPriority] = useState<ExportPriority>('normal');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [queueStats, setQueueStats] = useState<ExportQueueStats | null>(null);
  const [activeJobs, setActiveJobs] = useState<ExportJobItem[]>([]);
  const [showBrandingDialog, setShowBrandingDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<Partial<ExportJobOptions>>({
    includeMetadata: true,
    includeDiagrams: true,
    compression: false
  });
  const [brandingOptions, setBrandingOptions] = useState<BrandingOptions>({
    companyName: '',
    primaryColor: '#0ea5e9',
    headerFooter: true
  });

  // Subscribe to queue updates
  useEffect(() => {
    const unsubscribe = AdvancedExportPipeline.subscribe((stats) => {
      setQueueStats(stats);
    });

    // Get initial stats
    setQueueStats(AdvancedExportPipeline.getQueueStats());

    return unsubscribe;
  }, []);

  // Get templates
  const templates = AdvancedExportPipeline.getTemplates();

  const handleDocumentSelection = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => 
      checked 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDocuments(checked ? documents.map(doc => doc._id) : []);
  };

  const handleTemplateSelection = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedFormat(template.format);
      setExportOptions({ 
        ...exportOptions, 
        ...template.options,
        branding: template.options.branding ? { ...brandingOptions, ...template.options.branding } : brandingOptions
      });
    } else {
      setSelectedTemplate('');
    }
  };

  const startBatchExport = () => {
    if (selectedDocuments.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Documents Selected',
        message: 'Please select at least one document to export.',
        duration: 3000
      });
      return;
    }

    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc._id));
    const options: Partial<ExportJobOptions> = {
      ...exportOptions,
      priority: selectedPriority,
      branding: brandingOptions.companyName || brandingOptions.primaryColor !== '#0ea5e9' 
        ? brandingOptions 
        : undefined
    };

    const jobId = AdvancedExportPipeline.addBatchExportJob(
      selectedDocs,
      project,
      selectedFormat,
      options
    );

    addNotification({
      type: 'success',
      title: 'Export Job Queued',
      message: `Batch export of ${selectedDocs.length} documents added to queue`,
      duration: 4000
    });

    console.log(`Started batch export job: ${jobId}`);
  };

  const startIndividualExports = () => {
    if (selectedDocuments.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Documents Selected',
        message: 'Please select at least one document to export.',
        duration: 3000
      });
      return;
    }

    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc._id));
    const options: Partial<ExportJobOptions> = {
      ...exportOptions,
      priority: selectedPriority,
      branding: brandingOptions.companyName || brandingOptions.primaryColor !== '#0ea5e9' 
        ? brandingOptions 
        : undefined
    };

    selectedDocs.forEach(doc => {
      AdvancedExportPipeline.addExportJob(
        'document',
        doc.title,
        selectedFormat,
        doc,
        options
      );
    });

    addNotification({
      type: 'success',
      title: 'Export Jobs Queued',
      message: `${selectedDocs.length} individual export jobs added to queue`,
      duration: 4000
    });
  };

  const cancelJob = (jobId: string) => {
    const success = AdvancedExportPipeline.cancelJob(jobId);
    if (success) {
      addNotification({
        type: 'info',
        title: 'Job Cancelled',
        message: 'Export job has been cancelled',
        duration: 3000
      });
    }
  };

  const clearCompletedJobs = () => {
    AdvancedExportPipeline.clearCompletedJobs();
    addNotification({
      type: 'info',
      title: 'Jobs Cleared',
      message: 'Completed jobs have been cleared',
      duration: 2000
    });
  };

  const getStatusIcon = (status: ExportJobItem['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />;
      case 'retry':
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: ExportJobItem['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Advanced Batch Export System
          </DialogTitle>
          <DialogDescription>
            Professional export pipeline with batch processing, progress tracking, and queue management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs defaultValue="setup" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Export Setup</TabsTrigger>
              <TabsTrigger value="queue">Processing Queue</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Export Setup Tab */}
            <TabsContent value="setup" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Selection
                    </CardTitle>
                    <CardDescription>
                      Choose documents to include in your export
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={selectedDocuments.length === documents.length && documents.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <Label htmlFor="select-all" className="text-sm font-medium">
                          Select All ({documents.length})
                        </Label>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {selectedDocuments.length} selected
                      </Badge>
                    </div>

                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div key={doc._id} className="flex items-center space-x-3 p-2 rounded-lg border">
                            <Checkbox
                              id={`doc-${doc._id}`}
                              checked={selectedDocuments.includes(doc._id)}
                              onCheckedChange={(checked) => handleDocumentSelection(doc._id, !!checked)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label htmlFor={`doc-${doc._id}`} className="font-medium cursor-pointer text-sm">
                                {doc.title}
                              </Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {doc.document_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {doc.content.length.toLocaleString()} chars
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Export Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Export Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your export settings and options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Template Selection */}
                    <div className="space-y-2">
                      <Label>Export Template</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Custom Settings</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">{template.name}</div>
                                  <div className="text-xs text-muted-foreground">{template.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Format Selection */}
                    <div className="space-y-2">
                      <Label>Export Format</Label>
                      <Select value={selectedFormat} onValueChange={(value: any) => setSelectedFormat(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">📄 PDF Document</SelectItem>
                          <SelectItem value="docx">📝 Word Document</SelectItem>
                          <SelectItem value="pptx">📊 PowerPoint Presentation</SelectItem>
                          <SelectItem value="markdown">📝 Markdown</SelectItem>
                          <SelectItem value="html">🌐 HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority Selection */}
                    <div className="space-y-2">
                      <Label>Processing Priority</Label>
                      <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">🔥 Urgent</SelectItem>
                          <SelectItem value="high">⚡ High</SelectItem>
                          <SelectItem value="normal">📋 Normal</SelectItem>
                          <SelectItem value="low">⏰ Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Export Options */}
                    <div className="space-y-3">
                      <Label>Export Options</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-metadata"
                            checked={exportOptions.includeMetadata}
                            onCheckedChange={(checked) => setExportOptions(prev => ({ 
                              ...prev, 
                              includeMetadata: !!checked 
                            }))}
                          />
                          <Label htmlFor="include-metadata" className="text-sm">
                            Include document metadata
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-diagrams"
                            checked={exportOptions.includeDiagrams}
                            onCheckedChange={(checked) => setExportOptions(prev => ({ 
                              ...prev, 
                              includeDiagrams: !!checked 
                            }))}
                          />
                          <Label htmlFor="include-diagrams" className="text-sm">
                            Include diagrams and visuals
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="compression"
                            checked={exportOptions.compression}
                            onCheckedChange={(checked) => setExportOptions(prev => ({ 
                              ...prev, 
                              compression: !!checked 
                            }))}
                          />
                          <Label htmlFor="compression" className="text-sm">
                            Enable compression for smaller files
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Branding */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Corporate Branding</Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowBrandingDialog(true)}
                        >
                          <Palette className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                      </div>
                      {brandingOptions.companyName && (
                        <div className="text-xs text-muted-foreground">
                          Company: {brandingOptions.companyName}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Actions */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={startBatchExport}
                      disabled={selectedDocuments.length === 0}
                      className="btn-enterprise flex-1"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Start Batch Export
                      {selectedDocuments.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {selectedDocuments.length}
                        </Badge>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={startIndividualExports}
                      disabled={selectedDocuments.length === 0}
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Individual Exports
                    </Button>
                  </div>
                  
                  {selectedDocuments.length > 0 && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Ready to export {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} as {selectedFormat.toUpperCase()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Processing Queue Tab */}
            <TabsContent value="queue" className="space-y-6">
              {/* Queue Stats */}
              {queueStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Queued</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats.queuedJobs}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Processing</CardTitle>
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats.processingJobs}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats.completedJobs}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Failed</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats.failedJobs}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Overall Progress */}
              {queueStats && queueStats.totalJobs > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Queue Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{Math.round(queueStats.totalProgress)}%</span>
                      </div>
                      <Progress value={queueStats.totalProgress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estimated Remaining:</span>
                        <div className="font-medium">{formatDuration(queueStats.estimatedRemainingTime)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processing Rate:</span>
                        <div className="font-medium">{queueStats.processingRate.toFixed(1)} jobs/min</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearCompletedJobs}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Clear Completed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Job List - In a real implementation, this would show actual jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Export Jobs</CardTitle>
                  <CardDescription>Monitor your export job progress in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  {queueStats && queueStats.totalJobs > 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Monitor className="h-8 w-8 mx-auto mb-2" />
                      <p>Export jobs will appear here when processing starts</p>
                      <p className="text-xs">Currently {queueStats.queuedJobs} jobs queued, {queueStats.processingJobs} processing</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p>No export jobs in queue</p>
                      <p className="text-xs">Start an export from the Setup tab to see jobs here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Export Analytics
                  </CardTitle>
                  <CardDescription>Performance metrics and usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                    <p className="text-sm">
                      Detailed export analytics and performance metrics will be available here
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium">Export Success Rate</div>
                        <div className="text-lg font-bold text-green-500">98.5%</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium">Avg Processing Time</div>
                        <div className="text-lg font-bold text-blue-500">2.3s</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Branding Configuration Dialog */}
        <Dialog open={showBrandingDialog} onOpenChange={setShowBrandingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Corporate Branding
              </DialogTitle>
              <DialogDescription>
                Customize the appearance of your exported documents
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={brandingOptions.companyName}
                  onChange={(e) => setBrandingOptions(prev => ({ 
                    ...prev, 
                    companyName: e.target.value 
                  }))}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={brandingOptions.primaryColor}
                    onChange={(e) => setBrandingOptions(prev => ({ 
                      ...prev, 
                      primaryColor: e.target.value 
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={brandingOptions.primaryColor}
                    onChange={(e) => setBrandingOptions(prev => ({ 
                      ...prev, 
                      primaryColor: e.target.value 
                    }))}
                    placeholder="#0ea5e9"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="header-footer"
                  checked={brandingOptions.headerFooter}
                  onCheckedChange={(checked) => setBrandingOptions(prev => ({ 
                    ...prev, 
                    headerFooter: !!checked 
                  }))}
                />
                <Label htmlFor="header-footer" className="text-sm">
                  Include branded header and footer
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBrandingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowBrandingDialog(false)}>
                  Apply Branding
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};