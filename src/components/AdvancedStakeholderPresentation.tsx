import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Presentation, Play, Pause, SkipForward, SkipBack, 
  Maximize2, Minimize2, Volume2, VolumeX, Settings,
  Users, Eye, Clock, Download, Share2, Zap,
  BarChart3, TrendingUp, Target, CheckCircle,
  MousePointer, Hand, Lightbulb, MessageCircle,
  PenTool, Bookmark, Filter, Search, ZoomIn,
  Layers, Grid, RotateCcw, Save, FileText,
  Palette, Type, Image, LineChart, PieChart
} from 'lucide-react';
import mermaid from 'mermaid';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface InteractiveElement {
  id: string;
  type: 'hotspot' | 'annotation' | 'bookmark' | 'highlight' | 'comment';
  x: number; // percentage
  y: number; // percentage
  width?: number;
  height?: number;
  content: string;
  author?: string;
  timestamp: Date;
  color?: string;
}

interface PresentationSlide {
  id: string;
  type: 'cover' | 'overview' | 'document' | 'diagram' | 'metrics' | 'summary' | 'interactive' | 'comparison';
  title: string;
  content: any;
  duration: number;
  animation: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  interactiveElements: InteractiveElement[];
  allowInteraction: boolean;
  template: 'standard' | 'dashboard' | 'infographic' | 'minimal';
}

interface AdvancedStakeholderPresentationProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedStakeholderPresentation: React.FC<AdvancedStakeholderPresentationProps> = ({
  project,
  documents,
  diagrams,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  
  // Core presentation state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [slideSpeed, setSlideSpeed] = useState([8]);
  
  // Advanced presentation features
  const [presentationMode, setPresentationMode] = useState<'executive' | 'detailed' | 'interactive' | 'workshop'>('executive');
  const [interactionMode, setInteractionMode] = useState<'view' | 'annotate' | 'highlight' | 'comment'>('view');
  const [showGrid, setShowGrid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [laserPointer, setLaserPointer] = useState(false);
  const [slideTemplate, setSlideTemplate] = useState<'standard' | 'dashboard' | 'infographic' | 'minimal'>('standard');
  
  // Interactive elements state
  const [interactiveElements, setInteractiveElements] = useState<Record<string, InteractiveElement[]>>({});
  const [selectedElement, setSelectedElement] = useState<InteractiveElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPath, setDrawingPath] = useState<{ x: number; y: number }[]>([]);
  
  // Presentation analytics
  const [viewingStats, setViewingStats] = useState({
    slideViews: {} as Record<number, number>,
    timeSpent: {} as Record<number, number>,
    interactions: [] as Array<{ slide: number; type: string; timestamp: Date }>
  });
  
  // Mouse tracking for laser pointer
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const presentationRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const viewStartTime = useRef<Date>(new Date());

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  // Enhanced slide generation with interactive capabilities
  const generateAdvancedSlides = (): PresentationSlide[] => {
    const slides: PresentationSlide[] = [];

    // Interactive cover slide
    slides.push({
      id: 'cover',
      type: 'cover',
      title: project.name,
      content: {
        title: project.name,
        subtitle: 'Strategic Document Portfolio',
        organization: 'KAIROS Platform',
        date: new Date().toLocaleDateString(),
        presenter: 'Strategic Planning Team',
        stats: {
          documents: documents.length,
          diagrams: diagrams.length,
          completion: Math.round((documents.length / 10) * 100)
        }
      },
      duration: slideSpeed[0],
      animation: 'fade',
      interactiveElements: [],
      allowInteraction: true,
      template: slideTemplate
    });

    // Interactive dashboard overview
    slides.push({
      id: 'dashboard',
      type: 'overview',
      title: 'Executive Dashboard',
      content: {
        description: project.problem_statement,
        kpis: generateKPIs(),
        charts: generateChartData(),
        heatmap: generateHeatmapData(),
        timeline: generateTimelineData()
      },
      duration: slideSpeed[0] + 3,
      animation: 'slide',
      interactiveElements: [],
      allowInteraction: true,
      template: 'dashboard'
    });

    // Document comparison slide
    if (documents.length > 1) {
      slides.push({
        id: 'comparison',
        type: 'comparison',
        title: 'Document Analysis & Comparison',
        content: {
          documents: documents.slice(0, 3),
          comparison: generateDocumentComparison(),
          relationships: generateDocumentRelationships(),
          insights: generateComparisonInsights()
        },
        duration: slideSpeed[0] + 2,
        animation: 'flip',
        interactiveElements: [],
        allowInteraction: true,
        template: 'infographic'
      });
    }

    // Interactive diagram slides with enhanced features
    diagrams.forEach((diagram, index) => {
      slides.push({
        id: `interactive-diagram-${diagram._id}`,
        type: 'diagram',
        title: `Interactive: ${diagram.title}`,
        content: {
          diagram,
          mermaidCode: diagram.mermaid_code,
          analysis: analyzeDiagram(diagram),
          interactiveNodes: extractInteractiveNodes(diagram),
          flowAnalysis: analyzeFlowComplexity(diagram)
        },
        duration: slideSpeed[0] + 4,
        animation: 'zoom',
        interactiveElements: [],
        allowInteraction: true,
        template: 'standard'
      });
    });

    // Workshop mode slides (if in workshop mode)
    if (presentationMode === 'workshop') {
      slides.push({
        id: 'workshop',
        type: 'interactive',
        title: 'Workshop: Strategic Planning Session',
        content: {
          activities: generateWorkshopActivities(),
          tools: ['Brainstorming', 'Prioritization', 'Action Planning'],
          outcomes: generateExpectedOutcomes(),
          resources: generateWorkshopResources()
        },
        duration: slideSpeed[0] * 3,
        animation: 'slide',
        interactiveElements: [],
        allowInteraction: true,
        template: 'minimal'
      });
    }

    // Enhanced summary with action items
    slides.push({
      id: 'action-summary',
      type: 'summary',
      title: 'Strategic Action Plan',
      content: {
        keyAchievements: generateKeyAchievements(),
        actionItems: generateActionItems(),
        timeline: generateActionTimeline(),
        responsibilities: generateResponsibilities(),
        successMetrics: generateSuccessMetrics(),
        callToAction: generateCallToAction()
      },
      duration: slideSpeed[0] + 3,
      animation: 'fade',
      interactiveElements: [],
      allowInteraction: true,
      template: 'standard'
    });

    return slides;
  };

  const [slides, setSlides] = useState<PresentationSlide[]>([]);

  // Regenerate slides when mode or template changes
  useEffect(() => {
    setSlides(generateAdvancedSlides());
  }, [presentationMode, slideTemplate, documents, diagrams]);

  // Helper functions for enhanced content generation
  const generateKPIs = () => [
    { metric: 'Strategic Alignment', value: '94%', trend: 'up', target: '95%' },
    { metric: 'Completion Rate', value: '87%', trend: 'up', target: '90%' },
    { metric: 'Stakeholder Satisfaction', value: '92%', trend: 'stable', target: '90%' },
    { metric: 'Risk Mitigation', value: '85%', trend: 'up', target: '80%' }
  ];

  const generateChartData = () => ({
    progress: [
      { phase: 'Planning', completion: 100 },
      { phase: 'Analysis', completion: 85 },
      { phase: 'Design', completion: 60 },
      { phase: 'Implementation', completion: 20 }
    ],
    budget: [
      { category: 'Personnel', allocated: 450000, spent: 123000 },
      { category: 'Technology', allocated: 200000, spent: 45000 },
      { category: 'Operations', allocated: 150000, spent: 28000 }
    ]
  });

  const generateHeatmapData = () => ({
    riskAreas: [
      { area: 'Technical Complexity', severity: 'high', likelihood: 'medium' },
      { area: 'Resource Availability', severity: 'medium', likelihood: 'high' },
      { area: 'Stakeholder Alignment', severity: 'low', likelihood: 'low' },
      { area: 'Timeline Pressure', severity: 'medium', likelihood: 'medium' }
    ]
  });

  const generateTimelineData = () => [
    { milestone: 'Project Charter', date: '2024-01-15', status: 'completed' },
    { milestone: 'Requirements Analysis', date: '2024-02-28', status: 'completed' },
    { milestone: 'System Design', date: '2024-04-15', status: 'in-progress' },
    { milestone: 'Implementation', date: '2024-06-30', status: 'pending' }
  ];

  const generateDocumentComparison = () => ({
    similarities: ['Strategic alignment', 'Risk assessment approach', 'Success metrics'],
    differences: ['Implementation timeline', 'Resource requirements', 'Stakeholder involvement'],
    gaps: ['Integration planning', 'Change management', 'Training requirements']
  });

  const generateDocumentRelationships = () => [
    { from: 'Business Case', to: 'Project Charter', relationship: 'justifies' },
    { from: 'Project Charter', to: 'Scope Statement', relationship: 'defines' },
    { from: 'Scope Statement', to: 'RFP Document', relationship: 'specifies' }
  ];

  const generateComparisonInsights = () => [
    'All documents align on strategic objectives',
    'Timeline consistency across planning documents',
    'Resource allocation matches budget projections',
    'Risk mitigation strategies are comprehensive'
  ];

  const analyzeDiagram = (diagram: UserDiagram) => ({
    complexity: diagram.mermaid_code.split('\n').length > 10 ? 'Complex' : 'Simple',
    elements: (diagram.mermaid_code.match(/-->/g) || []).length,
    type: diagram.diagram_type
  });

  const extractInteractiveNodes = (diagram: UserDiagram) => {
    const nodes = diagram.mermaid_code.match(/(\w+)\[(.*?)\]/g) || [];
    return nodes.map((node, index) => ({
      id: `node-${index}`,
      label: node.replace(/\w+\[(.*?)\]/, '$1'),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      description: `Interactive node: ${node}`
    }));
  };

  const analyzeFlowComplexity = (diagram: UserDiagram) => {
    const connections = (diagram.mermaid_code.match(/-->/g) || []).length;
    const nodes = (diagram.mermaid_code.match(/\w+\[/g) || []).length;
    
    return {
      complexity: connections > 10 ? 'High' : connections > 5 ? 'Medium' : 'Low',
      nodes,
      connections,
      density: nodes > 0 ? (connections / nodes).toFixed(2) : '0'
    };
  };

  const generateWorkshopActivities = () => [
    { name: 'Strategic Visioning', duration: 30, participants: 'All' },
    { name: 'Gap Analysis', duration: 45, participants: 'Teams' },
    { name: 'Action Planning', duration: 60, participants: 'All' }
  ];

  const generateExpectedOutcomes = () => [
    'Aligned strategic vision',
    'Prioritized action items',
    'Clear responsibilities',
    'Defined success metrics'
  ];

  const generateWorkshopResources = () => [
    'Digital whiteboard access',
    'Strategy templates',
    'Action planning worksheets',
    'Follow-up task assignments'
  ];

  const generateActionItems = () => [
    { action: 'Finalize project charter', owner: 'Project Manager', due: '2024-05-15', priority: 'High' },
    { action: 'Secure budget approval', owner: 'Finance Director', due: '2024-05-20', priority: 'High' },
    { action: 'Begin vendor selection', owner: 'Procurement Lead', due: '2024-06-01', priority: 'Medium' },
    { action: 'Setup governance structure', owner: 'Program Director', due: '2024-05-25', priority: 'Medium' }
  ];

  const generateActionTimeline = () => [
    { phase: 'Immediate (Next 2 weeks)', actions: 2 },
    { phase: 'Short-term (1 month)', actions: 3 },
    { phase: 'Medium-term (3 months)', actions: 4 },
    { phase: 'Long-term (6+ months)', actions: 2 }
  ];

  const generateResponsibilities = () => [
    { role: 'Project Manager', responsibilities: ['Timeline management', 'Risk tracking', 'Stakeholder communication'] },
    { role: 'Technical Lead', responsibilities: ['Architecture decisions', 'Quality assurance', 'Team coordination'] },
    { role: 'Business Analyst', responsibilities: ['Requirements validation', 'Process design', 'User acceptance'] }
  ];

  const generateSuccessMetrics = () => [
    { metric: 'On-time delivery', target: '95%', current: '87%' },
    { metric: 'Budget adherence', target: '≤ 5% variance', current: '2.3% under' },
    { metric: 'Quality score', target: '4.5/5', current: '4.2/5' },
    { metric: 'Stakeholder satisfaction', target: '90%+', current: '92%' }
  ];

  const generateKeyAchievements = () => [
    `${documents.length} strategic documents completed`,
    `${diagrams.length} process diagrams validated`,
    'Comprehensive risk assessment finalized',
    'Stakeholder alignment achieved across all workstreams'
  ];

  const generateCallToAction = () => ({
    primary: 'Approve Strategic Implementation Plan',
    secondary: 'Authorize Phase 2 Budget Release',
    timeline: 'Decision Required: Next Board Meeting',
    impact: '$2.3M strategic investment opportunity'
  });

  // Interactive element handlers
  const handleSlideClick = useCallback((event: React.MouseEvent) => {
    if (interactionMode === 'view' || !slides[currentSlide]?.allowInteraction) return;

    const rect = slideRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newElement: InteractiveElement = {
      id: `element-${Date.now()}`,
      type: interactionMode as any,
      x,
      y,
      content: interactionMode === 'comment' ? 'New comment...' : 'Annotation',
      timestamp: new Date(),
      color: getInteractionColor(interactionMode)
    };

    setInteractiveElements(prev => ({
      ...prev,
      [slides[currentSlide].id]: [...(prev[slides[currentSlide].id] || []), newElement]
    }));

    // Track interaction
    setViewingStats(prev => ({
      ...prev,
      interactions: [...prev.interactions, {
        slide: currentSlide,
        type: interactionMode,
        timestamp: new Date()
      }]
    }));

    toast({
      title: "Interactive Element Added",
      description: `${interactionMode} added to slide`,
    });
  }, [interactionMode, currentSlide, slides]);

  const getInteractionColor = (mode: string) => {
    const colors = {
      annotate: '#3b82f6',
      highlight: '#eab308',
      comment: '#10b981',
      hotspot: '#ef4444'
    };
    return colors[mode as keyof typeof colors] || '#6b7280';
  };

  // Mouse tracking for laser pointer
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (laserPointer && slideRef.current) {
      const rect = slideRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    }
  }, [laserPointer]);

  // Enhanced slide navigation with analytics
  const navigateToSlide = (slideIndex: number) => {
    // Record time spent on current slide
    const timeSpent = Date.now() - viewStartTime.current.getTime();
    setViewingStats(prev => ({
      ...prev,
      slideViews: { ...prev.slideViews, [currentSlide]: (prev.slideViews[currentSlide] || 0) + 1 },
      timeSpent: { ...prev.timeSpent, [currentSlide]: (prev.timeSpent[currentSlide] || 0) + timeSpent }
    }));

    setCurrentSlide(slideIndex);
    viewStartTime.current = new Date();
  };

  const nextSlide = () => {
    navigateToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    navigateToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  };

  // Auto-advance with enhanced timing
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      timerRef.current = setTimeout(() => {
        nextSlide();
      }, slides[currentSlide]?.duration * 1000 || 8000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, autoAdvance, currentSlide, slides]);

  // Enhanced keyboard shortcuts
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
        case 'l':
        case 'L':
          setLaserPointer(!laserPointer);
          break;
        case 'g':
        case 'G':
          setShowGrid(!showGrid);
          break;
        case 'n':
        case 'N':
          setShowNotes(!showNotes);
          break;
        case 'a':
        case 'A':
          setInteractionMode('annotate');
          break;
        case 'h':
        case 'H':
          setInteractionMode('highlight');
          break;
        case 'c':
        case 'C':
          setInteractionMode('comment');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, laserPointer, showGrid, showNotes]);

  const toggleFullscreen = () => {
    if (!isFullscreen && presentationRef.current) {
      presentationRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportPresentationData = () => {
    const data = {
      presentation: {
        project: project.name,
        slides: slides.length,
        mode: presentationMode,
        template: slideTemplate
      },
      analytics: viewingStats,
      interactions: interactiveElements,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-presentation-data.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Presentation Data Exported",
      description: "Analytics and interaction data downloaded",
    });
  };

  // Enhanced slide content renderer with interactive features
  const renderAdvancedSlideContent = (slide: PresentationSlide) => {
    const slideElements = interactiveElements[slide.id] || [];

    const renderSlideTemplate = () => {
      switch (slide.type) {
        case 'cover':
          return (
            <div className={`h-full relative ${
              slide.template === 'infographic' ? 'bg-gradient-to-br from-primary via-primary/80 to-primary/60' :
              slide.template === 'minimal' ? 'bg-white' :
              'bg-gradient-to-br from-primary/20 to-primary/5'
            } rounded-lg overflow-hidden`}>
              
              {/* Background Pattern for infographic style */}
              {slide.template === 'infographic' && (
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                  <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
                  <div className="absolute top-1/2 right-10 w-16 h-16 bg-white rounded-full"></div>
                </div>
              )}

              <div className="relative h-full flex flex-col items-center justify-center text-center p-12">
                <div className="space-y-8 max-w-4xl">
                  <div className="space-y-6">
                    <h1 className={`font-bold ${
                      slide.template === 'infographic' ? 'text-6xl text-white' :
                      slide.template === 'minimal' ? 'text-5xl text-gray-900' :
                      'text-6xl text-primary'
                    }`}>
                      {slide.content.title}
                    </h1>
                    <p className={`text-2xl ${
                      slide.template === 'infographic' ? 'text-white/90' :
                      slide.template === 'minimal' ? 'text-gray-600' :
                      'text-muted-foreground'
                    }`}>
                      {slide.content.subtitle}
                    </p>
                  </div>

                  {/* Interactive stats display */}
                  <div className="grid grid-cols-3 gap-8 mt-12">
                    <Card className={`${slide.template === 'infographic' ? 'bg-white/20 border-white/30' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className={`text-4xl font-bold ${
                            slide.template === 'infographic' ? 'text-white' : 'text-primary'
                          }`}>
                            {slide.content.stats.documents}
                          </p>
                          <p className={`text-sm ${
                            slide.template === 'infographic' ? 'text-white/80' : 'text-muted-foreground'
                          }`}>
                            Strategic Documents
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`${slide.template === 'infographic' ? 'bg-white/20 border-white/30' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className={`text-4xl font-bold ${
                            slide.template === 'infographic' ? 'text-white' : 'text-primary'
                          }`}>
                            {slide.content.stats.diagrams}
                          </p>
                          <p className={`text-sm ${
                            slide.template === 'infographic' ? 'text-white/80' : 'text-muted-foreground'
                          }`}>
                            Process Diagrams
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className={`${slide.template === 'infographic' ? 'bg-white/20 border-white/30' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className={`text-4xl font-bold ${
                            slide.template === 'infographic' ? 'text-white' : 'text-primary'
                          }`}>
                            {slide.content.stats.completion}%
                          </p>
                          <p className={`text-sm ${
                            slide.template === 'infographic' ? 'text-white/80' : 'text-muted-foreground'
                          }`}>
                            Project Completion
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className={`space-y-3 text-lg ${
                    slide.template === 'infographic' ? 'text-white/90' :
                    slide.template === 'minimal' ? 'text-gray-700' :
                    'text-muted-foreground'
                  }`}>
                    <p><strong>Organization:</strong> {slide.content.organization}</p>
                    <p><strong>Date:</strong> {slide.content.date}</p>
                    <p><strong>Presenter:</strong> {slide.content.presenter}</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'overview':
          return (
            <div className="h-full p-8">
              <h2 className="text-4xl font-bold mb-8 text-center">Executive Dashboard</h2>
              
              <div className="grid grid-cols-4 gap-6 mb-8">
                {slide.content.kpis.map((kpi: any, index: number) => (
                  <Card key={index} className="relative overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{kpi.metric}</p>
                          <TrendingUp className={`h-4 w-4 ${
                            kpi.trend === 'up' ? 'text-green-500' :
                            kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                          }`} />
                        </div>
                        <p className="text-3xl font-bold text-primary">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground">Target: {kpi.target}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-8 h-2/3">
                {/* Progress Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Project Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {slide.content.charts.progress.map((phase: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{phase.phase}</span>
                            <span className="text-sm text-muted-foreground">{phase.completion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-1000"
                              style={{ width: `${phase.completion}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Heatmap */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {slide.content.heatmap.riskAreas.map((risk: any, index: number) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          risk.severity === 'high' ? 'bg-red-100 border-red-200' :
                          risk.severity === 'medium' ? 'bg-yellow-100 border-yellow-200' :
                          'bg-green-100 border-green-200'
                        } border`}>
                          <p className="font-medium text-sm">{risk.area}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {risk.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {risk.likelihood}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );

        case 'comparison':
          return (
            <div className="h-full p-8">
              <h2 className="text-4xl font-bold mb-8 text-center">Document Analysis & Comparison</h2>
              
              <div className="grid grid-cols-3 gap-8 h-full">
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">Document Overview</h3>
                  <div className="space-y-4">
                    {slide.content.documents.map((doc: any, index: number) => (
                      <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <p className="font-semibold">{doc.title}</p>
                            <Badge variant="outline">{doc.document_type}</Badge>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {doc.content.substring(0, 100)}...
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">Comparative Analysis</h3>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-green-600">Similarities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slide.content.comparison.similarities.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-600">Differences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slide.content.comparison.differences.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold">Insights & Gaps</h3>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg text-yellow-600">Identified Gaps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slide.content.comparison.gaps.map((gap: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slide.content.insights.map((insight: string, index: number) => (
                          <div key={index} className="p-2 bg-primary/5 rounded-lg">
                            <span className="text-sm">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );

        case 'diagram':
          return (
            <div className="h-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold">{slide.title}</h2>
                <div className="flex gap-2">
                  <Badge variant="outline">Interactive</Badge>
                  <Badge variant="outline">{slide.content.flowAnalysis.complexity} Complexity</Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 h-full">
                <div className="col-span-2">
                  <Card className="h-full">
                    <CardContent className="pt-4 h-full">
                      <div 
                        className="mermaid h-full flex items-center justify-center text-sm"
                        dangerouslySetInnerHTML={{ __html: slide.content.mermaidCode }}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Flow Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{slide.content.flowAnalysis.nodes}</p>
                          <p className="text-sm text-muted-foreground">Nodes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{slide.content.flowAnalysis.connections}</p>
                          <p className="text-sm text-muted-foreground">Connections</p>
                        </div>
                        <div className="text-center col-span-2">
                          <p className="text-xl font-bold text-primary">{slide.content.flowAnalysis.density}</p>
                          <p className="text-sm text-muted-foreground">Density Ratio</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Interactive Nodes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {slide.content.interactiveNodes.map((node: any, index: number) => (
                          <div 
                            key={index} 
                            className="p-2 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => {
                              toast({
                                title: "Node Selected",
                                description: node.description,
                              });
                            }}
                          >
                            <p className="font-medium text-sm">{node.label}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Diagram Insights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Process flow validated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Dependencies mapped</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Critical path identified</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );

        case 'interactive':
          return (
            <div className="h-full p-8">
              <h2 className="text-4xl font-bold mb-8 text-center">Workshop: Strategic Planning Session</h2>
              
              <div className="grid grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Workshop Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {slide.content.activities.map((activity: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{activity.name}</h4>
                              <Badge variant="outline">{activity.duration}min</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Participants: {activity.participants}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Available Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {slide.content.tools.map((tool: string, index: number) => (
                          <Button key={index} variant="outline" className="justify-start">
                            <PenTool className="h-4 w-4 mr-2" />
                            {tool}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Expected Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {slide.content.outcomes.map((outcome: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resources & Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {slide.content.resources.map((resource: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{resource}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <Users className="h-12 w-12 text-primary mx-auto" />
                        <h3 className="text-xl font-bold">Interactive Session</h3>
                        <p className="text-muted-foreground">
                          Engage with stakeholders in real-time collaborative planning
                        </p>
                        <Button className="w-full">
                          Join Workshop
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );

        case 'summary':
          return (
            <div className="h-full p-8">
              <h2 className="text-4xl font-bold mb-8 text-center">Strategic Action Plan</h2>
              
              <div className="grid grid-cols-3 gap-8 h-full">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Key Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {slide.content.keyAchievements.map((achievement: string, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm">{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Success Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {slide.content.successMetrics.map((metric: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{metric.metric}</span>
                              <span className="text-muted-foreground">{metric.current}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Target: {metric.target}</span>
                              <span className={
                                metric.current.includes('%') && parseFloat(metric.current) >= parseFloat(metric.target) ||
                                metric.current.includes('under') ? 'text-green-600' : 'text-yellow-600'
                              }>
                                {metric.current.includes('%') && parseFloat(metric.current) >= parseFloat(metric.target) ||
                                 metric.current.includes('under') ? 'On Track' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Action Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {slide.content.actionItems.map((item: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-sm">{item.action}</p>
                              <Badge variant={item.priority === 'High' ? 'default' : 'outline'} className="text-xs">
                                {item.priority}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.owner}</span>
                              <span>{item.due}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Timeline Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {slide.content.timeline.map((phase: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{phase.phase}</span>
                            <Badge variant="outline">{phase.actions} actions</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {slide.content.responsibilities.map((role: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <p className="font-semibold text-sm">{role.role}</p>
                            <div className="space-y-1">
                              {role.responsibilities.map((resp: string, respIndex: number) => (
                                <div key={respIndex} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                  <span className="text-xs text-muted-foreground">{resp}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-primary to-primary/80 text-white">
                    <CardContent className="pt-6">
                      <div className="text-center space-y-4">
                        <Zap className="h-12 w-12 mx-auto" />
                        <h3 className="text-2xl font-bold">Call to Action</h3>
                        <p className="text-xl">{slide.content.callToAction.primary}</p>
                        <p className="text-lg opacity-90">{slide.content.callToAction.secondary}</p>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-lg px-4 py-2">
                            {slide.content.callToAction.timeline}
                          </Badge>
                          <p className="text-sm opacity-80">{slide.content.callToAction.impact}</p>
                        </div>
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

    return (
      <div 
        className="relative h-full"
        onClick={handleSlideClick}
        onMouseMove={handleMouseMove}
      >
        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <svg className="w-full h-full opacity-20">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#6b7280" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Slide content */}
        {renderSlideTemplate()}

        {/* Interactive elements overlay */}
        {slideElements.map((element) => (
          <div
            key={element.id}
            className="absolute z-20 cursor-pointer"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element);
            }}
          >
            {element.type === 'hotspot' && (
              <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white">
                <div className="w-3 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            )}
            {element.type === 'annotation' && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs shadow-lg max-w-32">
                {element.content}
              </div>
            )}
            {element.type === 'highlight' && (
              <div 
                className="bg-yellow-300 opacity-50 rounded"
                style={{
                  width: `${element.width || 10}px`,
                  height: `${element.height || 4}px`
                }}
              ></div>
            )}
            {element.type === 'comment' && (
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-green-500 fill-current" />
                <div className="absolute top-8 left-0 bg-green-500 text-white p-2 rounded text-xs shadow-lg min-w-32 max-w-48">
                  {element.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Laser pointer */}
        {laserPointer && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: mousePosition.x,
              top: mousePosition.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-4 h-4 bg-red-500 rounded-full opacity-80 shadow-lg animate-pulse">
              <div className="w-2 h-2 bg-red-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] p-0">
        <div ref={presentationRef} className="relative h-[96vh] bg-white">
          {/* Enhanced Presentation Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-b p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="font-mono">
                  {currentSlide + 1} / {slides.length}
                </Badge>
                <h3 className="font-semibold truncate max-w-md">{slides[currentSlide]?.title}</h3>
                {slides[currentSlide]?.allowInteraction && (
                  <Badge variant="secondary" className="text-xs">
                    <Hand className="h-3 w-3 mr-1" />
                    Interactive
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Presentation Mode Selector */}
                <Select 
                  value={presentationMode} 
                  onValueChange={(value: any) => setPresentationMode(value)}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>

                {/* Template Selector */}
                <Select 
                  value={slideTemplate} 
                  onValueChange={(value: any) => setSlideTemplate(value)}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="infographic">Infographic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>

                {/* Interaction Mode */}
                {slides[currentSlide]?.allowInteraction && (
                  <Select 
                    value={interactionMode} 
                    onValueChange={(value: any) => setInteractionMode(value)}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          View
                        </div>
                      </SelectItem>
                      <SelectItem value="annotate">
                        <div className="flex items-center gap-2">
                          <PenTool className="h-3 w-3" />
                          Annotate
                        </div>
                      </SelectItem>
                      <SelectItem value="highlight">
                        <div className="flex items-center gap-2">
                          <Palette className="h-3 w-3" />
                          Highlight
                        </div>
                      </SelectItem>
                      <SelectItem value="comment">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-3 w-3" />
                          Comment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Advanced Tools */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLaserPointer(!laserPointer)}
                    className={`h-8 w-8 p-0 ${laserPointer ? 'bg-red-100' : ''}`}
                  >
                    <MousePointer className={`h-4 w-4 ${laserPointer ? 'text-red-500' : ''}`} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowGrid(!showGrid)}
                    className={`h-8 w-8 p-0 ${showGrid ? 'bg-gray-100' : ''}`}
                  >
                    <Grid className={`h-4 w-4 ${showGrid ? 'text-gray-600' : ''}`} />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="h-8 w-8 p-0">
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    ×
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Content */}
          <div ref={slideRef} className="pt-16 pb-16 h-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${
              slides[currentSlide]?.animation === 'fade' ? 'animate-in fade-in duration-500' :
              slides[currentSlide]?.animation === 'slide' ? 'animate-in slide-in-from-right duration-500' :
              slides[currentSlide]?.animation === 'zoom' ? 'animate-in zoom-in duration-300' :
              slides[currentSlide]?.animation === 'flip' ? 'animate-in slide-in-from-left duration-400' : ''
            }`}>
              {slides[currentSlide] && renderAdvancedSlideContent(slides[currentSlide])}
            </div>
          </div>

          {/* Enhanced Presentation Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Navigation Controls */}
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={prevSlide} className="h-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="h-8">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextSlide} className="h-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Auto-advance Controls */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoAdvance}
                    onCheckedChange={setAutoAdvance}
                    className="scale-75"
                  />
                  <span className="text-sm">Auto</span>
                </div>

                {/* Slide Speed */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{slideSpeed[0]}s</span>
                  <Slider
                    value={slideSpeed}
                    onValueChange={setSlideSpeed}
                    max={20}
                    min={3}
                    step={1}
                    className="w-16"
                  />
                </div>
              </div>
              
              {/* Advanced Features */}
              <div className="flex items-center gap-2">
                {/* Notes Toggle */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotes(!showNotes)}
                  className={`h-8 ${showNotes ? 'bg-gray-100' : ''}`}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Notes
                </Button>

                {/* Share */}
                <Button variant="outline" size="sm" className="h-8">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                {/* Export Analytics */}
                <Button variant="outline" size="sm" onClick={exportPresentationData} className="h-8">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>

                {/* Viewing Stats */}
                <div className="text-xs text-muted-foreground px-2 py-1 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3" />
                    <span>Views: {viewingStats.slideViews[currentSlide] || 0}</span>
                    <span>•</span>
                    <span>Time: {Math.round((viewingStats.timeSpent[currentSlide] || 0) / 1000)}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Thumbnails (Mini Navigation) */}
          {presentationMode === 'interactive' && (
            <div className="absolute right-4 top-20 bottom-20 w-32 bg-white/90 backdrop-blur-sm rounded-lg p-2 overflow-y-auto">
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`p-2 rounded cursor-pointer transition-colors text-xs ${
                      index === currentSlide ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => navigateToSlide(index)}
                  >
                    <p className="font-medium truncate">{slide.title}</p>
                    <p className="text-xs opacity-75">{index + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedStakeholderPresentation;