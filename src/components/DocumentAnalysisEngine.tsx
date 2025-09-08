import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { EnhancedAIAnalysisEngine } from '@/lib/enhanced-ai-analysis';
import type { DocumentAnalysis, ContentIntelligence, StakeholderOptimization } from '@/lib/enhanced-ai-analysis';
import type { RoadmapDocument, MVPProject, UserDiagram } from '@/types';
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Star,
  BarChart3,
  Network,
  Zap,
  Eye,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface DocumentAnalysisEngineProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  selectedDocument?: RoadmapDocument | null;
  onDocumentSelect?: (document: RoadmapDocument | null) => void;
}

export const DocumentAnalysisEngine: React.FC<DocumentAnalysisEngineProps> = ({
  project,
  documents,
  diagrams,
  selectedDocument,
  onDocumentSelect
}) => {
  const { addNotification } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  const [contentIntelligence, setContentIntelligence] = useState<ContentIntelligence | null>(null);
  const [stakeholderOptimization, setStakeholderOptimization] = useState<StakeholderOptimization | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<StakeholderOptimization['audience']>('executive');
  const [analysisHistory, setAnalysisHistory] = useState<DocumentAnalysis[]>([]);

  // Generate project-wide content intelligence on component mount
  useEffect(() => {
    if (documents.length > 0 && !contentIntelligence) {
      generateContentIntelligence();
    }
  }, [documents.length]);

  // Analyze selected document when it changes
  useEffect(() => {
    if (selectedDocument && documents.length > 0) {
      analyzeDocument(selectedDocument);
    }
  }, [selectedDocument?.title, documents.length]);

  const generateContentIntelligence = async () => {
    try {
      console.log('Generating content intelligence...');
      setIsAnalyzing(true);

      const intelligence = await EnhancedAIAnalysisEngine.generateContentIntelligence(
        project,
        documents,
        diagrams
      );

      setContentIntelligence(intelligence);
      
      addNotification({
        type: 'success',
        title: 'Content Intelligence Generated',
        message: `Analyzed ${documents.length} documents with ${intelligence.recommendations.length} recommendations`,
        duration: 4000
      });

    } catch (error) {
      console.error('Content intelligence generation failed:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: 'Could not generate content intelligence. Please try again.',
        duration: 5000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDocument = async (document: RoadmapDocument) => {
    try {
      console.log(`Analyzing document: ${document.title}`);
      setIsAnalyzing(true);

      const analysis = await EnhancedAIAnalysisEngine.analyzeDocument(
        document,
        documents,
        project
      );

      setDocumentAnalysis(analysis);
      setAnalysisHistory(prev => [analysis, ...prev.slice(0, 4)]); // Keep last 5 analyses

      addNotification({
        type: 'success',
        title: 'Document Analyzed',
        message: `${document.title} analyzed with quality score: ${analysis.analysis.overallScore}%`,
        duration: 3000
      });

    } catch (error) {
      console.error('Document analysis failed:', error);
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: `Could not analyze ${document.title}. Please try again.`,
        duration: 5000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeForStakeholder = async (audience: StakeholderOptimization['audience']) => {
    if (!selectedDocument) return;

    try {
      console.log(`Optimizing for ${audience} audience...`);
      setIsAnalyzing(true);

      const optimization = await EnhancedAIAnalysisEngine.optimizeForStakeholder(
        selectedDocument,
        audience,
        project
      );

      setStakeholderOptimization(optimization);

      addNotification({
        type: 'success',
        title: 'Optimization Complete',
        message: `Document optimized for ${audience} audience`,
        duration: 3000
      });

    } catch (error) {
      console.error('Stakeholder optimization failed:', error);
      addNotification({
        type: 'error',
        title: 'Optimization Failed',
        message: 'Could not generate stakeholder optimization.',
        duration: 5000
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 85) return 'default'; // Excellent
    if (score >= 70) return 'secondary'; // Good
    if (score >= 55) return 'outline'; // Fair
    return 'destructive'; // Poor
  };

  const getQualityLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Improvement';
  };

  if (documents.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Documents to Analyze</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Generate some documents first to start analyzing your content with AI-powered insights.
          </p>
          <Button variant="outline" onClick={() => onDocumentSelect?.(null)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Content
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Document Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Advanced content intelligence and optimization recommendations
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={selectedDocument?._id || ""} 
            onValueChange={(value) => {
              const doc = documents.find(d => d._id === value) || null;
              onDocumentSelect?.(doc);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select document to analyze" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc._id} value={doc._id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {doc.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateContentIntelligence}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Project Overview</TabsTrigger>
          <TabsTrigger value="document" disabled={!selectedDocument}>Document Analysis</TabsTrigger>
          <TabsTrigger value="stakeholder" disabled={!selectedDocument}>Stakeholder Optimization</TabsTrigger>
          <TabsTrigger value="insights">Content Intelligence</TabsTrigger>
        </TabsList>

        {/* Project Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {contentIntelligence ? (
            <>
              {/* Project Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentIntelligence.overview.totalDocuments}</div>
                    <p className="text-xs text-muted-foreground">Total generated</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentIntelligence.overview.averageQuality}%</div>
                    <Badge variant={getQualityBadgeVariant(contentIntelligence.overview.averageQuality)} className="text-xs">
                      {getQualityLabel(contentIntelligence.overview.averageQuality)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                    <Network className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentIntelligence.overview.consistencyIndex}%</div>
                    <Progress value={contentIntelligence.overview.consistencyIndex} className="h-2 mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Strategic Alignment</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentIntelligence.overview.strategicAlignment}%</div>
                    <Progress value={contentIntelligence.overview.strategicAlignment} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Key Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Content Themes
                  </CardTitle>
                  <CardDescription>Major themes identified across your documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentIntelligence.themes.slice(0, 6).map((theme, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{theme.name}</span>
                            <Badge variant={theme.importance === 'high' ? 'default' : theme.importance === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                              {theme.importance}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Found in {theme.documents.length} document{theme.documents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{theme.frequency}%</div>
                          <Progress value={theme.frequency} className="h-2 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Strategic improvements for your document portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentIntelligence.recommendations.slice(0, 5).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                        <div className="mt-1">
                          {rec.type === 'structure' && <FileText className="h-4 w-4 text-blue-500" />}
                          {rec.type === 'content' && <Sparkles className="h-4 w-4 text-green-500" />}
                          {rec.type === 'consistency' && <Network className="h-4 w-4 text-orange-500" />}
                          {rec.type === 'clarity' && <Eye className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant={rec.impact === 'high' ? 'default' : rec.impact === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                              {rec.impact} impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          {rec.documents.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              Affects {rec.documents.length} document{rec.documents.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.effort} effort
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Generating Content Intelligence</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Analyzing your {documents.length} documents for insights and recommendations...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Document Analysis Tab */}
        <TabsContent value="document" className="space-y-6">
          {documentAnalysis && selectedDocument ? (
            <>
              {/* Quality Scores */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Overall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">{documentAnalysis.analysis.overallScore}%</div>
                    <Badge variant={getQualityBadgeVariant(documentAnalysis.analysis.overallScore)} className="text-xs">
                      {getQualityLabel(documentAnalysis.analysis.overallScore)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-2">{documentAnalysis.analysis.qualityScore}%</div>
                    <Progress value={documentAnalysis.analysis.qualityScore} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Readability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-2">{documentAnalysis.analysis.readabilityScore}%</div>
                    <Progress value={documentAnalysis.analysis.readabilityScore} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Completeness</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-2">{documentAnalysis.analysis.completenessScore}%</div>
                    <Progress value={documentAnalysis.analysis.completenessScore} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Consistency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold mb-2">{documentAnalysis.analysis.consistencyScore}%</div>
                    <Progress value={documentAnalysis.analysis.consistencyScore} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Content Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {documentAnalysis.insights.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <Star className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {documentAnalysis.insights.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Specific suggestions to improve this document</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documentAnalysis.insights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <ArrowRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stakeholder Alignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Stakeholder Alignment
                  </CardTitle>
                  <CardDescription>How well this document serves different audiences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Executives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={documentAnalysis.insights.stakeholderAlignment.executives} className="h-2 w-20" />
                        <span className="text-sm font-bold">{documentAnalysis.insights.stakeholderAlignment.executives}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Technical Teams</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={documentAnalysis.insights.stakeholderAlignment.technical} className="h-2 w-20" />
                        <span className="text-sm font-bold">{documentAnalysis.insights.stakeholderAlignment.technical}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium">Investors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={documentAnalysis.insights.stakeholderAlignment.investors} className="h-2 w-20" />
                        <span className="text-sm font-bold">{documentAnalysis.insights.stakeholderAlignment.investors}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Document</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Choose a document from the dropdown above to see detailed AI analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Stakeholder Optimization Tab */}
        <TabsContent value="stakeholder" className="space-y-6">
          {selectedDocument && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Stakeholder Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimize {selectedDocument.title} for specific audiences
                  </p>
                </div>
                <Select value={selectedAudience} onValueChange={(value: any) => setSelectedAudience(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">👔 Executives</SelectItem>
                    <SelectItem value="technical">🔧 Technical Teams</SelectItem>
                    <SelectItem value="investor">💰 Investors</SelectItem>
                    <SelectItem value="general">👥 General Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => optimizeForStakeholder(selectedAudience)}
                  disabled={isAnalyzing}
                  className="btn-enterprise"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Generate Optimization
                </Button>
              </div>

              {stakeholderOptimization && (
                <div className="space-y-6">
                  {/* Impact Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Comprehension</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold mb-2">+{stakeholderOptimization.estimatedImpact.comprehension}%</div>
                        <Progress value={stakeholderOptimization.estimatedImpact.comprehension} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Engagement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold mb-2">+{stakeholderOptimization.estimatedImpact.engagement}%</div>
                        <Progress value={stakeholderOptimization.estimatedImpact.engagement} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Actionability</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold mb-2">+{stakeholderOptimization.estimatedImpact.actionability}%</div>
                        <Progress value={stakeholderOptimization.estimatedImpact.actionability} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Optimization Recommendations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Content Adjustments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stakeholderOptimization.optimizations.contentAdjustments.map((adjustment, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{adjustment}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Structure Changes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stakeholderOptimization.optimizations.structureChanges.map((change, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{change}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Visualization Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stakeholderOptimization.optimizations.visualizationSuggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Language Simplification</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {stakeholderOptimization.optimizations.languageSimplification.map((simplification, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{simplification}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Content Intelligence Tab */}
        <TabsContent value="insights" className="space-y-6">
          {contentIntelligence ? (
            <>
              {/* Content Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Content Gaps
                  </CardTitle>
                  <CardDescription>Missing information that could strengthen your strategy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentIntelligence.gaps.slice(0, 6).map((gap, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border">
                        <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          gap.priority === 'high' ? 'text-red-500' : 
                          gap.priority === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{gap.category}</h4>
                            <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                              {gap.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                          <p className="text-sm font-medium text-primary">{gap.suggestedContent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cross-Document Insights */}
              {contentIntelligence.crossDocumentInsights.inconsistentTerminology.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-primary" />
                      Cross-Document Analysis
                    </CardTitle>
                    <CardDescription>Consistency issues and opportunities across your document portfolio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contentIntelligence.crossDocumentInsights.inconsistentTerminology.map((inconsistency, index) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Inconsistent Terminology:</span>
                            <Badge variant="outline" className="text-xs">{inconsistency.term}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Found variations: {inconsistency.variations.join(', ')}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-primary">Recommended:</span> {inconsistency.recommendedTerm}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading Content Intelligence</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Analyzing document relationships and content patterns...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};