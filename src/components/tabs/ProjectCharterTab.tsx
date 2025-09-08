import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, Shield, Users, Target, CheckCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, RoadmapDocument } from '@/types';

interface ProjectCharterTabProps {
  project: MVPProject;
}

export function ProjectCharterTab({ project }: ProjectCharterTabProps) {
  const { toast } = useToast();
  const { documents, setDocuments } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Find existing project charter document
  const charterDoc = documents.find(
    doc => doc.project_id === project._id && doc.document_type === 'project_charter'
  );

  const handleGenerateProjectCharter = async (retryAttempt = 0) => {
    setIsGenerating(true);
    try {


      toast({
        title: "Generating Project Charter",
        description: "Creating formal project authorization and governance framework...",
      });

      const response = await APIService.generateProjectCharter(project);

      if (response.success && response.content) {
        // Save the generated document
        const newDocument: RoadmapDocument = {
          _id: `pc_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'project_charter',
          title: `Project Charter: ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'definition'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = documents.filter(doc => !(doc.project_id === project._id && doc.document_type === 'project_charter'));
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        toast({
          title: "Project Charter Generated Successfully",
          description: "Your formal project authorization document is ready.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate project charter');
      }
    } catch (error) {
      console.error('Project charter generation failed:', error);
      
      // Retry logic for temporary failures
      if (retryAttempt < 2 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('rate limit'))) {
        toast({
          title: "Retrying Generation",
          description: `Generation failed, retrying attempt ${retryAttempt + 2}/3...`,
        });
        setTimeout(() => handleGenerateProjectCharter(retryAttempt + 1), 2000);
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate project charter. Please try again or check the Test AI page for troubleshooting.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!charterDoc) return;

    try {
      const result = await APIService.exportDocument(charterDoc, format);
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${charterDoc.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Project charter exported as ${format.toUpperCase()}`,
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
            <Shield className="h-5 w-5 text-purple-600" />
            Project Charter
          </h3>
          <p className="text-sm text-muted-foreground">
            Formal project authorization establishing governance, objectives, and project manager authority
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Definition & Authority
        </Badge>
      </div>

      {/* Generation Section */}
      {!charterDoc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Project Charter
            </CardTitle>
            <CardDescription>
              Create formal project authorization that establishes the project manager's authority, 
              defines success criteria, and provides governance framework for project execution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Project Objectives</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• SMART objectives and success criteria</li>
                    <li>• Key performance indicators (KPIs)</li>
                    <li>• Business value and strategic alignment</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Authority & Governance</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Project manager authority levels</li>
                    <li>• Budget and resource authorization</li>
                    <li>• Decision-making framework</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <h4 className="font-medium">Stakeholder Framework</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Stakeholder identification and roles</li>
                    <li>• Communication and engagement plan</li>
                    <li>• Approval and escalation processes</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium">Project Scope & Constraints</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• High-level scope definition</li>
                    <li>• Key assumptions and constraints</li>
                    <li>• Risk identification and response</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => handleGenerateProjectCharter(0)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Project Charter...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Generate Project Charter
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
                  <CardTitle className="text-base">{charterDoc.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(charterDoc.generated_at).toLocaleDateString()} • 
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Authorized
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
                    onClick={() => handleGenerateProjectCharter(0)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-1" />
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
              <CardTitle className="text-base">Project Charter Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {charterDoc.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}