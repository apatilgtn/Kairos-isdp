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
import { useAppStore } from '@/store/app-store';
import { APIService, DIAGRAM_TEMPLATES } from '@/lib/api';
import { 
  GitBranch, 
  Plus, 
  Eye, 
  Code,
  Save,
  Loader2,
  Copy,
  Trash2,
  FileImage,
  Layout,
  Calendar,
  BarChart3,
  Download
} from 'lucide-react';
import type { MVPProject, UserDiagram, DiagramTemplate } from '@/types';

interface DiagramsTabProps {
  project: MVPProject;
  diagrams: UserDiagram[];
  onDiagramSaved: () => void;
}

export const DiagramsTab: React.FC<DiagramsTabProps> = ({
  project,
  diagrams,
  onDiagramSaved
}) => {
  const { addNotification } = useAppStore();
  const [selectedDiagram, setSelectedDiagram] = useState<UserDiagram | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDiagram, setEditingDiagram] = useState<{
    title: string;
    diagram_type: UserDiagram['diagram_type'];
    mermaid_code: string;
  }>({
    title: '',
    diagram_type: 'flowchart',
    mermaid_code: ''
  });

  // Mermaid initialization
  useEffect(() => {
    const initMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true
          }
        });
      } catch (error) {
        console.error('Failed to initialize mermaid:', error);
      }
    };
    initMermaid();
  }, []);

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingDiagram({
      title: '',
      diagram_type: 'flowchart',
      mermaid_code: ''
    });
    setSelectedDiagram(null);
  };

  const handleSelectTemplate = (template: DiagramTemplate) => {
    setEditingDiagram({
      title: template.name,
      diagram_type: template.type,
      mermaid_code: template.template
    });
  };

  const handleSaveDiagram = async () => {
    if (!editingDiagram.title.trim() || !editingDiagram.mermaid_code.trim()) {
      addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please provide both title and diagram code.',
        duration: 3000
      });
      return;
    }

    setIsSaving(true);
    try {
      await APIService.saveDiagram({
        project_id: project._id,
        title: editingDiagram.title,
        diagram_type: editingDiagram.diagram_type,
        mermaid_code: editingDiagram.mermaid_code
      });

      onDiagramSaved();
      setIsCreating(false);
      setEditingDiagram({
        title: '',
        diagram_type: 'flowchart',
        mermaid_code: ''
      });

      addNotification({
        type: 'success',
        title: 'Diagram Saved!',
        message: `${editingDiagram.title} has been saved successfully.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to save diagram:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save the diagram. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Diagram code copied to clipboard.',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy to clipboard.',
        duration: 3000
      });
    }
  };

  const handleExportDiagram = async (diagram: UserDiagram, format: 'png' | 'svg' | 'pdf') => {
    try {
      addNotification({
        type: 'info',
        title: `Exporting diagram as ${format.toUpperCase()}...`,
        message: 'Preparing your diagram for download.',
        duration: 2000
      });

      // For now, we'll export the mermaid code as text files
      // In a full implementation, you would render the mermaid diagram and export as image/pdf
      const content = `# ${diagram.title}\n\n\`\`\`mermaid\n${diagram.mermaid_code}\n\`\`\`\n\nGenerated: ${new Date().toISOString()}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${diagram.title.replace(/\s+/g, '_')}.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      addNotification({
        type: 'success',
        title: 'Export Complete!',
        message: `Diagram exported as Markdown file.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: `Could not export diagram.`,
        duration: 3000
      });
    }
  };

  const renderMermaidDiagram = (code: string, id: string) => {
    useEffect(() => {
      const renderDiagram = async () => {
        try {
          const mermaid = (await import('mermaid')).default;
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = '';
            mermaid.render(`diagram-${id}`, code).then(({ svg }) => {
              element.innerHTML = svg;
            }).catch((error) => {
              console.error('Mermaid render error:', error);
              element.innerHTML = '<p class="text-destructive text-sm">Invalid diagram syntax</p>';
            });
          }
        } catch (error) {
          console.error('Mermaid import error:', error);
        }
      };
      renderDiagram();
    }, [code, id]);

    return <div id={id} className="w-full min-h-[200px] flex items-center justify-center border rounded-lg bg-muted/10" />;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: UserDiagram['diagram_type']) => {
    switch (type) {
      case 'flowchart': return Layout;
      case 'sequence': return BarChart3;
      case 'gantt': return Calendar;
      case 'user_journey': return GitBranch;
      default: return FileImage;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Visual Diagrams</h2>
          <p className="text-muted-foreground">
            Create flowcharts, system architecture, and process diagrams
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Diagram
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagrams List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-primary" />
              <span>Your Diagrams ({diagrams.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {diagrams.length === 0 ? (
              <div className="text-center py-8">
                <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No Diagrams Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first diagram to visualize your MVP architecture.
                </p>
                <Button onClick={handleCreateNew} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Diagram
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {diagrams.map((diagram) => {
                  const Icon = getTypeIcon(diagram.diagram_type);
                  return (
                    <Card 
                      key={diagram._id}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedDiagram?._id === diagram._id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedDiagram(diagram)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-medium">{diagram.title}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {diagram.diagram_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(diagram.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportDiagram(diagram, 'png');
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(diagram.mermaid_code);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagram Viewer/Editor */}
        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>Create New Diagram</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {DIAGRAM_TEMPLATES.map((template) => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer hover:shadow-sm transition-all"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {template.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="diagram-title">Title</Label>
                        <Input
                          id="diagram-title"
                          placeholder="e.g., User Registration Flow"
                          value={editingDiagram.title}
                          onChange={(e) => setEditingDiagram(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="diagram-type">Type</Label>
                        <Select 
                          value={editingDiagram.diagram_type}
                          onValueChange={(value) => setEditingDiagram(prev => ({ 
                            ...prev, 
                            diagram_type: value as UserDiagram['diagram_type'] 
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flowchart">Flowchart</SelectItem>
                            <SelectItem value="sequence">Sequence Diagram</SelectItem>
                            <SelectItem value="gantt">Gantt Chart</SelectItem>
                            <SelectItem value="user_journey">User Journey</SelectItem>
                            <SelectItem value="class">Class Diagram</SelectItem>
                            <SelectItem value="state">State Diagram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="diagram-code">Mermaid Code</Label>
                      <Textarea
                        id="diagram-code"
                        placeholder="graph TD&#10;    A[Start] --> B[Process]&#10;    B --> C[End]"
                        value={editingDiagram.mermaid_code}
                        onChange={(e) => setEditingDiagram(prev => ({ ...prev, mermaid_code: e.target.value }))}
                        className="font-mono text-sm resize-none"
                        rows={8}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={handleSaveDiagram}
                        disabled={isSaving || !editingDiagram.title.trim() || !editingDiagram.mermaid_code.trim()}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Diagram
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setEditingDiagram({
                            title: '',
                            diagram_type: 'flowchart',
                            mermaid_code: ''
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : selectedDiagram ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-accent" />
                    <span>{selectedDiagram.title}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedDiagram.diagram_type.replace('_', ' ')} • {formatDate(selectedDiagram.created_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyCode(selectedDiagram.mermaid_code)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview">
                  <div className="border rounded-lg p-4 bg-card">
                    {renderMermaidDiagram(selectedDiagram.mermaid_code, `preview-${selectedDiagram._id}`)}
                  </div>
                </TabsContent>
                
                <TabsContent value="code">
                  <div className="space-y-4">
                    <ScrollArea className="h-64 w-full">
                      <pre className="text-sm font-mono bg-muted p-4 rounded-lg">
                        {selectedDiagram.mermaid_code}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
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