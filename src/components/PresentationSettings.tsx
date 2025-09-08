import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, Palette, Timer, Users, Eye, Grid, 
  MousePointer, PenTool, MessageCircle, Bookmark,
  Volume2, Zap, Target, BarChart3, Layers,
  Sparkles, Play, Monitor, Presentation
} from 'lucide-react';

interface PresentationConfig {
  mode: 'executive' | 'detailed' | 'interactive' | 'workshop';
  template: 'standard' | 'dashboard' | 'infographic' | 'minimal';
  timing: {
    slideSpeed: number;
    autoAdvance: boolean;
    pauseOnInteraction: boolean;
  };
  features: {
    laserPointer: boolean;
    grid: boolean;
    annotations: boolean;
    realTimeComments: boolean;
    audiencePolling: boolean;
    screenShare: boolean;
  };
  customization: {
    brandColors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logoUrl?: string;
    presenterName: string;
    organization: string;
  };
  analytics: {
    trackViewing: boolean;
    recordInteractions: boolean;
    generateInsights: boolean;
  };
}

interface PresentationSettingsProps {
  onStart: (config: PresentationConfig) => void;
  isOpen: boolean;
  onClose: () => void;
  defaultConfig?: Partial<PresentationConfig>;
}

const PresentationSettings: React.FC<PresentationSettingsProps> = ({ 
  onStart, 
  isOpen, 
  onClose,
  defaultConfig
}) => {
  const [config, setConfig] = useState<PresentationConfig>({
    mode: 'executive',
    template: 'standard',
    timing: {
      slideSpeed: 8,
      autoAdvance: false,
      pauseOnInteraction: true
    },
    features: {
      laserPointer: true,
      grid: false,
      annotations: true,
      realTimeComments: false,
      audiencePolling: false,
      screenShare: false
    },
    customization: {
      brandColors: {
        primary: '#1e293b',
        secondary: '#0ea5e9',
        accent: '#06b6d4'
      },
      presenterName: 'Strategic Planning Team',
      organization: 'KAIROS Platform'
    },
    analytics: {
      trackViewing: true,
      recordInteractions: true,
      generateInsights: true
    }
  });

  // Apply default config if provided
  React.useEffect(() => {
    if (defaultConfig) {
      setConfig(prev => ({
        ...prev,
        ...defaultConfig,
        timing: { ...prev.timing, ...(defaultConfig.timing || {}) },
        features: { ...prev.features, ...(defaultConfig.features || {}) },
        customization: { ...prev.customization, ...(defaultConfig.customization || {}) },
        analytics: { ...prev.analytics, ...(defaultConfig.analytics || {}) }
      }));
    }
  }, [defaultConfig]);

  const updateConfig = <K extends keyof PresentationConfig>(
    section: K,
    updates: Partial<PresentationConfig[K]>
  ) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...(prev[section] as any), ...updates }
    }));
  };

  const handleStart = () => {
    onStart(config);
    onClose();
  };

  const presentationModes = [
    {
      value: 'executive',
      label: 'Executive Mode',
      description: 'High-level overview with key metrics and strategic insights',
      icon: Target,
      features: ['Strategic KPIs', 'Executive Summary', 'Decision Points']
    },
    {
      value: 'detailed',
      label: 'Detailed Analysis',
      description: 'Comprehensive document review with in-depth analysis',
      icon: BarChart3,
      features: ['All Documents', 'Detailed Metrics', 'Technical Analysis']
    },
    {
      value: 'interactive',
      label: 'Interactive Session',
      description: 'Engaging presentation with audience participation',
      icon: Users,
      features: ['Live Annotations', 'Real-time Q&A', 'Interactive Elements']
    },
    {
      value: 'workshop',
      label: 'Workshop Mode',
      description: 'Collaborative planning session with breakout activities',
      icon: Sparkles,
      features: ['Breakout Activities', 'Collaborative Tools', 'Action Planning']
    }
  ];

  const templates = [
    {
      value: 'standard',
      label: 'Professional Standard',
      description: 'Clean, corporate presentation design',
      preview: 'bg-gradient-to-br from-slate-50 to-slate-100'
    },
    {
      value: 'dashboard',
      label: 'Executive Dashboard',
      description: 'Data-driven layout with charts and metrics',
      preview: 'bg-gradient-to-br from-blue-50 to-indigo-100'
    },
    {
      value: 'infographic',
      label: 'Visual Infographic',
      description: 'Creative design with visual storytelling',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-100'
    },
    {
      value: 'minimal',
      label: 'Minimal Clean',
      description: 'Simple, distraction-free design',
      preview: 'bg-gradient-to-br from-gray-50 to-white'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Presentation Settings
          </DialogTitle>
          <DialogDescription>
            Customize your stakeholder presentation with advanced features and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mode" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="mode">Mode</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="mode" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Presentation Mode</h3>
                <div className="grid grid-cols-2 gap-4">
                  {presentationModes.map((mode) => {
                    const IconComponent = mode.icon;
                    return (
                      <Card 
                        key={mode.value}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          config.mode === mode.value ? 'ring-2 ring-primary border-primary' : ''
                        }`}
                        onClick={() => updateConfig('mode', mode.value as any)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <IconComponent className="h-5 w-5" />
                            {mode.label}
                          </CardTitle>
                          <CardDescription>{mode.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {mode.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="design" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Template Selection</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card 
                      key={template.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.template === template.value ? 'ring-2 ring-primary border-primary' : ''
                      }`}
                      onClick={() => updateConfig('template', template.value as any)}
                    >
                      <CardHeader>
                        <div className={`w-full h-20 rounded-md ${template.preview} mb-2`}></div>
                        <CardTitle className="text-base">{template.label}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Brand Customization</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="presenter">Presenter Name</Label>
                      <Input
                        id="presenter"
                        value={config.customization.presenterName}
                        onChange={(e) => updateConfig('customization', { presenterName: e.target.value })}
                        placeholder="Enter presenter name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={config.customization.organization}
                        onChange={(e) => updateConfig('customization', { organization: e.target.value })}
                        placeholder="Enter organization name"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={config.customization.brandColors.primary}
                          onChange={(e) => updateConfig('customization', { 
                            brandColors: { ...config.customization.brandColors, primary: e.target.value }
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={config.customization.brandColors.primary}
                          onChange={(e) => updateConfig('customization', { 
                            brandColors: { ...config.customization.brandColors, primary: e.target.value }
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Accent Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={config.customization.brandColors.secondary}
                          onChange={(e) => updateConfig('customization', { 
                            brandColors: { ...config.customization.brandColors, secondary: e.target.value }
                          })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={config.customization.brandColors.secondary}
                          onChange={(e) => updateConfig('customization', { 
                            brandColors: { ...config.customization.brandColors, secondary: e.target.value }
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Interactive Features</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MousePointer className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">Laser Pointer</p>
                          <p className="text-sm text-muted-foreground">Interactive cursor highlighting</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.laserPointer}
                        onCheckedChange={(checked) => updateConfig('features', { laserPointer: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Grid className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">Grid Overlay</p>
                          <p className="text-sm text-muted-foreground">Design alignment grid</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.grid}
                        onCheckedChange={(checked) => updateConfig('features', { grid: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <PenTool className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Live Annotations</p>
                          <p className="text-sm text-muted-foreground">Draw and annotate slides</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.annotations}
                        onCheckedChange={(checked) => updateConfig('features', { annotations: checked })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Real-time Comments</p>
                          <p className="text-sm text-muted-foreground">Audience feedback system</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.realTimeComments}
                        onCheckedChange={(checked) => updateConfig('features', { realTimeComments: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Audience Polling</p>
                          <p className="text-sm text-muted-foreground">Interactive polls and voting</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.audiencePolling}
                        onCheckedChange={(checked) => updateConfig('features', { audiencePolling: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-indigo-500" />
                        <div>
                          <p className="font-medium">Screen Sharing</p>
                          <p className="text-sm text-muted-foreground">Remote presentation capability</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.features.screenShare}
                        onCheckedChange={(checked) => updateConfig('features', { screenShare: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timing" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Presentation Timing</h3>
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        Slide Duration
                      </CardTitle>
                      <CardDescription>Default time per slide in seconds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-primary">{config.timing.slideSpeed}s</span>
                          <Slider
                            value={[config.timing.slideSpeed]}
                            onValueChange={([value]) => updateConfig('timing', { slideSpeed: value })}
                            max={30}
                            min={3}
                            step={1}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recommended: 8-12 seconds for executive mode, 15-20 for detailed analysis
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Auto-Advance Settings
                      </CardTitle>
                      <CardDescription>Automatic slide progression controls</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-advance">Enable Auto-Advance</Label>
                          <Switch
                            id="auto-advance"
                            checked={config.timing.autoAdvance}
                            onCheckedChange={(checked) => updateConfig('timing', { autoAdvance: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="pause-interaction">Pause on Interaction</Label>
                          <Switch
                            id="pause-interaction"
                            checked={config.timing.pauseOnInteraction}
                            onCheckedChange={(checked) => updateConfig('timing', { pauseOnInteraction: checked })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Presentation Analytics</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Viewing Analytics
                      </CardTitle>
                      <CardDescription>Track audience engagement and attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="track-viewing">Track Slide Viewing Time</Label>
                          <Switch
                            id="track-viewing"
                            checked={config.analytics.trackViewing}
                            onCheckedChange={(checked) => updateConfig('analytics', { trackViewing: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="record-interactions">Record User Interactions</Label>
                          <Switch
                            id="record-interactions"
                            checked={config.analytics.recordInteractions}
                            onCheckedChange={(checked) => updateConfig('analytics', { recordInteractions: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="generate-insights">Generate AI Insights</Label>
                          <Switch
                            id="generate-insights"
                            checked={config.analytics.generateInsights}
                            onCheckedChange={(checked) => updateConfig('analytics', { generateInsights: checked })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfig({
              mode: 'executive',
              template: 'standard',
              timing: { slideSpeed: 8, autoAdvance: false, pauseOnInteraction: true },
              features: { laserPointer: true, grid: false, annotations: true, realTimeComments: false, audiencePolling: false, screenShare: false },
              customization: { brandColors: { primary: '#1e293b', secondary: '#0ea5e9', accent: '#06b6d4' }, presenterName: 'Strategic Planning Team', organization: 'KAIROS Platform' },
              analytics: { trackViewing: true, recordInteractions: true, generateInsights: true }
            })}>
              Reset to Defaults
            </Button>
            <Button onClick={handleStart} className="btn-enterprise">
              <Presentation className="h-4 w-4 mr-2" />
              Start Advanced Presentation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PresentationSettings;