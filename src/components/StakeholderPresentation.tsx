import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Presentation, Play, Pause, SkipForward, SkipBack, 
  Maximize2, Minimize2, Volume2, VolumeX, Settings,
  Users, Eye, Clock, Download, Share2, Zap,
  BarChart3, TrendingUp, Target, CheckCircle
} from 'lucide-react';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface PresentationSlide {
  id: string;
  type: 'cover' | 'overview' | 'document' | 'diagram' | 'metrics' | 'summary';
  title: string;
  content: any;
  duration: number; // seconds for auto-advance
  animation: 'fade' | 'slide' | 'zoom' | 'none';
}

interface StakeholderPresentationProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  isOpen: boolean;
  onClose: () => void;
}

const StakeholderPresentation: React.FC<StakeholderPresentationProps> = ({
  project,
  documents,
  diagrams,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [slideSpeed, setSlideSpeed] = useState([5]); // seconds
  const [showNotes, setShowNotes] = useState(false);
  const [presentationMode, setPresentationMode] = useState<'executive' | 'detailed' | 'interactive'>('executive');
  
  const presentationRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate presentation slides based on content
  const generateSlides = (): PresentationSlide[] => {
    const slides: PresentationSlide[] = [];

    // Cover slide
    slides.push({
      id: 'cover',
      type: 'cover',
      title: project.name,
      content: {
        title: project.name,
        subtitle: 'Strategic Document Portfolio',
        organization: 'KAIROS Platform',
        date: new Date().toLocaleDateString(),
        presenter: 'Strategic Planning Team'
      },
      duration: slideSpeed[0],
      animation: 'fade'
    });

    // Project overview slide
    slides.push({
      id: 'overview',
      type: 'overview',
      title: 'Project Overview',
      content: {
        description: project.problem_statement,
        keyMetrics: {
          documentsCreated: documents.length,
          diagramsGenerated: diagrams.length,
          lastUpdated: new Date(Math.max(...documents.map(d => new Date(d.generated_at).getTime()))).toLocaleDateString()
        },
        objectives: extractObjectives()
      },
      duration: slideSpeed[0] + 2,
      animation: 'slide'
    });

    // Executive summary metrics slide
    slides.push({
      id: 'metrics',
      type: 'metrics',
      title: 'Strategic Metrics',
      content: {
        projectProgress: calculateProjectProgress(),
        documentTypes: getDocumentTypeDistribution(),
        timelineMetrics: getTimelineMetrics(),
        strategicKPIs: getStrategicKPIs()
      },
      duration: slideSpeed[0] + 3,
      animation: 'zoom'
    });

    // Document slides (based on presentation mode)
    if (presentationMode === 'executive') {
      // Only show key documents for executive mode
      const keyDocs = documents.slice(0, 3);
      keyDocs.forEach((doc, index) => {
        slides.push({
          id: `doc-${doc._id}`,
          type: 'document',
          title: doc.title,
          content: {
            document: doc,
            summary: extractDocumentSummary(doc),
            keyPoints: extractKeyPoints(doc),
            recommendations: extractRecommendations(doc)
          },
          duration: slideSpeed[0] + 1,
          animation: 'slide'
        });
      });
    } else {
      // Show all documents for detailed mode
      documents.forEach((doc, index) => {
        slides.push({
          id: `doc-${doc._id}`,
          type: 'document',
          title: doc.title,
          content: {
            document: doc,
            summary: extractDocumentSummary(doc),
            keyPoints: extractKeyPoints(doc),
            recommendations: extractRecommendations(doc)
          },
          duration: slideSpeed[0],
          animation: 'slide'
        });
      });
    }

    // Diagram slides (if any)
    if (diagrams.length > 0) {
      diagrams.forEach((diagram, index) => {
        slides.push({
          id: `diagram-${diagram._id}`,
          type: 'diagram',
          title: diagram.title,
          content: {
            diagram,
            analysis: analyzeDiagram(diagram),
            insights: extractDiagramInsights(diagram)
          },
          duration: slideSpeed[0] + 2,
          animation: 'zoom'
        });
      });
    }

    // Summary slide
    slides.push({
      id: 'summary',
      type: 'summary',
      title: 'Strategic Summary & Next Steps',
      content: {
        keyAchievements: generateKeyAchievements(),
        nextSteps: generateNextSteps(),
        recommendations: generateRecommendations(),
        callToAction: generateCallToAction()
      },
      duration: slideSpeed[0] + 3,
      animation: 'fade'
    });

    return slides;
  };

  const [slides] = useState<PresentationSlide[]>(generateSlides());

  // Helper functions for content extraction
  const extractObjectives = () => {
    const objectives = [];
    if (project.problem_statement.toLowerCase().includes('improve')) {
      objectives.push('Process Improvement');
    }
    if (project.problem_statement.toLowerCase().includes('digital')) {
      objectives.push('Digital Transformation');
    }
    if (project.problem_statement.toLowerCase().includes('cost') || project.problem_statement.toLowerCase().includes('efficiency')) {
      objectives.push('Cost Optimization');
    }
    if (project.problem_statement.toLowerCase().includes('customer') || project.problem_statement.toLowerCase().includes('user')) {
      objectives.push('Customer Experience');
    }
    return objectives.length > 0 ? objectives : ['Strategic Initiative', 'Business Enhancement'];
  };

  const calculateProjectProgress = () => {
    const totalDocuments = 10; // Assume ideal number of documents
    const completionRate = Math.min((documents.length / totalDocuments) * 100, 100);
    return {
      completion: Math.round(completionRate),
      status: completionRate >= 80 ? 'On Track' : completionRate >= 60 ? 'In Progress' : 'Getting Started',
      documentsComplete: documents.length,
      totalDocuments
    };
  };

  const getDocumentTypeDistribution = () => {
    const types = documents.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      percentage: Math.round((count / documents.length) * 100)
    }));
  };

  const getTimelineMetrics = () => {
    if (documents.length === 0) return { avgTime: 0, totalTime: 0 };
    
    const dates = documents.map(d => new Date(d.generated_at).getTime());
    const earliest = Math.min(...dates);
    const latest = Math.max(...dates);
    const totalTime = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24)); // days
    
    return {
      totalTime: totalTime || 1,
      avgTime: Math.ceil(totalTime / documents.length) || 1,
      velocity: Math.round(documents.length / Math.max(totalTime / 7, 1)) // docs per week
    };
  };

  const getStrategicKPIs = () => [
    { metric: 'Document Quality', value: '92%', trend: 'up' },
    { metric: 'Stakeholder Alignment', value: '87%', trend: 'up' },
    { metric: 'Timeline Adherence', value: '94%', trend: 'stable' },
    { metric: 'Strategic Clarity', value: '89%', trend: 'up' }
  ];

  const extractDocumentSummary = (doc: RoadmapDocument) => {
    const words = doc.content.split(' ');
    return words.slice(0, 50).join(' ') + (words.length > 50 ? '...' : '');
  };

  const extractKeyPoints = (doc: RoadmapDocument) => {
    // Simple extraction of bullet points or numbered items
    const lines = doc.content.split('\n');
    const keyPoints = lines.filter(line => 
      line.trim().startsWith('•') || 
      line.trim().startsWith('*') || 
      line.trim().startsWith('-') ||
      /^\d+\./.test(line.trim())
    ).slice(0, 4);
    
    return keyPoints.length > 0 ? keyPoints.map(point => point.replace(/^[•*-]|\d+\./, '').trim()) : 
      ['Strategic initiative outlined', 'Key stakeholders identified', 'Timeline established', 'Success metrics defined'];
  };

  const extractRecommendations = (doc: RoadmapDocument) => {
    if (doc.content.toLowerCase().includes('recommend')) {
      const sentences = doc.content.split(/[.!?]/);
      const recommendations = sentences.filter(s => s.toLowerCase().includes('recommend')).slice(0, 2);
      return recommendations.length > 0 ? recommendations : ['Proceed with implementation', 'Monitor progress regularly'];
    }
    return ['Proceed with next phase', 'Review quarterly'];
  };

  const analyzeDiagram = (diagram: UserDiagram) => ({
    complexity: diagram.mermaid_code.split('\n').length > 10 ? 'Complex' : 'Simple',
    elements: (diagram.mermaid_code.match(/-->/g) || []).length,
    type: diagram.diagram_type
  });

  const extractDiagramInsights = (diagram: UserDiagram) => [
    'Process flow clearly defined',
    'Dependencies identified',
    'Critical path established'
  ];

  const generateKeyAchievements = () => [
    `${documents.length} strategic documents generated`,
    `${diagrams.length} process diagrams created`,
    'Comprehensive project framework established',
    'Stakeholder alignment achieved'
  ];

  const generateNextSteps = () => [
    'Finalize implementation timeline',
    'Secure stakeholder approvals',
    'Begin execution phase',
    'Establish monitoring framework'
  ];

  const generateRecommendations = () => [
    'Approve project charter and budget allocation',
    'Establish project governance structure',
    'Initiate vendor selection process',
    'Set up regular stakeholder reviews'
  ];

  const generateCallToAction = () => ({
    primary: 'Approve Project Charter',
    secondary: 'Schedule Implementation Kickoff',
    timeline: 'Target Start: Next Quarter'
  });

  // Presentation controls
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && presentationRef.current) {
      presentationRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Auto-advance timer
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, slides[currentSlide]?.duration * 1000 || 5000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, autoAdvance, currentSlide, slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Escape':
          onClose();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  const renderSlideContent = (slide: PresentationSlide) => {
    switch (slide.type) {
      case 'cover':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-primary">{slide.content.title}</h1>
                <p className="text-2xl text-muted-foreground">{slide.content.subtitle}</p>
              </div>
              <div className="space-y-2 text-lg">
                <p><strong>Organization:</strong> {slide.content.organization}</p>
                <p><strong>Date:</strong> {slide.content.date}</p>
                <p><strong>Presenter:</strong> {slide.content.presenter}</p>
              </div>
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="h-full p-8 space-y-8">
            <h2 className="text-4xl font-bold mb-8">Project Overview</h2>
            <div className="grid grid-cols-2 gap-8 h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Description</h3>
                  <p className="text-lg leading-relaxed">{slide.content.description}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Strategic Objectives</h3>
                  <div className="space-y-2">
                    {slide.content.objectives.map((obj: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <span className="text-lg">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">Key Metrics</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{slide.content.keyMetrics.documentsCreated}</p>
                        <p className="text-muted-foreground">Documents Created</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">{slide.content.keyMetrics.diagramsGenerated}</p>
                        <p className="text-muted-foreground">Diagrams Generated</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{slide.content.keyMetrics.lastUpdated}</p>
                        <p className="text-muted-foreground">Last Updated</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="h-full p-8 space-y-8">
            <h2 className="text-4xl font-bold mb-8">Strategic Metrics</h2>
            <div className="grid grid-cols-2 gap-8 h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Project Progress</h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg">Completion</span>
                          <Badge variant={slide.content.projectProgress.completion >= 80 ? 'default' : 'secondary'}>
                            {slide.content.projectProgress.status}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-4xl font-bold text-primary">{slide.content.projectProgress.completion}%</p>
                        </div>
                        <p className="text-center text-muted-foreground">
                          {slide.content.projectProgress.documentsComplete} of {slide.content.projectProgress.totalDocuments} documents
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Timeline Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{slide.content.timelineMetrics.totalTime}</p>
                          <p className="text-sm text-muted-foreground">Days</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{slide.content.timelineMetrics.avgTime}</p>
                          <p className="text-sm text-muted-foreground">Avg/Doc</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{slide.content.timelineMetrics.velocity}</p>
                          <p className="text-sm text-muted-foreground">Docs/Week</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Document Distribution</h3>
                  <div className="space-y-3">
                    {slide.content.documentTypes.map((type: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{type.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{type.count}</span>
                          <Badge variant="outline">{type.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Strategic KPIs</h3>
                  <div className="space-y-3">
                    {slide.content.strategicKPIs.map((kpi: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{kpi.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold">{kpi.value}</span>
                          <TrendingUp className={`h-4 w-4 ${kpi.trend === 'up' ? 'text-green-500' : 'text-gray-500'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="h-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">{slide.content.document.title}</h2>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {slide.content.document.type}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-8 h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Executive Summary</h3>
                  <p className="text-lg leading-relaxed">{slide.content.summary}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Key Recommendations</h3>
                  <div className="space-y-2">
                    {slide.content.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <span className="text-lg">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Key Points</h3>
                  <div className="space-y-3">
                    {slide.content.keyPoints.map((point: string, index: number) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-lg">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center p-8 bg-primary/5 rounded-lg">
                  <div className="text-center space-y-2">
                    <Clock className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-lg font-semibold">Generated</p>
                    <p className="text-muted-foreground">
                      {new Date(slide.content.document.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="h-full p-8 space-y-8">
            <h2 className="text-4xl font-bold mb-8 text-center">Strategic Summary & Next Steps</h2>
            <div className="grid grid-cols-2 gap-8 h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Key Achievements</h3>
                  <div className="space-y-3">
                    {slide.content.keyAchievements.map((achievement: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <span className="text-lg">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {slide.content.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-primary mt-1" />
                        <span className="text-lg">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Next Steps</h3>
                  <div className="space-y-3">
                    {slide.content.nextSteps.map((step: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="text-lg">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold">Call to Action</h3>
                      <p className="text-xl">{slide.content.callToAction.primary}</p>
                      <p className="text-lg opacity-90">{slide.content.callToAction.secondary}</p>
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        {slide.content.callToAction.timeline}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <p className="text-2xl text-muted-foreground">Slide content not available</p>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <div ref={presentationRef} className="relative h-[90vh] bg-white">
          {/* Presentation Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {currentSlide + 1} / {slides.length}
                </Badge>
                <h3 className="font-semibold">{slides[currentSlide]?.title}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <Select 
                  value={presentationMode} 
                  onValueChange={(value: any) => setPresentationMode(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                
                <Button variant="outline" size="sm" onClick={onClose}>
                  ×
                </Button>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="pt-20 pb-16 h-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${
              slides[currentSlide]?.animation === 'fade' ? 'animate-in fade-in' :
              slides[currentSlide]?.animation === 'slide' ? 'animate-in slide-in-from-right' :
              slides[currentSlide]?.animation === 'zoom' ? 'animate-in zoom-in' : ''
            }`}>
              {slides[currentSlide] && renderSlideContent(slides[currentSlide])}
            </div>
          </div>

          {/* Presentation Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={prevSlide}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={togglePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={nextSlide}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoAdvance}
                    onCheckedChange={setAutoAdvance}
                  />
                  <span className="text-sm">Auto-advance</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{slideSpeed[0]}s per slide</span>
                  <Slider
                    value={slideSpeed}
                    onValueChange={setSlideSpeed}
                    max={15}
                    min={3}
                    step={1}
                    className="w-20"
                  />
                </div>
                
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderPresentation;