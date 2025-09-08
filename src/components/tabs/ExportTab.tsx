import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';
import InteractivePDFExporter from '@/components/InteractivePDFExporter';
import StakeholderPresentation from '@/components/StakeholderPresentation';
import AdvancedStakeholderPresentation from '@/components/AdvancedStakeholderPresentation';
import PresentationSettings from '@/components/PresentationSettings';
import { DocumentAnalysisEngine } from '@/components/DocumentAnalysisEngine';
import { AdvancedBatchExporter } from '@/components/AdvancedBatchExporter';
import { saveAs } from 'file-saver';
import { 
  Download, 
  FileText, 
  Image,
  Share2,
  Copy,
  Loader2,
  CheckCircle2,
  Calendar,
  FileImage,
  Eye,
  FileDown,
  Package,
  Sparkles,
  Presentation,
  Users,
  Zap,
  Brain,
  BarChart3,
  Cpu
} from 'lucide-react';
import type { MVPProject, RoadmapDocument, UserDiagram, ExportOptions } from '@/types';

interface ExportTabProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
}

export const ExportTab: React.FC<ExportTabProps> = ({
  project,
  documents,
  diagrams
}) => {
  const { addNotification } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'markdown',
    includeTitle: true,
    includeMetadata: true
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedDiagrams, setSelectedDiagrams] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [showAdvancedPresentation, setShowAdvancedPresentation] = useState(false);
  const [showPresentationSettings, setShowPresentationSettings] = useState(false);
  const [showInteractivePDF, setShowInteractivePDF] = useState(false);
  const [presentationConfig, setPresentationConfig] = useState<any>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [showDocumentAnalysis, setShowDocumentAnalysis] = useState(false);
  const [showAdvancedBatchExporter, setShowAdvancedBatchExporter] = useState(false);
  const [selectedDocumentForAnalysis, setSelectedDocumentForAnalysis] = useState<RoadmapDocument | null>(null);

  const handleDocumentSelection = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => 
      checked 
        ? [...prev, documentId]
        : prev.filter(id => id !== documentId)
    );
  };

  const handleDiagramSelection = (diagramId: string, checked: boolean) => {
    setSelectedDiagrams(prev => 
      checked 
        ? [...prev, diagramId]
        : prev.filter(id => id !== diagramId)
    );
  };

  const handleSelectAllDocuments = (checked: boolean) => {
    setSelectedDocuments(checked ? documents.map(doc => doc._id) : []);
  };

  const handleSelectAllDiagrams = (checked: boolean) => {
    setSelectedDiagrams(checked ? diagrams.map(diagram => diagram._id) : []);
  };

  const generateExportContent = () => {
    let content = '';

    // Title and metadata
    if (exportOptions.includeTitle) {
      content += `# ${project.name}\n\n`;
    }

    if (exportOptions.includeMetadata) {
      content += `**Industry:** ${project.industry}\n`;
      content += `**Created:** ${new Date(project.created_at).toLocaleDateString()}\n`;
      content += `**Last Updated:** ${new Date(project.updated_at).toLocaleDateString()}\n`;
      content += `**Status:** ${project.status}\n\n`;
      content += `## Problem Statement\n\n${project.problem_statement}\n\n`;
      content += `---\n\n`;
    }

    // Documents
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc._id));
    if (selectedDocs.length > 0) {
      content += `## Generated Documents\n\n`;
      selectedDocs.forEach(doc => {
        content += `### ${doc.title}\n\n`;
        content += `*Generated on ${new Date(doc.generated_at).toLocaleDateString()}*\n\n`;
        content += `${doc.content}\n\n`;
        content += `---\n\n`;
      });
    }

    // Diagrams
    const selectedDiags = diagrams.filter(diagram => selectedDiagrams.includes(diagram._id));
    if (selectedDiags.length > 0) {
      content += `## Diagrams\n\n`;
      selectedDiags.forEach(diagram => {
        content += `### ${diagram.title}\n\n`;
        content += `*Type: ${diagram.diagram_type.replace('_', ' ')} | Created: ${new Date(diagram.created_at).toLocaleDateString()}*\n\n`;
        content += `\`\`\`mermaid\n${diagram.mermaid_code}\n\`\`\`\n\n`;
        content += `---\n\n`;
      });
    }

    return content;
  };

  const handleExport = async () => {
    if (selectedDocuments.length === 0 && selectedDiagrams.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nothing Selected',
        message: 'Please select at least one document or diagram to export.',
        duration: 3000
      });
      return;
    }

    setIsExporting(true);
    try {
      const content = generateExportContent();
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}`;

      if (exportOptions.format === 'markdown') {
        // Download as Markdown
        await downloadFile(content, `${filename}.md`, 'text/markdown');
      } else if (exportOptions.format === 'pdf' || exportOptions.format === 'docx') {
        // Use API service for advanced formats
        const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc._id));
        
        if (selectedDocs.length > 0) {
          // Export each selected document individually
          for (const doc of selectedDocs) {
            try {
              console.log(`Exporting document: ${doc.title} as ${exportOptions.format}`);
              const exported = await APIService.exportDocument(doc, exportOptions.format as 'docx' | 'pdf');
              
              if (exported.success && exported.blob) {
                const docFilename = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${exportOptions.format}`;
                await downloadBlob(exported.blob, docFilename);
                
                addNotification({
                  type: 'success',
                  title: 'Document Exported',
                  message: `${doc.title} exported successfully as ${exportOptions.format.toUpperCase()}`,
                  duration: 3000
                });
              } else {
                throw new Error(exported.error || 'Export failed');
              }
            } catch (error) {
              console.error(`Failed to export ${doc.title}:`, error);
              addNotification({
                type: 'error',
                title: 'Export Failed',
                message: `Failed to export ${doc.title}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                duration: 5000
              });
            }
          }
        } else {
          // Export entire project as single file
          const projectDoc: RoadmapDocument = {
            _id: 'project-export',
            _uid: project._uid,
            _tid: project._tid,
            title: project.name,
            content: content,
            document_type: 'roadmap' as const,
            project_id: project._id,
            generated_at: Date.now(),
            status: 'generated' as const
          };
          
          console.log(`Exporting project as ${exportOptions.format}`);
          const exported = await APIService.exportDocument(projectDoc, exportOptions.format as 'docx' | 'pdf');
          
          if (exported.success && exported.blob) {
            await downloadBlob(exported.blob, `${filename}.${exportOptions.format}`);
          } else {
            throw new Error(exported.error || 'Export failed');
          }
        }
      }

      if (exportOptions.format === 'markdown' || (selectedDocuments.length === 0 && selectedDiagrams.length > 0)) {
        addNotification({
          type: 'success',
          title: 'Export Successful!',
          message: `Your content has been exported as ${exportOptions.format.toUpperCase()}.`,
          duration: 5000
        });
      }

    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: `Could not export the content: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        duration: 5000
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to download text content as file
  const downloadFile = async (content: string, filename: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      await downloadBlob(blob, filename);
    } catch (error) {
      throw new Error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to download blob as file
  const downloadBlob = async (blob: Blob, filename: string) => {
    try {
      // Use the modern File System Access API if available for better UX
      if ('showSaveFilePicker' in window) {
        try {
          const fileExtension = filename.split('.').pop()?.toLowerCase();
          const acceptTypes: Record<string, string[]> = {
            'md': ['.md'],
            'docx': ['.docx'],
            'pdf': ['.pdf']
          };
          
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{
              description: 'Document files',
              accept: {
                'text/markdown': acceptTypes.md || ['.md'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': acceptTypes.docx || ['.docx'],
                'application/pdf': acceptTypes.pdf || ['.pdf']
              }
            }]
          });
          
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          console.log(`File saved successfully: ${filename}`);
          return;
        } catch (fsError) {
          // User canceled or API failed, fall back to traditional download
          if ((fsError as Error).name !== 'AbortError') {
            console.log('File System Access API failed, falling back to file-saver');
          }
        }
      }
      
      // Use file-saver library as primary fallback (most reliable)
      try {
        saveAs(blob, filename);
        console.log(`File downloaded successfully: ${filename}`);
        return;
      } catch (fileSaverError) {
        console.log('File-saver failed, using traditional download method');
      }
      
      // Final fallback: traditional download method
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`File downloaded using traditional method: ${filename}`);
      
    } catch (error) {
      console.error('All download methods failed:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePreview = () => {
    if (selectedDocuments.length === 0 && selectedDiagrams.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nothing Selected',
        message: 'Please select items to preview.',
        duration: 3000
      });
      return;
    }
    
    const content = generateExportContent();
    setPreviewContent(content);
    setShowPreview(true);
  };

  const handleCopyContent = async () => {
    if (selectedDocuments.length === 0 && selectedDiagrams.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Nothing Selected',
        message: 'Please select content to copy.',
        duration: 3000
      });
      return;
    }

    try {
      const content = generateExportContent();
      await navigator.clipboard.writeText(content);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Content copied to clipboard.',
        duration: 2000
      });
    } catch (error) {
      console.error('Copy failed:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy content to clipboard.',
        duration: 3000
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Export & Share</h2>
        <p className="text-muted-foreground">
          Export your MVP roadmap in multiple formats for sharing with stakeholders
        </p>
      </div>

      <div className="space-y-6">
        {/* Enhanced Export Options */}
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="standard">Standard Export</TabsTrigger>
            <TabsTrigger value="batch">Advanced Batch</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="interactive">Interactive PDF</TabsTrigger>
            <TabsTrigger value="presentation">Presentation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Standard Export Options */}
              <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-primary" />
                <span>Export Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your export preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="format">Export Format</Label>
                <Select 
                  value={exportOptions.format}
                  onValueChange={(value) => setExportOptions(prev => ({ 
                    ...prev, 
                    format: value as ExportOptions['format'] 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Markdown (.md)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pdf">
                      <div className="flex items-center space-x-2">
                        <FileImage className="w-4 h-4" />
                        <span>PDF (.pdf)</span>
                        <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="docx">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Word (.docx)</span>
                        <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-title"
                      checked={exportOptions.includeTitle}
                      onCheckedChange={(checked) => setExportOptions(prev => ({ 
                        ...prev, 
                        includeTitle: !!checked 
                      }))}
                    />
                    <Label htmlFor="include-title" className="text-sm">
                      Project title and header
                    </Label>
                  </div>
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
                      Project metadata and problem statement
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={handlePreview}
                    disabled={selectedDocuments.length === 0 && selectedDiagrams.length === 0}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCopyContent}
                    disabled={selectedDocuments.length === 0 && selectedDiagrams.length === 0}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting || (selectedDocuments.length === 0 && selectedDiagrams.length === 0)}
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        MD
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const oldFormat = exportOptions.format;
                      setExportOptions(prev => ({ ...prev, format: 'docx' }));
                      handleExport();
                      setExportOptions(prev => ({ ...prev, format: oldFormat }));
                    }}
                    disabled={isExporting || (selectedDocuments.length === 0 && selectedDiagrams.length === 0)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    Word
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const oldFormat = exportOptions.format;
                      setExportOptions(prev => ({ ...prev, format: 'pdf' }));
                      handleExport();
                      setExportOptions(prev => ({ ...prev, format: oldFormat }));
                    }}
                    disabled={isExporting || (selectedDocuments.length === 0 && selectedDiagrams.length === 0)}
                  >
                    <FileDown className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

              {/* Content Selection for Standard Export */}
              <div className="space-y-6">
                {/* Documents Selection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Select Documents</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all-docs"
                          checked={selectedDocuments.length === documents.length && documents.length > 0}
                          onCheckedChange={handleSelectAllDocuments}
                        />
                        <Label htmlFor="select-all-docs" className="text-sm">
                          Select All
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No documents available</p>
                        <p className="text-xs">Generate content in the AI Roadmap tab</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {documents.map((doc) => (
                          <div key={doc._id} className="flex items-center space-x-3 p-3 rounded-lg border">
                            <Checkbox
                              id={`doc-${doc._id}`}
                              checked={selectedDocuments.includes(doc._id)}
                              onCheckedChange={(checked) => handleDocumentSelection(doc._id, !!checked)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`doc-${doc._id}`} className="font-medium cursor-pointer">
                                {doc.title}
                              </Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {doc.document_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(doc.generated_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Diagrams Selection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Select Diagrams</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all-diagrams"
                          checked={selectedDiagrams.length === diagrams.length && diagrams.length > 0}
                          onCheckedChange={handleSelectAllDiagrams}
                        />
                        <Label htmlFor="select-all-diagrams" className="text-sm">
                          Select All
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {diagrams.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No diagrams available</p>
                        <p className="text-xs">Create diagrams in the Diagrams tab</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {diagrams.map((diagram) => (
                          <div key={diagram._id} className="flex items-center space-x-3 p-3 rounded-lg border">
                            <Checkbox
                              id={`diagram-${diagram._id}`}
                              checked={selectedDiagrams.includes(diagram._id)}
                              onCheckedChange={(checked) => handleDiagramSelection(diagram._id, !!checked)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`diagram-${diagram._id}`} className="font-medium cursor-pointer">
                                {diagram.title}
                              </Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {diagram.diagram_type.replace('_', ' ')}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(diagram.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            {/* Advanced Batch Export */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Advanced Batch Export System
                </CardTitle>
                <CardDescription>
                  Enterprise-grade batch processing with progress tracking, queue management, and advanced formatting options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Cpu className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Parallel Processing</p>
                    <p className="text-sm text-muted-foreground">Multi-threaded export pipeline</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Progress Tracking</p>
                    <p className="text-sm text-muted-foreground">Real-time job monitoring</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Smart Queuing</p>
                    <p className="text-sm text-muted-foreground">Priority-based processing</p>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Enterprise Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Batch export multiple documents simultaneously</li>
                    <li>• Corporate branding and custom templates</li>
                    <li>• Advanced format options (PDF, Word, PowerPoint)</li>
                    <li>• Export queue management with retry logic</li>
                    <li>• Real-time progress tracking and notifications</li>
                  </ul>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={() => setShowAdvancedBatchExporter(true)}
                    className="btn-enterprise w-full"
                    disabled={documents.length === 0}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Open Advanced Batch Exporter
                  </Button>
                </div>
                
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Generate some documents first to use the batch export system
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* AI Document Analysis */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Document Analysis & Content Intelligence
                </CardTitle>
                <CardDescription>
                  Advanced AI-powered document analysis with quality scoring, content optimization, and stakeholder-specific recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Quality Scoring</p>
                    <p className="text-sm text-muted-foreground">AI-powered quality assessment</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Stakeholder Optimization</p>
                    <p className="text-sm text-muted-foreground">Audience-specific recommendations</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Content Intelligence</p>
                    <p className="text-sm text-muted-foreground">Cross-document insights</p>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Analysis Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Comprehensive quality and readability scoring</li>
                    <li>• Document relationship mapping and dependency analysis</li>
                    <li>• Content gap identification and recommendations</li>
                    <li>• Stakeholder-specific optimization suggestions</li>
                    <li>• Cross-document consistency checking</li>
                    <li>• Strategic alignment assessment</li>
                  </ul>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={() => setShowDocumentAnalysis(true)}
                    className="btn-enterprise w-full"
                    disabled={documents.length === 0}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Open AI Document Analysis
                  </Button>
                </div>
                
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Generate some documents first to analyze your content with AI
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interactive" className="space-y-6">
            {/* Interactive PDF Export */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Interactive PDF Export
                </CardTitle>
                <CardDescription>
                  Create professional PDF documents with embedded diagrams, navigation, and stakeholder-ready formatting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Professional Layout</p>
                    <p className="text-sm text-muted-foreground">Executive-ready formatting</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Image className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Embedded Diagrams</p>
                    <p className="text-sm text-muted-foreground">High-quality diagram rendering</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Interactive Navigation</p>
                    <p className="text-sm text-muted-foreground">Clickable table of contents</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    onClick={() => setShowInteractivePDF(true)}
                    className="btn-enterprise w-full"
                    disabled={documents.length === 0}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Interactive PDF
                  </Button>
                </div>
                
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Generate some documents first to create an interactive PDF
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="presentation" className="space-y-6">
            {/* Stakeholder Presentation */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-primary" />
                  Stakeholder Presentation Mode
                </CardTitle>
                <CardDescription>
                  Interactive presentation with executive summary, metrics, and professional slides for stakeholder reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Executive Mode</p>
                    <p className="text-sm text-muted-foreground">High-level strategic overview</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Auto-Advance</p>
                    <p className="text-sm text-muted-foreground">Timed slide progression</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Share2 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Fullscreen Mode</p>
                    <p className="text-sm text-muted-foreground">Professional presentation view</p>
                  </div>
                </div>
                
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Presentation Features:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Executive summary with key metrics</li>
                    <li>• Document highlights and recommendations</li>
                    <li>• Strategic diagrams with insights</li>
                    <li>• Next steps and call-to-action slides</li>
                  </ul>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => setShowPresentationMode(true)}
                    className="btn-enterprise w-full"
                    disabled={documents.length === 0}
                  >
                    <Presentation className="h-4 w-4 mr-2" />
                    Standard Presentation
                  </Button>
                  
                  <Button
                    onClick={() => setShowPresentationSettings(true)}
                    className="btn-enterprise w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70"
                    disabled={documents.length === 0}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Advanced Interactive Presentation
                  </Button>
                </div>
                
                {documents.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Generate some documents first to create a stakeholder presentation
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
      </div>

      {/* Export Summary */}
      {(selectedDocuments.length > 0 || selectedDiagrams.length > 0) && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Export Summary</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Ready to export {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} 
              {selectedDocuments.length > 0 && selectedDiagrams.length > 0 ? ' and ' : ''}
              {selectedDiagrams.length > 0 && `${selectedDiagrams.length} diagram${selectedDiagrams.length !== 1 ? 's' : ''}`}
              {' '}as {exportOptions.format.toUpperCase()}.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Export will include project created on {formatDate(project.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Export Preview</span>
            </DialogTitle>
            <DialogDescription>
              Review your content before exporting - {selectedDocuments.length + selectedDiagrams.length} items selected
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] mt-4">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {previewContent}
              </pre>
            </div>
          </ScrollArea>
          
          <div className="flex justify-between items-center mt-4">
            <Badge variant="secondary">
              {selectedDocuments.length + selectedDiagrams.length} items • {exportOptions.format.toUpperCase()} format
            </Badge>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button onClick={() => { setShowPreview(false); handleExport(); }}>
                <Download className="w-4 h-4 mr-2" />
                Export Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interactive PDF Exporter */}
      {showInteractivePDF && (
        <Dialog open={showInteractivePDF} onOpenChange={setShowInteractivePDF}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <InteractivePDFExporter
              project={project}
              documents={documents}
              diagrams={diagrams}
              onExportComplete={(success, filename) => {
                if (success) {
                  addNotification({
                    type: 'success',
                    title: 'Export Successful',
                    message: `Interactive PDF exported successfully${filename ? `: ${filename}` : ''}`
                  });
                }
                setShowInteractivePDF(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Stakeholder Presentation */}
      <StakeholderPresentation
        project={project}
        documents={documents}
        diagrams={diagrams}
        isOpen={showPresentationMode}
        onClose={() => setShowPresentationMode(false)}
      />

      {/* Advanced Interactive Stakeholder Presentation */}
      <AdvancedStakeholderPresentation
        project={project}
        documents={documents}
        diagrams={diagrams}
        isOpen={showAdvancedPresentation}
        onClose={() => setShowAdvancedPresentation(false)}
      />

      {/* Presentation Settings */}
      <PresentationSettings
        isOpen={showPresentationSettings}
        onClose={() => setShowPresentationSettings(false)}
        onStart={(config) => {
          setPresentationConfig(config);
          setShowAdvancedPresentation(true);
        }}
      />

      {/* AI Document Analysis */}
      {showDocumentAnalysis && (
        <Dialog open={showDocumentAnalysis} onOpenChange={setShowDocumentAnalysis}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DocumentAnalysisEngine
              project={project}
              documents={documents}
              diagrams={diagrams}
              selectedDocument={selectedDocumentForAnalysis}
              onDocumentSelect={setSelectedDocumentForAnalysis}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Advanced Batch Exporter */}
      <AdvancedBatchExporter
        project={project}
        documents={documents}
        diagrams={diagrams}
        isOpen={showAdvancedBatchExporter}
        onClose={() => setShowAdvancedBatchExporter(false)}
      />
    </div>
  );
};