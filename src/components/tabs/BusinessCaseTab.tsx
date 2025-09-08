import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, RoadmapDocument } from '@/types';

interface BusinessCaseTabProps {
  project: MVPProject;
}

export function BusinessCaseTab({ project }: BusinessCaseTabProps) {
  const { toast } = useToast();
  const { documents, setDocuments } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Find existing business case document
  const businessCaseDoc = documents.find(
    doc => doc.project_id === project._id && doc.document_type === 'business_case'
  );

  const handleGenerateBusinessCase = async (retryAttempt = 0) => {
    setIsGenerating(true);
    try {


      toast({
        title: "Generating Business Case",
        description: "Creating comprehensive business justification and ROI analysis...",
      });

      const response = await APIService.generateBusinessCase(project);

      if (response.success && response.content) {
        // Save the generated document
        const newDocument: RoadmapDocument = {
          _id: `bc_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'business_case',
          title: `Business Case: ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'justification'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = documents.filter(doc => !(doc.project_id === project._id && doc.document_type === 'business_case'));
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        toast({
          title: "Business Case Generated Successfully",
          description: "Your comprehensive business case with ROI analysis is ready.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate business case');
      }
    } catch (error) {
      console.error('Business case generation failed:', error);
      
      // Retry logic for temporary failures
      if (retryAttempt < 2 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('rate limit'))) {
        toast({
          title: "Retrying Generation",
          description: `Generation failed, retrying attempt ${retryAttempt + 2}/3...`,
        });
        setTimeout(() => handleGenerateBusinessCase(retryAttempt + 1), 2000);
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate business case. Please try again or check the Test AI page for troubleshooting.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!businessCaseDoc) return;

    try {
      const result = await APIService.exportDocument(businessCaseDoc, format);
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${businessCaseDoc.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Business case exported as ${format.toUpperCase()}`,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Business Case
          </h3>
          <p className="text-sm text-muted-foreground">
            Justify project investment with comprehensive ROI analysis and stakeholder benefits
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Justification Phase
        </Badge>
      </div>

      {/* Generation Section */}
      {!businessCaseDoc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Business Case
            </CardTitle>
            <CardDescription>
              Create a comprehensive business case that includes financial analysis, risk assessment, 
              and stakeholder benefits to secure project approval and funding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Financial Analysis
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ROI calculations and projections</li>
                    <li>• Cost-benefit analysis</li>
                    <li>• Break-even and payback period</li>
                    <li>• Investment requirements</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Risk Assessment
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Market and technical risks</li>
                    <li>• Mitigation strategies</li>
                    <li>• Risk-adjusted benefits</li>
                    <li>• Contingency planning</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => handleGenerateBusinessCase(0)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Business Case...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Business Case
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
                  <CardTitle className="text-base">{businessCaseDoc.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(businessCaseDoc.generated_at).toLocaleDateString()} • 
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
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
                    onClick={() => handleGenerateBusinessCase(0)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-1" />
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
              <CardTitle className="text-base">Business Case Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {businessCaseDoc.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}