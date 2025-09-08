import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Loader2, Layers, CheckSquare, XSquare, CheckCircle } from 'lucide-react';
import { APIService } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import type { MVPProject, RoadmapDocument } from '@/types';

interface ScopeStatementTabProps {
  project: MVPProject;
}

export function ScopeStatementTab({ project }: ScopeStatementTabProps) {
  const { toast } = useToast();
  const { documents, setDocuments } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // Find existing scope statement document
  const scopeDoc = documents.find(
    doc => doc.project_id === project._id && doc.document_type === 'scope_statement'
  );

  const handleGenerateScopeStatement = async (retryAttempt = 0) => {
    setIsGenerating(true);
    try {


      toast({
        title: "Generating Scope Statement",
        description: "Defining project boundaries, deliverables, and acceptance criteria...",
      });

      const response = await APIService.generateScopeStatement(project);

      if (response.success && response.content) {
        // Save the generated document
        const newDocument: RoadmapDocument = {
          _id: `ss_${Date.now()}`,
          _uid: '',
          _tid: '',
          project_id: project._id,
          document_type: 'scope_statement',
          title: `Scope Statement: ${project.name}`,
          content: response.content,
          generated_at: Date.now(),
          status: 'generated',
          phase: 'definition'
        };

        await APIService.saveDocument(newDocument);
        
        // Update documents in store
        const updatedDocuments = documents.filter(doc => !(doc.project_id === project._id && doc.document_type === 'scope_statement'));
        updatedDocuments.push(newDocument);
        setDocuments(updatedDocuments);

        toast({
          title: "Scope Statement Generated Successfully",
          description: "Your comprehensive project scope definition is ready.",
        });
      } else {
        throw new Error(response.error || 'Failed to generate scope statement');
      }
    } catch (error) {
      console.error('Scope statement generation failed:', error);
      
      // Retry logic for temporary failures
      if (retryAttempt < 2 && error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('rate limit'))) {
        toast({
          title: "Retrying Generation",
          description: `Generation failed, retrying attempt ${retryAttempt + 2}/3...`,
        });
        setTimeout(() => handleGenerateScopeStatement(retryAttempt + 1), 2000);
        return;
      }

      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate scope statement. Please try again or check the Test AI page for troubleshooting.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!scopeDoc) return;

    try {
      const result = await APIService.exportDocument(scopeDoc, format);
      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${scopeDoc.title}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `Scope statement exported as ${format.toUpperCase()}`,
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
            <Layers className="h-5 w-5 text-indigo-600" />
            Scope Statement
          </h3>
          <p className="text-sm text-muted-foreground">
            Clear definition of project boundaries, deliverables, and acceptance criteria
          </p>
        </div>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Definition & Authority
        </Badge>
      </div>

      {/* Generation Section */}
      {!scopeDoc ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Scope Statement
            </CardTitle>
            <CardDescription>
              Define precise project boundaries to prevent scope creep and ensure stakeholder 
              alignment on what will and will not be delivered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Project Deliverables</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Major deliverables and outputs</li>
                    <li>• Acceptance criteria for each deliverable</li>
                    <li>• Quality standards and requirements</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <XSquare className="h-4 w-4 text-red-600" />
                    <h4 className="font-medium">Project Boundaries</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• What's included in scope</li>
                    <li>• What's explicitly excluded</li>
                    <li>• Future phase considerations</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Work Breakdown</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• High-level work breakdown structure</li>
                    <li>• Project phases and milestones</li>
                    <li>• Task dependencies and sequencing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium">Assumptions & Constraints</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Key project assumptions</li>
                    <li>• Resource and timeline constraints</li>
                    <li>• Change control processes</li>
                  </ul>
                </div>
              </div>
              
              <Separator />
              
              <Button 
                onClick={() => handleGenerateScopeStatement(0)}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Defining Project Scope...
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    Generate Scope Statement
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
                  <CardTitle className="text-base">{scopeDoc.title}</CardTitle>
                  <CardDescription>
                    Generated on {new Date(scopeDoc.generated_at).toLocaleDateString()} • 
                    <Badge variant="secondary" className="ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Defined
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
                    onClick={() => handleGenerateScopeStatement(0)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Layers className="h-4 w-4 mr-1" />
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
              <CardTitle className="text-base">Project Scope Definition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {scopeDoc.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}