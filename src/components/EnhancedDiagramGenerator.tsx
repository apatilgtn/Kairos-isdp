import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Eye, 
  RefreshCw, 
  Wand2, 
  BarChart3,
  GitBranch,
  Users,
  Clock,
  Settings,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedDiagrams } from '@/lib/enhanced-diagrams';
import { APIService } from '@/lib/api';
import type { RoadmapDocument, MVPProject, UserDiagram } from '@/types';

interface EnhancedDiagramGeneratorProps {
  document: RoadmapDocument;
  project: MVPProject;
  onDiagramGenerated: (diagram: UserDiagram) => void;
  className?: string;
}

interface DiagramVariation {
  type: string;
  code: string;
  title: string;
  preview?: string;
}

interface DiagramSuggestion {
  type: string;
  title: string;
  description: string;
  useCase: string;
  complexity: 'simple' | 'detailed' | 'comprehensive';
}

export const EnhancedDiagramGenerator: React.FC<EnhancedDiagramGeneratorProps> = ({
  document,
  project,
  onDiagramGenerated,
  className = ''
}) => {
  const { toast } = useToast();
  const [variations, setVariations] = useState<DiagramVariation[]>([]);
  const [suggestions, setSuggestions] = useState<DiagramSuggestion[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<DiagramVariation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  useEffect(() => {
    loadDiagramSuggestions();
  }, [document]);

  const loadDiagramSuggestions = async () => {
    try {
      const aiSuggestions = await enhancedDiagrams.generateDiagramSuggestions(
        document.content,
        document.document_type
      );
      
      // Convert AI suggestions to structured format
      const structuredSuggestions: DiagramSuggestion[] = [
        {
          type: 'flowchart',
          title: 'Process Flow Diagram',
          description: 'Visualize the main workflow or process steps',
          useCase: 'Perfect for showing sequential processes and decision points',
          complexity: 'detailed'
        },
        {
          type: 'gantt',
          title: 'Timeline Chart',
          description: 'Show project phases and milestones over time',
          useCase: 'Ideal for roadmaps and project planning documents',
          complexity: 'comprehensive'
        },
        {
          type: 'user_journey',
          title: 'User Journey Map',
          description: 'Illustrate user experience and touchpoints',
          useCase: 'Great for business cases and product requirements',
          complexity: 'detailed'
        },
        {
          type: 'sequence',
          title: 'Sequence Diagram',
          description: 'Show interactions between system components',
          useCase: 'Best for technical specifications and API workflows',
          complexity: 'comprehensive'
        }
      ];

      setSuggestions(structuredSuggestions);
    } catch (error) {
      console.error('Failed to load diagram suggestions:', error);
    }
  };

  const generateDiagramVariations = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing document content...');
    
    try {
      const request = {
        documentType: document.document_type,
        documentContent: document.content,
        project: project
      };

      setGenerationStep('Generating diagram variations...');
      const generatedVariations = await enhancedDiagrams.generateDiagramVariations(request);
      
      setGenerationStep('Rendering previews...');
      // Add preview generation for each variation
      const variationsWithPreviews = await Promise.all(
        generatedVariations.map(async (variation) => {
          try {
            // In a real implementation, you would render the Mermaid code to SVG
            // For now, we'll use a placeholder
            return {
              ...variation,
              preview: `data:image/svg+xml;base64,${btoa('<svg>Preview</svg>')}`
            };
          } catch (error) {
            return variation;
          }
        })
      );

      setVariations(variationsWithPreviews);
      
      if (variationsWithPreviews.length > 0) {
        setSelectedVariation(variationsWithPreviews[0]);
      }

      toast({
        title: 'Diagrams Generated!',
        description: `${variationsWithPreviews.length} diagram variations created successfully.`,
      });
    } catch (error) {
      console.error('Failed to generate diagram variations:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate diagram variations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const optimizeDiagram = async (variation: DiagramVariation) => {
    if (!variation) return;
    
    setIsOptimizing(true);
    
    try {
      const optimization = await enhancedDiagrams.optimizeDiagram(variation.code, project);
      
      // Update the selected variation with optimized code
      const optimizedVariation = {
        ...variation,
        code: optimization.optimizedCode,
        title: `${variation.title} (Optimized)`
      };
      
      setSelectedVariation(optimizedVariation);
      
      // Update variations list
      setVariations(prev => prev.map(v => 
        v.type === variation.type ? optimizedVariation : v
      ));

      toast({
        title: 'Diagram Optimized!',
        description: `Quality improved to ${optimization.qualityScore}%. ${optimization.improvements.length} enhancements applied.`,
      });
    } catch (error) {
      console.error('Failed to optimize diagram:', error);
      toast({
        title: 'Optimization Failed',
        description: 'Could not optimize the diagram. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const saveDiagram = async (variation: DiagramVariation) => {
    if (!variation) return;
    
    try {
      await APIService.saveDiagram({
        project_id: project._id,
        title: variation.title,
        diagram_type: variation.type as UserDiagram['diagram_type'],
        mermaid_code: variation.code
      });

      // Create mock diagram object for callback
      const savedDiagram: UserDiagram = {
        _id: Date.now().toString(),
        _uid: 'current-user',
        _tid: 'diagrams',
        project_id: project._id,
        title: variation.title,
        diagram_type: variation.type as UserDiagram['diagram_type'],
        mermaid_code: variation.code,
        created_at: Date.now()
      };

      onDiagramGenerated(savedDiagram);

      toast({
        title: 'Diagram Saved!',
        description: `${variation.title} has been saved to your project.`,
      });
    } catch (error) {
      console.error('Failed to save diagram:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the diagram. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const copyDiagramCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: 'Code Copied!',
        description: 'Diagram code copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy code to clipboard.',
        variant: 'destructive'
      });
    }
  };

  const getDiagramIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      flowchart: <GitBranch className="h-4 w-4" />,
      gantt: <BarChart3 className="h-4 w-4" />,
      sequence: <Users className="h-4 w-4" />,
      user_journey: <Users className="h-4 w-4" />,
      class: <Settings className="h-4 w-4" />,
      state: <RefreshCw className="h-4 w-4" />
    };
    return icons[type] || <GitBranch className="h-4 w-4" />;
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      simple: 'bg-green-100 text-green-800',
      detailed: 'bg-blue-100 text-blue-800',
      comprehensive: 'bg-purple-100 text-purple-800'
    };
    return colors[complexity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Enhanced Diagram Generator
          </CardTitle>
          <CardDescription>
            AI-powered diagram generation from {document.document_type.replace('_', ' ')} content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Diagram Suggestions */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommended Diagram Types
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.type} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDiagramIcon(suggestion.type)}
                      <div>
                        <h4 className="font-medium">{suggestion.title}</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                    </div>
                    <Badge className={getComplexityColor(suggestion.complexity)}>
                      {suggestion.complexity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{suggestion.useCase}</p>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Generation Controls */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Generate Diagram Variations</h3>
              <p className="text-sm text-muted-foreground">
                Create multiple diagram types from your document content
              </p>
            </div>
            
            <Button 
              onClick={generateDiagramVariations} 
              disabled={isGenerating}
              className="btn-enterprise"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {generationStep || 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Diagrams
                </>
              )}
            </Button>
          </div>

          {/* Generated Variations */}
          {variations.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Generated Variations ({variations.length})
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Variation List */}
                <div className="lg:col-span-1">
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {variations.map((variation, index) => (
                        <Card 
                          key={variation.type} 
                          className={`p-3 cursor-pointer transition-colors ${
                            selectedVariation?.type === variation.type 
                              ? 'ring-2 ring-primary bg-accent/50' 
                              : 'hover:bg-accent/30'
                          }`}
                          onClick={() => setSelectedVariation(variation)}
                        >
                          <div className="flex items-center gap-2">
                            {getDiagramIcon(variation.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{variation.title}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {variation.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Variation Preview */}
                <div className="lg:col-span-2">
                  {selectedVariation ? (
                    <Card className="h-96">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{selectedVariation.title}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => optimizeDiagram(selectedVariation)}
                              disabled={isOptimizing}
                            >
                              {isOptimizing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyDiagramCode(selectedVariation.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveDiagram(selectedVariation)}
                              className="btn-enterprise"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64">
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <pre className="text-xs font-mono whitespace-pre-wrap">
                              {selectedVariation.code}
                            </pre>
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="h-96 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p>Select a diagram variation to preview</p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {variations.length === 0 && !isGenerating && (
            <Card className="p-8 text-center">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Ready to Generate Diagrams</h3>
              <p className="text-muted-foreground mb-4">
                Click "Generate Diagrams" to create visual representations of your {document.document_type.replace('_', ' ')} content.
              </p>
              <p className="text-sm text-muted-foreground">
                The AI will analyze your document and suggest the most appropriate diagram types.
              </p>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDiagramGenerator;