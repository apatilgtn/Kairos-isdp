import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, ShoppingCart, Scale, CheckCircle, Info } from 'lucide-react';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, RoadmapDocument } from '@/types';

interface RFPTabProps {
  project: MVPProject;
}

export function RFPTab({ project }: RFPTabProps) {
  const { toast } = useToast();
  const { documents, setDocuments } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Find existing RFP document
  const rfpDoc = documents.find(
    doc => doc.project_id === project._id && doc.document_type === 'rfp'
  );

  const handleGenerateRFP = async (retryAttempt = 0) => {
    setIsGenerating(true);
    try {


      toast({
        title: "Generating RFP Document",
        description: "Creating comprehensive request for proposal for vendor selection...",
      });

      const response = await APIService.generateRFP(project);

      if (response.success && response.content) {
        // Save the generated document
        const newDocument: RoadmapDocument = {
          _id: `rfp_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'rfp',
          title: `RFP: ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'procurement'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = documents.filter(doc => !(doc.project_id === project._id && doc.document_type === 'rfp'));
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        toast({
          title: "RFP Generated Successfully",
          description: "Your comprehensive request for proposal is ready for distribution.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate RFP');
      }
    } catch (error) {
      console.error('RFP generation failed:', error);
      
      // Retry logic for temporary failures
      if (retryAttempt < 2 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('rate limit'))) {
        toast({
          title: "Retrying Generation",
          description: `Generation failed, retrying attempt ${retryAttempt + 2}/3...`,
        });
        setTimeout(() => handleGenerateRFP(retryAttempt + 1), 2000);
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate RFP. Please try again or check the Test AI page for troubleshooting.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateComparison = async () => {
    try {
      toast({
        title: "Generating RFP vs RFQ Comparison",
        description: "Analyzing optimal procurement approach for your project...",
      });

      const response = await APIService.generateProcurementComparison(project);

      if (response.success && response.content) {
        // Save the comparison as a special document
        const newDocument: RoadmapDocument = {
          _id: `rfp_comp_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'rfp',
          title: `Procurement Analysis: RFP vs RFQ for ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'procurement'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = [...documents];
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        setShowComparison(true);
        toast({
          title: "Procurement Comparison Generated",
          description: "Your RFP vs RFQ analysis is ready.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate comparison');
      }
    } catch (error) {
      toast({
        title: "Comparison Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate comparison",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!rfpDoc) return;

    try {
      const result = await APIService.exportDocument(rfpDoc, format);
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${rfpDoc.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `RFP document exported as ${format.toUpperCase()}`,
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
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            Request for Proposal (RFP)
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive vendor solicitation document for solution development
          </p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Procurement & Planning
        </Badge>
      </div>

      {/* RFP vs RFQ Comparison Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-900">RFP vs RFQ Decision Guide</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateComparison}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Scale className="h-4 w-4 mr-1" />
              Generate Comparison
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">RFP (Request for Proposal)</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• Focus: Solution & Value 💡</li>
                <li>• When: Open to different solutions</li>
                <li>• Decision: Technical merit + price</li>
                <li>• Timeline: 9-13 weeks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">RFQ (Request for Quotation)</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• Focus: Price 💲</li>
                <li>• When: Clear, specific requirements</li>
                <li>• Decision: Lowest qualified price</li>
                <li>• Timeline: 4-7 weeks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generation Section */}
      {!rfpDoc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate RFP Document
            </CardTitle>
            <CardDescription>
              Create a comprehensive request for proposal that attracts qualified vendors 
              and facilitates effective vendor selection based on value and capability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Project Requirements</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Detailed functional requirements</li>
                    <li>• Technical specifications</li>
                    <li>• Performance and security standards</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Evaluation Criteria</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Weighted scoring methodology</li>
                    <li>• Technical approach assessment</li>
                    <li>• Vendor qualifications review</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium">Vendor Requirements</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Minimum qualifications</li>
                    <li>• Portfolio and reference requirements</li>
                    <li>• Proposal format specifications</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium">Process & Timeline</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Complete procurement timeline</li>
                    <li>• Vendor Q&A and presentation process</li>
                    <li>• Contract terms and conditions</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => handleGenerateRFP(0)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating RFP Document...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Generate RFP Document
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
                  <CardTitle className="text-base">{rfpDoc.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(rfpDoc.generated_at).toLocaleDateString()} • 
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready for Distribution
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
                    onClick={() => handleGenerateRFP(0)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-1" />
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
              <CardTitle className="text-base">RFP Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {rfpDoc.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}