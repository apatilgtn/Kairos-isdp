import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, Search, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, RoadmapDocument } from '@/types';

interface FeasibilityStudyTabProps {
  project: MVPProject;
}

export function FeasibilityStudyTab({ project }: FeasibilityStudyTabProps) {
  const { toast } = useToast();
  const { documents, setDocuments } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Find existing feasibility study document
  const feasibilityDoc = documents.find(
    doc => doc.project_id === project._id && doc.document_type === 'feasibility_study'
  );

  const handleGenerateFeasibilityStudy = async (retryAttempt = 0) => {
    setIsGenerating(true);
    try {


      toast({
        title: "Generating Feasibility Study",
        description: "Analyzing technical, financial, market, and operational feasibility...",
      });

      const response = await APIService.generateFeasibilityStudy(project);

      if (response.success && response.content) {
        // Save the generated document
        const newDocument: RoadmapDocument = {
          _id: `fs_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'feasibility_study',
          title: `Feasibility Study: ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'justification'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = documents.filter(doc => !(doc.project_id === project._id && doc.document_type === 'feasibility_study'));
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        toast({
          title: "Feasibility Study Generated Successfully",
          description: "Your comprehensive feasibility analysis is ready.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate feasibility study');
      }
    } catch (error) {
      console.error('Feasibility study generation failed:', error);
      
      // Retry logic for temporary failures
      if (retryAttempt < 2 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('rate limit'))) {
        toast({
          title: "Retrying Generation",
          description: `Generation failed, retrying attempt ${retryAttempt + 2}/3...`,
        });
        setTimeout(() => handleGenerateFeasibilityStudy(retryAttempt + 1), 2000);
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate feasibility study. Please try again or check the Test AI page for troubleshooting.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!feasibilityDoc) return;

    try {
      const result = await APIService.exportDocument(feasibilityDoc, format);
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${feasibilityDoc.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Feasibility study exported as ${format.toUpperCase()}`,
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export document",
        variant: "destructive",
      });
    }
  };

  const getFeasibilityIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Feasibility Study
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of technical, financial, market, and operational feasibility
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Justification Phase
        </Badge>
      </div>

      {/* Generation Section */}
      {!feasibilityDoc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Feasibility Study
            </CardTitle>
            <CardDescription>
              Analyze project viability across all critical dimensions to determine if the project 
              is practically achievable and should proceed to development.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getFeasibilityIcon('high')}
                    <h4 className="font-medium">Technical Feasibility</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Technology requirements analysis</li>
                    <li>• Development complexity assessment</li>
                    <li>• Infrastructure and integration needs</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getFeasibilityIcon('high')}
                    <h4 className="font-medium">Financial Feasibility</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Cost analysis and projections</li>
                    <li>• Revenue model viability</li>
                    <li>• ROI and break-even analysis</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getFeasibilityIcon('medium')}
                    <h4 className="font-medium">Market Feasibility</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Market size and opportunity</li>
                    <li>• Competitive landscape analysis</li>
                    <li>• Customer validation and demand</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getFeasibilityIcon('high')}
                    <h4 className="font-medium">Operational Feasibility</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Resource availability assessment</li>
                    <li>• Organizational impact analysis</li>
                    <li>• Process integration requirements</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => handleGenerateFeasibilityStudy(0)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Feasibility...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Generate Feasibility Study
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Document Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{feasibilityDoc.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(feasibilityDoc.generated_at).toLocaleDateString()} • 
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('docx')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Word
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateFeasibilityStudy(0)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-1" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feasibility Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {feasibilityDoc.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}