import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { APIService } from '@/lib/api';
import { tableAPI } from '@/services/table-api';
import { aiDiagramService, DiagramGenerationRequest } from '@/services/ai-diagram-service';
import { AI_DIAGRAM_DEMO_TEMPLATES, AI_DIAGRAM_STYLE_EXAMPLES, getRandomDemoTemplate } from '@/utils/ai-diagram-demo';
import { 
  Sparkles, 
  Plus, 
  Eye, 
  Code,
  Save,
  Loader2,
  Copy,
  Trash2,
  Download,
  RefreshCw,
  Wand2,
  Image as ImageIcon,
  BarChart3,
  Lightbulb,
  Zap,
  Palette
} from 'lucide-react';
import type { MVPProject, UserDiagram } from '@/types';

interface AIDiagramsTabProps {
  project: MVPProject;
  diagrams: UserDiagram[];
  onDiagramSaved: () => void;
}

interface AIGeneratedDiagram {
  type: 'ai';
  _id: string;
  project_id: string;
  title: string;
  description: string;
  diagram_type: string;
  complexity: string;
  style: string;
  visual_url: string;
  mermaid_code: string;
  ai_suggestions: string[];
  generation_prompt: string;
  ai_model_used: string;
  created_at: string;
}

interface ExtendedUserDiagram extends UserDiagram {
  type: 'mermaid';
  uniqueId: string;
  timestamp: number;
}

interface ExtendedAIDiagram extends AIGeneratedDiagram {
  type: 'ai';
  uniqueId: string;
  timestamp: number;
}

type DiagramWithType = ExtendedUserDiagram | ExtendedAIDiagram;

// Helper function to check if diagram is AI-generated
const isAIGeneratedDiagram = (diagram: DiagramWithType): diagram is ExtendedAIDiagram => {
  return diagram.type === 'ai';
};

