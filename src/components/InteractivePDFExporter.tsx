import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, Download, Eye, Settings, Layers, 
  BookOpen, Users, Share2, Lock, Clock,
  FileImage, FileX, Zap, CheckCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface PDFExportOptions {
  template: 'executive' | 'detailed' | 'presentation' | 'custom';
  includeTableOfContents: boolean;
  includeDiagrams: boolean;
  includeWatermark: boolean;
  includeFooter: boolean;
  compressionLevel: 'high' | 'medium' | 'low';
  accessLevel: 'public' | 'confidential' | 'restricted';
  branding: 'kairos' | 'custom' | 'none';
  pageLayout: 'portrait' | 'landscape';
  fontSize: 'small' | 'medium' | 'large';
}

interface InteractivePDFExporterProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  onExportComplete?: (success: boolean, filename?: string) => void;
}

const InteractivePDFExporter: React.FC<InteractivePDFExporterProps> = ({
  project,
  documents,
  diagrams,
  onExportComplete
}) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [exportOptions, setExportOptions] = useState<PDFExportOptions>({
    template: 'executive',
    includeTableOfContents: true,
    includeDiagrams: true,
    includeWatermark: false,
    includeFooter: true,
    compressionLevel: 'medium',
    accessLevel: 'public',
    branding: 'kairos',
    pageLayout: 'portrait',
    fontSize: 'medium'
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const generatePDFContent = useCallback(() => {
    const { template, branding, includeTableOfContents } = exportOptions;
    
    // Generate comprehensive PDF content structure
    const content = {
      coverPage: generateCoverPage(),
      tableOfContents: includeTableOfContents ? generateTableOfContents() : null,
      executiveSummary: generateExecutiveSummary(),
      documents: generateDocumentSections(),
      diagrams: exportOptions.includeDiagrams ? generateDiagramSections() : null,
      appendices: generateAppendices()
    };
    
    return content;
  }, [exportOptions, project, documents, diagrams]);

  const generateCoverPage = () => ({
    title: project.name,
    subtitle: 'Strategic Document Portfolio',
    author: 'KAIROS Platform',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    confidentiality: exportOptions.accessLevel.toUpperCase(),
    version: '1.0'
  });

  const generateTableOfContents = () => {
    const sections = [
      { title: 'Executive Summary', page: 3 },
      { title: 'Project Overview', page: 4 },
      ...documents.map((doc, index) => ({
        title: doc.document_type.replace('_', ' ').toUpperCase(),
        page: 5 + index
      })),
      ...(diagrams.length > 0 ? [
        { title: 'Strategic Diagrams', page: 5 + documents.length }
      ] : []),
      { title: 'Appendices', page: 6 + documents.length + (diagrams.length > 0 ? 1 : 0) }
    ];
    return sections;
  };

  const generateExecutiveSummary = () => ({
    overview: project.problem_statement,
    keyMetrics: {
      documentsGenerated: documents.length,
      diagramsCreated: diagrams.length,
      lastUpdated: new Date().toLocaleDateString()
    },
    strategicHighlights: documents.slice(0, 3).map(doc => ({
      title: doc.document_type.replace('_', ' '),
      summary: doc.content.substring(0, 200) + '...'
    }))
  });

  const generateDocumentSections = () => {
    return documents.map(doc => ({
      title: doc.document_type.replace('_', ' ').toUpperCase(),
      type: doc.document_type,
      content: doc.content,
      generatedAt: doc.generated_at,
      wordCount: doc.content.split(' ').length,
      readingTime: Math.ceil(doc.content.split(' ').length / 200)
    }));
  };

  const generateDiagramSections = () => {
    if (!diagrams.length) return [];
    
    return diagrams.map(diagram => ({
      title: diagram.title,
      type: diagram.diagram_type,
      content: diagram.mermaid_code,
      createdAt: diagram.created_at,
      description: diagram.mermaid_code.substring(0, 200) + '...'
    }));
  };

  const generateAppendices = () => ({
    generationMetadata: {
      platform: 'KAIROS - Intelligent Strategic Document Platform',
      exportDate: new Date().toISOString(),
      version: '2.0',
      totalPages: calculateTotalPages()
    },
    contactInformation: {
      platform: 'KAIROS',
      website: 'https://kairos.devv.ai',
      support: 'support@kairos.devv.ai'
    }
  });

  const calculateTotalPages = () => {
    let pages = 3; // Cover, TOC, Executive Summary
    pages += documents.length;
    if (exportOptions.includeDiagrams && diagrams.length > 0) {
      pages += Math.ceil(diagrams.length / 2);
    }
    pages += 1; // Appendices
    return pages;
  };

  const handleExport = async () => {
    if (!documents.length) {
      toast({
        title: "No Documents",
        description: "Please generate some documents before exporting to PDF.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Generate PDF content
      const pdfContent = generatePDFContent();
      setExportProgress(20);

      // Create PDF document
      const pdf = new jsPDF({
        orientation: exportOptions.pageLayout,
        unit: 'pt',
        format: 'a4'
      });

      // Add content sections progressively
      await addCoverPage(pdf, pdfContent.coverPage);
      setExportProgress(40);

      if (pdfContent.tableOfContents) {
        await addTableOfContents(pdf, pdfContent.tableOfContents);
        setExportProgress(50);
      }

      await addExecutiveSummary(pdf, pdfContent.executiveSummary);
      setExportProgress(60);

      await addDocumentSections(pdf, pdfContent.documents);
      setExportProgress(80);

      if (pdfContent.diagrams) {
        await addDiagramSections(pdf, pdfContent.diagrams);
        setExportProgress(90);
      }

      await addAppendices(pdf, pdfContent.appendices);

      // Add watermark if requested
      if (exportOptions.includeWatermark) {
        await addWatermark(pdf);
      }

      setExportProgress(100);

      const filename = `KAIROS_${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      toast({
        title: "Export Successful",
        description: `PDF exported as ${filename}`,
      });

      onExportComplete?.(true, filename);

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your PDF. Please try again.",
        variant: "destructive"
      });
      onExportComplete?.(false);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const addCoverPage = async (pdf: jsPDF, coverData: any) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add branding
    if (exportOptions.branding === 'kairos') {
      pdf.setFontSize(48);
      pdf.setTextColor(34, 47, 62);
      pdf.text('KAIROS', 60, 120);
      
      pdf.setFontSize(16);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Intelligent Strategic Document Platform', 60, 150);
    }

    // Add title
    pdf.setFontSize(32);
    pdf.setTextColor(0, 0, 0);
    const titleY = 220;
    pdf.text(coverData.title, 60, titleY, { maxWidth: pageWidth - 120 });

    // Add subtitle
    pdf.setFontSize(18);
    pdf.setTextColor(100, 116, 139);
    pdf.text(coverData.subtitle, 60, titleY + 40);

    // Add metadata
    pdf.setFontSize(12);
    pdf.text(`Generated: ${coverData.date}`, 60, pageHeight - 100);

    if (exportOptions.accessLevel !== 'public') {
      pdf.setFontSize(12);
      pdf.setTextColor(239, 68, 68);
      pdf.text(`${coverData.confidentiality}`, pageWidth - 150, pageHeight - 100);
    }

    pdf.addPage();
  };

  const addTableOfContents = async (pdf: jsPDF, tocData: any[]) => {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Table of Contents', 60, 80);

    let yPosition = 120;
    pdf.setFontSize(12);

    tocData.forEach((item, index) => {
      if (yPosition > 700) {
        pdf.addPage();
        yPosition = 80;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.text(item.title, 60, yPosition);
      
      // Add dots
      const titleWidth = pdf.getTextWidth(item.title);
      const pageNumWidth = pdf.getTextWidth(item.page.toString());
      const dotsWidth = pdf.internal.pageSize.getWidth() - 120 - titleWidth - pageNumWidth;
      const dotsCount = Math.floor(dotsWidth / 5);
      const dots = '.'.repeat(Math.max(0, dotsCount));
      
      pdf.text(dots, 60 + titleWidth + 5, yPosition);
      pdf.text(item.page.toString(), pdf.internal.pageSize.getWidth() - 60 - pageNumWidth, yPosition);
      
      yPosition += 20;
    });

    pdf.addPage();
  };

  const addExecutiveSummary = async (pdf: jsPDF, summaryData: any) => {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', 60, 80);

    let yPosition = 120;

    // Add overview
    pdf.setFontSize(16);
    pdf.text('Project Overview', 60, yPosition);
    yPosition += 30;

    pdf.setFontSize(12);
    const overviewLines = pdf.splitTextToSize(summaryData.overview, 500);
    pdf.text(overviewLines, 60, yPosition);
    yPosition += overviewLines.length * 15 + 20;

    // Add key metrics
    pdf.setFontSize(16);
    pdf.text('Key Metrics', 60, yPosition);
    yPosition += 30;

    pdf.setFontSize(12);
    pdf.text(`Documents Generated: ${summaryData.keyMetrics.documentsGenerated}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Diagrams Created: ${summaryData.keyMetrics.diagramsCreated}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Last Updated: ${summaryData.keyMetrics.lastUpdated}`, 60, yPosition);
    yPosition += 30;

    // Add strategic highlights
    if (summaryData.strategicHighlights.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Strategic Highlights', 60, yPosition);
      yPosition += 30;

      pdf.setFontSize(12);
      summaryData.strategicHighlights.forEach((highlight: any, index: number) => {
        if (yPosition > 700) {
          pdf.addPage();
          yPosition = 80;
        }

        pdf.setFontSize(14);
        pdf.text(`${index + 1}. ${highlight.title}`, 60, yPosition);
        yPosition += 20;

        pdf.setFontSize(12);
        const summaryLines = pdf.splitTextToSize(highlight.summary, 500);
        pdf.text(summaryLines, 80, yPosition);
        yPosition += summaryLines.length * 15 + 15;
      });
    }

    pdf.addPage();
  };

  const addDocumentSections = async (pdf: jsPDF, documentsData: any[]) => {
    for (const doc of documentsData) {
      pdf.setFontSize(24);
      pdf.setTextColor(0, 0, 0);
      pdf.text(doc.title, 60, 80);

      let yPosition = 120;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Type: ${doc.type} | Generated: ${doc.generatedAt} | Words: ${doc.wordCount} | Reading Time: ${doc.readingTime} min`, 60, yPosition);
      yPosition += 30;

      // Add content
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      const contentLines = pdf.splitTextToSize(doc.content, 500);
      const linesPerPage = 35;

      for (let i = 0; i < contentLines.length; i += linesPerPage) {
        if (i > 0) {
          pdf.addPage();
          yPosition = 80;
        }
        
        const pageLines = contentLines.slice(i, i + linesPerPage);
        pdf.text(pageLines, 60, yPosition);
      }

      pdf.addPage();
    }
  };

  const addDiagramSections = async (pdf: jsPDF, diagramsData: any[]) => {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Strategic Diagrams', 60, 80);

    let yPosition = 120;

    for (const diagram of diagramsData) {
      if (yPosition > 600) {
        pdf.addPage();
        yPosition = 80;
      }

      // Add diagram title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(diagram.title, 60, yPosition);
      yPosition += 30;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Type: ${diagram.type} | Created: ${diagram.createdAt}`, 60, yPosition);
      yPosition += 20;

      // Add description if available
      if (diagram.description) {
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        const descLines = pdf.splitTextToSize(diagram.description, 500);
        pdf.text(descLines, 60, yPosition);
        yPosition += descLines.length * 15 + 20;
      }

      // Placeholder for actual diagram rendering
      pdf.setFillColor(248, 250, 252);
      pdf.rect(60, yPosition, 480, 200, 'F');
      pdf.setTextColor(148, 163, 184);
      pdf.text('Diagram would be rendered here', 240, yPosition + 100, { align: 'center' });
      
      yPosition += 220;
    }

    pdf.addPage();
  };

  const addAppendices = async (pdf: jsPDF, appendicesData: any) => {
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Appendices', 60, 80);

    let yPosition = 120;

    // Generation metadata
    pdf.setFontSize(16);
    pdf.text('Generation Metadata', 60, yPosition);
    yPosition += 30;

    pdf.setFontSize(12);
    pdf.text(`Platform: ${appendicesData.generationMetadata.platform}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Export Date: ${new Date(appendicesData.generationMetadata.exportDate).toLocaleString()}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Version: ${appendicesData.generationMetadata.version}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Total Pages: ${appendicesData.generationMetadata.totalPages}`, 60, yPosition);
    yPosition += 40;

    // Contact information
    pdf.setFontSize(16);
    pdf.text('Contact Information', 60, yPosition);
    yPosition += 30;

    pdf.setFontSize(12);
    pdf.text(`Platform: ${appendicesData.contactInformation.platform}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Website: ${appendicesData.contactInformation.website}`, 60, yPosition);
    yPosition += 20;
    pdf.text(`Support: ${appendicesData.contactInformation.support}`, 60, yPosition);
  };

  const addPageHeader = async (pdf: jsPDF, title: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('KAIROS Strategic Document', 60, 30);
    pdf.text(title.substring(0, 50) + (title.length > 50 ? '...' : ''), pageWidth - 60, 50, { align: 'right' });
  };

  const addWatermark = async (pdf: jsPDF) => {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      pdf.setFontSize(72);
      pdf.setTextColor(148, 163, 184);
      
      // Rotate and center watermark
      pdf.text('KAIROS', pageWidth / 2, pageHeight / 2, {
        angle: 45,
        align: 'center'
      });
    }
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  return (
    <Card className="card-enterprise">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Interactive PDF Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Options */}
        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Template Style</label>
                <Select 
                  value={exportOptions.template} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, template: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="presentation">Presentation Mode</SelectItem>
                    <SelectItem value="custom">Custom Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Page Layout</label>
                <Select 
                  value={exportOptions.pageLayout} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, pageLayout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="toc"
                  checked={exportOptions.includeTableOfContents}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeTableOfContents: !!checked }))
                  }
                />
                <label htmlFor="toc" className="text-sm font-medium">Include Table of Contents</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="diagrams"
                  checked={exportOptions.includeDiagrams}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeDiagrams: !!checked }))
                  }
                />
                <label htmlFor="diagrams" className="text-sm font-medium">Include Diagrams</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="footer"
                  checked={exportOptions.includeFooter}
                  onCheckedChange={(checked) => 
                    setExportOptions(prev => ({ ...prev, includeFooter: !!checked }))
                  }
                />
                <label htmlFor="footer" className="text-sm font-medium">Include Page Footers</label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Branding</label>
                <Select 
                  value={exportOptions.branding} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, branding: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kairos">KAIROS Branding</SelectItem>
                    <SelectItem value="custom">Custom Branding</SelectItem>
                    <SelectItem value="none">No Branding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <Select 
                  value={exportOptions.fontSize} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, fontSize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="watermark"
                checked={exportOptions.includeWatermark}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeWatermark: !!checked }))
                }
              />
              <label htmlFor="watermark" className="text-sm font-medium">Add KAIROS Watermark</label>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Access Level</label>
              <Select 
                value={exportOptions.accessLevel} 
                onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, accessLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Compression Level</label>
              <Select 
                value={exportOptions.compressionLevel} 
                onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, compressionLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Best Quality)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Smallest Size)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diagrams</p>
                  <p className="text-2xl font-bold">{diagrams.length}</p>
                </div>
                <Layers className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Pages</p>
                  <p className="text-2xl font-bold">{calculateTotalPages()}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generating PDF...</span>
              <span className="text-sm text-muted-foreground">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handlePreview}
            disabled={!documents.length}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview PDF
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || !documents.length}
            className="btn-enterprise flex-1"
          >
            {isExporting ? (
              <Clock className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewMode} onOpenChange={setPreviewMode}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>PDF Preview</DialogTitle>
            </DialogHeader>
            <div ref={previewRef} className="space-y-6 p-6 bg-white text-black">
              {/* Preview content would be rendered here */}
              <div className="text-center py-20 text-muted-foreground">
                <FileImage className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>PDF preview will be displayed here</p>
                <p className="text-sm">This would show the actual PDF layout with all content and diagrams</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InteractivePDFExporter;