export const AIDiagramsTab: React.FC<AIDiagramsTabProps> = ({
  project,
  diagrams,
  onDiagramSaved
}) => {
  const { addNotification } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [selectedDiagram, setSelectedDiagram] = useState<DiagramWithType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiDiagrams, setAIDiagrams] = useState<AIGeneratedDiagram[]>([]);
  const [loadingDiagrams, setLoadingDiagrams] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    improvements: string[];
    alternativeApproaches: string[];
  } | null>(null);

  // Load AI diagrams from database on component mount
  useEffect(() => {
    loadAIDiagrams();
  }, [project._id]);

  const loadAIDiagrams = async () => {
    if (!isAuthenticated) {
      setLoadingDiagrams(false);
      return;
    }

    try {
      setLoadingDiagrams(true);
      const response = await tableAPI.getItems('excq0fukr5ds', {
        conditions: {
          project_id: project._id
        }
      });

      if (response.success && response.data) {
        const loadedDiagrams: AIGeneratedDiagram[] = response.data.map((item: any) => ({
          type: 'ai',
          _id: item._id,
          project_id: item.project_id,
          title: item.title,
          description: item.description,
          diagram_type: item.diagram_type,
          complexity: item.complexity,
          style: item.style,
          visual_url: item.visual_url,
          mermaid_code: item.mermaid_code,
          ai_suggestions: JSON.parse(item.ai_suggestions || '[]'),
          generation_prompt: item.generation_prompt,
          ai_model_used: item.ai_model_used,
          created_at: item.created_at
        }));
        
        setAIDiagrams(loadedDiagrams);
      }
    } catch (error) {
      console.error('Error loading AI diagrams:', error);
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Could not load AI diagrams.',
        duration: 4000
      });
    } finally {
      setLoadingDiagrams(false);
    }
  };

  const saveAIDiagramToDB = async (diagram: Omit<AIGeneratedDiagram, '_id' | 'type'>) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to save diagrams.',
        duration: 4000
      });
      return null;
    }

    try {
      const response = await tableAPI.addItem('excq0fukr5ds', {
        project_id: diagram.project_id,
        title: diagram.title,
        description: diagram.description,
        diagram_type: diagram.diagram_type,
        complexity: diagram.complexity,
        style: diagram.style,
        mermaid_code: diagram.mermaid_code,
        visual_url: diagram.visual_url,
        ai_suggestions: JSON.stringify(diagram.ai_suggestions),
        generation_prompt: diagram.generation_prompt,
        ai_model_used: diagram.ai_model_used,
        created_at: diagram.created_at
      });

      if (response.success && response.data) {
        return {
          ...diagram,
          type: 'ai' as const,
          _id: response.data._id
        };
      }
      return null;
    } catch (error) {
      console.error('Error saving AI diagram:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save AI diagram to database.',
        duration: 4000
      });
      return null;
    }
  };

  const [generationRequest, setGenerationRequest] = useState<DiagramGenerationRequest>({
    title: '',
    description: '',
    diagramType: 'flowchart',
    complexity: 'moderate',
    style: 'professional',
    projectContext: project.name
  });

  // Generate AI diagram
  const handleGenerateAIDiagram = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please log in to use AI diagram generation features.',
        duration: 5000
      });
      return;
    }

    if (!generationRequest.title.trim() || !generationRequest.description.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please provide both title and description for the diagram.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    let progressInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      // Enhanced progress simulation with better pacing
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 12 + 3; // Random increment between 3-15
        if (currentProgress >= 90) {
          currentProgress = 90; // Cap at 90% until completion
        }
        setGenerationProgress(Math.min(currentProgress, 90));
      }, 600);

      // Add timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (progressInterval) clearInterval(progressInterval);
        setIsGenerating(false);
        setGenerationProgress(0);
        addNotification({
          type: 'error',
          title: 'Generation Timeout',
          message: 'AI diagram generation took too long. Please try again.',
          duration: 5000
        });
      }, 45000); // 45 second timeout

      addNotification({
        type: 'info',
        title: 'AI Generation Started',
        message: 'Creating your diagram with AI assistance...',
        duration: 3000
      });

      const result = await aiDiagramService.generateDiagram(generationRequest);
      
      // Clear intervals and timeout on success
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Complete progress with a smooth transition
      setGenerationProgress(95);
      setTimeout(() => setGenerationProgress(100), 300);

      // Prepare diagram data for database storage
      const diagramData = {
        project_id: project._id,
        title: generationRequest.title,
        description: result.description,
        diagram_type: generationRequest.diagramType,
        complexity: generationRequest.complexity,
        style: generationRequest.style,
        visual_url: result.visualDiagram,
        mermaid_code: result.mermaidCode,
        ai_suggestions: result.suggestions,
        generation_prompt: generationRequest.description,
        ai_model_used: 'kimi', // or 'default' depending on which model was used
        created_at: new Date().toISOString()
      };

      // Save to database immediately
      const savedDiagram = await saveAIDiagramToDB(diagramData);
      
      if (savedDiagram) {
        // Add to local state for immediate display
        setAIDiagrams(prev => [savedDiagram, ...prev]);
        
        const extendedDiagram: ExtendedAIDiagram = {
          ...savedDiagram,
          type: 'ai',
          uniqueId: savedDiagram._id,
          timestamp: new Date(savedDiagram.created_at).getTime()
        };
        setSelectedDiagram(extendedDiagram);
      }

      addNotification({
        type: 'success',
        title: 'AI Diagram Generated!',
        message: 'Your visual diagram has been created successfully.',
        duration: 4000
      });

      // Reset form
      setGenerationRequest({
        title: '',
        description: '',
        diagramType: 'flowchart',
        complexity: 'moderate',
        style: 'professional',
        projectContext: project.name
      });

    } catch (error) {
      console.error('AI diagram generation failed:', error);
      
      // Clean up intervals and timeout
      if (progressInterval) clearInterval(progressInterval);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Enhanced error messaging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const isAuthError = errorMessage.includes('unauthorized') || errorMessage.includes('authentication');
      
      addNotification({
        type: 'error',
        title: isAuthError ? 'Authentication Required' : 'Generation Failed',
        message: isAuthError 
          ? 'Please ensure you are logged in to use AI features.' 
          : 'Could not generate the diagram. Please check your connection and try again.',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // Generate diagram variations
  const handleGenerateVariation = async (diagram: ExtendedAIDiagram, variationType: 'style_change' | 'complexity_change' | 'format_change' | 'color_scheme') => {
    try {
      addNotification({
        type: 'info',
        title: 'Creating Variation',
        message: 'Generating diagram variation...',
        duration: 3000
      });

      const variationRequest: DiagramGenerationRequest = {
        title: diagram.title,
        description: diagram.description,
        diagramType: 'flowchart', // Default for variations
        complexity: generationRequest.complexity,
        style: generationRequest.style,
        projectContext: project.name
      };

      const result = await aiDiagramService.generateVariations(
        diagram.visual_url,
        variationRequest,
        variationType
      );

      const variationDiagram: AIGeneratedDiagram = {
        type: 'ai',
        _id: `ai_var_${Date.now()}`,
        project_id: project._id,
        title: `${diagram.title} (${variationType.replace('_', ' ')})`,
        description: result.description,
        diagram_type: diagram.diagram_type,
        complexity: diagram.complexity,
        style: diagram.style,
        visual_url: result.visualDiagram,
        mermaid_code: result.mermaidCode,
        ai_suggestions: result.suggestions,
        generation_prompt: `${variationType} variation of: ${diagram.description}`,
        ai_model_used: 'kimi',
        created_at: new Date().toISOString()
      };

      setAIDiagrams(prev => [variationDiagram, ...prev]);
      const extendedVariationDiagram: ExtendedAIDiagram = {
        ...variationDiagram,
        type: 'ai',
        uniqueId: variationDiagram._id,
        timestamp: new Date(variationDiagram.created_at).getTime()
      };
      setSelectedDiagram(extendedVariationDiagram);

      addNotification({
        type: 'success',
        title: 'Variation Created!',
        message: 'New diagram variation generated successfully.',
        duration: 3000
      });

    } catch (error) {
      console.error('Variation generation failed:', error);
      addNotification({
        type: 'error',
        title: 'Variation Failed',
        message: 'Could not create diagram variation.',
        duration: 4000
      });
    }
  };

  // Analyze diagram with AI
  const handleAnalyzeDiagram = async (diagram: ExtendedAIDiagram) => {
    setIsAnalyzing(true);
    try {
      const result = await aiDiagramService.analyzeDiagram(
        diagram.visual_url,
        `Project: ${project.name}. Diagram: ${diagram.title}. ${diagram.description}`
      );
      
      setAnalysisResult(result);
      
      addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: 'AI analysis results are ready.',
        duration: 3000
      });

    } catch (error) {
      console.error('Diagram analysis failed:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Could not analyze the diagram.',
        duration: 4000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save AI diagram to database
  const handleSaveAIDiagram = async (aiDiagram: ExtendedAIDiagram) => {
    // AI diagrams are automatically saved to database when generated
    // This function now creates a copy in the user_diagrams table for compatibility
    try {
      await APIService.saveDiagram({
        project_id: project._id,
        title: aiDiagram.title,
        diagram_type: 'flowchart',
        mermaid_code: aiDiagram.mermaid_code
      });

      onDiagramSaved();
      
      addNotification({
        type: 'success',
        title: 'Diagram Copied!',
        message: 'AI diagram copied to your regular diagrams collection.',
        duration: 3000
      });

    } catch (error) {
      console.error('Failed to copy AI diagram:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy the diagram.',
        duration: 4000
      });
    }
  };

  const handleDownloadDiagram = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: 'Diagram downloaded successfully.',
        duration: 3000
      });

    } catch (error) {
      console.error('Download failed:', error);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download the diagram.',
        duration: 4000
      });
    }
  };

  const allDiagrams: DiagramWithType[] = [
    ...aiDiagrams.map(d => ({ ...d, type: 'ai' as const, uniqueId: d._id, timestamp: new Date(d.created_at).getTime() })),
    ...diagrams.map(d => ({ ...d, type: 'mermaid' as const, uniqueId: d._id, timestamp: d.created_at }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span>AI-Powered Diagrams</span>
          </h2>
          <p className="text-muted-foreground">
            Generate visual diagrams using AI assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAIGenerator(!showAIGenerator)}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            AI Generator
          </Button>
          <Button onClick={() => setShowAIGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Diagram
          </Button>
        </div>
      </div>

      {/* AI Generator Panel */}
      {showAIGenerator && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI Diagram Generator</span>
            </CardTitle>
            <CardDescription>
              Describe your diagram and let AI create a professional visual representation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating diagram...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="w-full" />
              </div>
            )}

            <Tabs defaultValue="custom" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="templates" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">AI Diagram Templates</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const randomTemplate = getRandomDemoTemplate();
                      setGenerationRequest(randomTemplate);
                    }}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Random
                  </Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="grid grid-cols-1 gap-3">
                    {AI_DIAGRAM_DEMO_TEMPLATES.map((template, index) => (
                      <Card 
                        key={index}
                        className="cursor-pointer hover:shadow-sm transition-all hover:border-primary/50"
                        onClick={() => setGenerationRequest(template)}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{template.title}</h4>
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  {template.diagramType.replace('_', ' ')}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {template.complexity}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {template.description.substring(0, 120)}...
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  template.style === 'professional' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  template.style === 'modern' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                  template.style === 'minimal' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                  template.style === 'colorful' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                  template.style === 'technical' ? 'bg-green-50 text-green-700 border-green-200' :
                                  'bg-orange-50 text-orange-700 border-orange-200'
                                }`}
                              >
                                {template.style}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {template.projectContext}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ai-title">Diagram Title</Label>
                      <Input
                        id="ai-title"
                        placeholder="e.g., User Authentication Flow"
                        value={generationRequest.title}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, title: e.target.value }))}
                        disabled={isGenerating}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ai-description">Description</Label>
                      <Textarea
                        id="ai-description"
                        placeholder="Describe what the diagram should show..."
                        value={generationRequest.description}
                        onChange={(e) => setGenerationRequest(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Diagram Type</Label>
                    <Select 
                      value={generationRequest.diagramType}
                      onValueChange={(value) => setGenerationRequest(prev => ({ 
                        ...prev, 
                        diagramType: value as DiagramGenerationRequest['diagramType']
                      }))}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flowchart">Flowchart</SelectItem>
                        <SelectItem value="architecture">Architecture</SelectItem>
                        <SelectItem value="system_design">System Design</SelectItem>
                        <SelectItem value="user_journey">User Journey</SelectItem>
                        <SelectItem value="process_flow">Process Flow</SelectItem>
                        <SelectItem value="data_flow">Data Flow</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="database_schema">Database Schema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Complexity</Label>
                    <Select 
                      value={generationRequest.complexity}
                      onValueChange={(value) => setGenerationRequest(prev => ({ 
                        ...prev, 
                        complexity: value as DiagramGenerationRequest['complexity']
                      }))}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Visual Style</Label>
                  <Select 
                    value={generationRequest.style}
                    onValueChange={(value) => setGenerationRequest(prev => ({ 
                      ...prev, 
                      style: value as DiagramGenerationRequest['style']
                    }))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="colorful">Colorful</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="hand_drawn">Hand Drawn</SelectItem>
                    </SelectContent>
                  </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAIGenerator(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateAIDiagram}
                disabled={isGenerating || !generationRequest.title.trim() || !generationRequest.description.trim()}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Diagram
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagrams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>All Diagrams ({allDiagrams.length})</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {aiDiagrams.length} AI
                </Badge>
                <Badge variant="outline">
                  {diagrams.length} Manual
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDiagrams ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="font-semibold mb-2">Loading Diagrams</h3>
                <p className="text-sm text-muted-foreground">
                  Retrieving your AI-generated diagrams...
                </p>
              </div>
            ) : allDiagrams.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No Diagrams Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate your first AI-powered diagram to visualize your concepts.
                </p>
                <Button onClick={() => setShowAIGenerator(true)} size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate First Diagram
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {allDiagrams.map((diagram) => (
                    <Card 
                      key={diagram.uniqueId}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedDiagram && (selectedDiagram.uniqueId === diagram.uniqueId)
                          ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedDiagram(diagram)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              {diagram.type === 'ai' ? (
                                <Sparkles className="w-4 h-4 text-primary" />
                              ) : (
                                <Code className="w-4 h-4 text-muted-foreground" />
                              )}
                              <h4 className="font-medium text-sm">{diagram.title}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={diagram.type === 'ai' ? 'default' : 'secondary'} 
                                className={`text-xs ${diagram.type === 'ai' ? 'bg-gradient-to-r from-primary to-purple-600' : ''}`}
                              >
                                {diagram.type === 'ai' ? 'AI Generated' : 'Manual'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(diagram.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {diagram.type === 'ai' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const aiDiagram = diagram as ExtendedAIDiagram;
                                  handleDownloadDiagram(aiDiagram.visual_url, diagram.title);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Diagram Viewer */}
        {selectedDiagram ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    {isAIGeneratedDiagram(selectedDiagram) ? (
                      <Sparkles className="w-5 h-5 text-primary" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span>{selectedDiagram.title}</span>
                  </CardTitle>
                  <CardDescription>
                    {isAIGeneratedDiagram(selectedDiagram) ? 'AI Generated' : 'Manual'} • {' '}
                    {new Date(selectedDiagram.timestamp).toLocaleDateString()}
                  </CardDescription>
                </div>
                {isAIGeneratedDiagram(selectedDiagram) && (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAnalyzeDiagram(selectedDiagram as ExtendedAIDiagram)}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BarChart3 className="w-4 h-4 mr-2" />
                      )}
                      Analyze
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSaveAIDiagram(selectedDiagram as ExtendedAIDiagram)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Diagrams
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visual" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  {isAIGeneratedDiagram(selectedDiagram) && (
                    <TabsTrigger value="insights">Insights</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="visual" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-card">
                    {isAIGeneratedDiagram(selectedDiagram) ? (
                      <div className="space-y-4">
                        <img
                          src={selectedDiagram.visual_url}
                          alt={selectedDiagram.title}
                          className="w-full rounded-lg shadow-sm"
                          loading="lazy"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {selectedDiagram.description || 'Diagram description'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateVariation(selectedDiagram as ExtendedAIDiagram, 'style_change')}
                            >
                              <Palette className="w-4 h-4 mr-2" />
                              Style
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGenerateVariation(selectedDiagram as ExtendedAIDiagram, 'complexity_change')}
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Variation
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div id={`preview-${selectedDiagram.uniqueId}`} className="w-full min-h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground">Mermaid diagram preview</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="code">
                  <ScrollArea className="h-64 w-full">
                    <pre className="text-sm font-mono bg-muted p-4 rounded-lg">
                      {isAIGeneratedDiagram(selectedDiagram) 
                        ? selectedDiagram.mermaid_code
                        : (selectedDiagram as ExtendedUserDiagram).mermaid_code}
                    </pre>
                  </ScrollArea>
                </TabsContent>

                {isAIGeneratedDiagram(selectedDiagram) && (
                  <TabsContent value="insights" className="space-y-4">
                    <div className="space-y-4">
                      {/* AI Suggestions */}
                      <div>
                        <h4 className="font-medium flex items-center space-x-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>AI Suggestions</span>
                        </h4>
                        <div className="space-y-2">
                          {isAIGeneratedDiagram(selectedDiagram) && selectedDiagram.ai_suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm">
                              <Zap className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Analysis Results */}
                      {analysisResult && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-medium flex items-center space-x-2 mb-2">
                              <BarChart3 className="w-4 h-4 text-blue-500" />
                              <span>AI Analysis</span>
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {analysisResult.analysis}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Improvements</h5>
                                <div className="space-y-1">
                                  {analysisResult.improvements.map((improvement, index) => (
                                    <div key={index} className="text-sm text-muted-foreground">
                                      • {improvement}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-sm mb-2">Alternative Approaches</h5>
                                <div className="space-y-1">
                                  {analysisResult.alternativeApproaches.map((approach, index) => (
                                    <div key={index} className="text-sm text-muted-foreground">
                                      • {approach}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">Select a Diagram</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a diagram from the list to view it here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};