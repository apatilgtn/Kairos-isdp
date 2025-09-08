import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Brain,
  Loader2,
  Copy,
  Download,
  RefreshCw,
  Calendar,
  Lightbulb,
  Edit3,
  Eye,
  Bot,
  Send,
  Wand2,
  BarChart3
} from 'lucide-react';
import type { MVPProject, RoadmapDocument } from '@/types';
import { CollaborativeEditor } from '@/components/CollaborativeEditor';

interface RoadmapTabProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  onDocumentGenerated: () => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  project,
  documents,
  onDocumentGenerated
}) => {
  const { addNotification } = useAppStore();
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [modelUseCase, setModelUseCase] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<RoadmapDocument | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: number}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleGenerateRoadmap = async (retryAttempt = 0) => {
    setGeneratingType('roadmap');
    setRetryCount(retryAttempt);
    
    try {
      // Check authentication first
      const isAuthenticated = await APIService.checkAuthStatus();
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      addNotification({
        type: 'info',
        title: 'Generating Roadmap...',
        message: 'AI is analyzing your project and creating a comprehensive roadmap.',
        duration: 3000
      });
      
      const response = await APIService.generateRoadmap(project);
      if (response.success && response.content.trim()) {
        await APIService.saveDocument({
          project_id: project._id,
          document_type: 'roadmap',
          title: `MVP Roadmap - ${project.name}`,
          content: response.content
        });
        
        onDocumentGenerated();
        setRetryCount(0);
        addNotification({
          type: 'success',
          title: 'Roadmap Generated!',
          message: 'Your comprehensive MVP roadmap has been created successfully.',
          duration: 5000
        });
      } else {
        throw new Error(response.error || 'Empty response from AI');
      }
    } catch (error) {
      console.error(`Failed to generate roadmap (attempt ${retryAttempt + 1}):`, error);
      
      if (retryAttempt < 2) {
        // Auto-retry up to 3 times
        setTimeout(() => handleGenerateRoadmap(retryAttempt + 1), 2000);
        addNotification({
          type: 'warning',
          title: `Retrying... (${retryAttempt + 2}/3)`,
          message: 'Generation failed, attempting retry.',
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Generation Failed',
          message: 'Could not generate the roadmap after 3 attempts. Try refreshing the page or visit the Test page to diagnose the issue.',
          duration: 8000
        });
      }
    } finally {
      if (retryAttempt >= 2) {
        setGeneratingType(null);
        setRetryCount(0);
      }
    }
  };

  // Wrapper function for button click handler
  const handleGenerateRoadmapClick = () => {
    handleGenerateRoadmap(0);
  };

  const handleGenerateElevatorPitch = async () => {
    setGeneratingType('elevator_pitch');
    try {
      // Check authentication first
      const isAuthenticated = await APIService.checkAuthStatus();
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await APIService.generateElevatorPitch(project);
      if (response.success) {
        await APIService.saveDocument({
          project_id: project._id,
          document_type: 'elevator_pitch',
          title: `Elevator Pitch - ${project.name}`,
          content: response.content
        });
        
        onDocumentGenerated();
        addNotification({
          type: 'success',
          title: 'Elevator Pitch Generated!',
          message: 'Your compelling elevator pitch is ready.',
          duration: 5000
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Failed to generate elevator pitch:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Could not generate the elevator pitch. Please try again.',
        duration: 5000
      });
    } finally {
      setGeneratingType(null);
    }
  };

  const handleGenerateModelAdvice = async () => {
    if (!modelUseCase.trim()) {
      addNotification({
        type: 'warning',
        title: 'Use Case Required',
        message: 'Please describe your AI/ML use case first.',
        duration: 3000
      });
      return;
    }

    setGeneratingType('model_advice');
    try {
      // Check authentication first
      const isAuthenticated = await APIService.checkAuthStatus();
      if (!isAuthenticated) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await APIService.generateModelAdvice(modelUseCase, project);
      if (response.success) {
        await APIService.saveDocument({
          project_id: project._id,
          document_type: 'model_advice',
          title: `AI Model Advice - ${modelUseCase}`,
          content: response.content
        });
        
        onDocumentGenerated();
        setModelUseCase('');
        addNotification({
          type: 'success',
          title: 'Model Advice Generated!',
          message: 'Your AI/ML recommendations are ready.',
          duration: 5000
        });
      } else {
        throw new Error(response.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Failed to generate model advice:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Could not generate model advice. Please try again.',
        duration: 5000
      });
    } finally {
      setGeneratingType(null);
    }
  };

  const handleCopyContent = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Content copied to clipboard.',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy content to clipboard.',
        duration: 3000
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDocumentsByType = (type: RoadmapDocument['document_type']) => {
    return documents.filter(doc => doc.document_type === type).sort((a, b) => b.generated_at - a.generated_at);
  };

  const handleEditDocument = (document: RoadmapDocument) => {
    setSelectedDocument(document);
    setEditingContent(document.content);
    setChatMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'm here to help you enhance your ${document.document_type.replace('_', ' ')}. What would you like to improve or add?`,
      timestamp: Date.now()
    }]);
    setShowEditDialog(true);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !selectedDocument || isChatting) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);
    
    try {
      const response = await APIService.enhanceDocument(
        selectedDocument,
        chatInput,
        editingContent,
        project
      );
      
      if (response.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: response.content,
          timestamp: Date.now()
        };
        
        setChatMessages(prev => [...prev, assistantMessage]);
        
        // If the response includes an enhanced version, update the editing content
        if (response.enhancedContent) {
          setEditingContent(response.enhancedContent);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try your request again.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleSaveEnhancedDocument = async () => {
    if (!selectedDocument || !editingContent.trim()) return;
    
    try {
      await APIService.saveDocument({
        project_id: project._id,
        document_type: selectedDocument.document_type,
        title: `${selectedDocument.title} (Enhanced)`,
        content: editingContent
      });
      
      onDocumentGenerated();
      setShowEditDialog(false);
      addNotification({
        type: 'success',
        title: 'Document Enhanced!',
        message: 'Your enhanced document has been saved.',
        duration: 3000
      });
    } catch (error) {
      console.error('Failed to save enhanced document:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save the enhanced document.',
        duration: 3000
      });
    }
  };

  const handleExportDocument = async (document: RoadmapDocument, format: 'docx' | 'pdf') => {
    try {
      addNotification({
        type: 'info',
        title: `Exporting to ${format.toUpperCase()}...`,
        message: 'Preparing your document for download.',
        duration: 2000
      });
      
      const exported = await APIService.exportDocument(document, format);
      if (exported.success && exported.blob) {
        const url = window.URL.createObjectURL(exported.blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.title}.${format}`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
        
        addNotification({
          type: 'success',
          title: 'Export Complete!',
          message: `Document exported as ${format.toUpperCase()}.`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: `Could not export document as ${format.toUpperCase()}.`,
        duration: 3000
      });
    }
  };

  const handleGenerateDiagram = async (document: RoadmapDocument) => {
    try {
      setGeneratingType('diagram');
      addNotification({
        type: 'info',
        title: 'Generating Diagram...',
        message: 'Creating visual representation of your roadmap.',
        duration: 3000
      });
      
      const response = await APIService.generateDiagramFromContent(document, project);
      if (response.success) {
        await APIService.saveDiagram({
          project_id: project._id,
          title: `${document.title} - Visual Diagram`,
          diagram_type: 'flowchart',
          mermaid_code: response.content
        });
        
        addNotification({
          type: 'success',
          title: 'Diagram Generated!',
          message: 'Visual diagram created from your roadmap.',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Diagram generation failed:', error);
      addNotification({
        type: 'error',
        title: 'Diagram Generation Failed',
        message: 'Could not generate diagram from content.',
        duration: 3000
      });
    } finally {
      setGeneratingType(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Generation Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>AI Content Generation</span>
            </CardTitle>
            <CardDescription>
              Generate comprehensive MVP documentation using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* MVP Roadmap Generator */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">MVP Roadmap</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a comprehensive roadmap with features, risks, KPIs, and milestones.
              </p>
              <Button 
                onClick={handleGenerateRoadmapClick}
                disabled={generatingType === 'roadmap'}
                className="w-full"
              >
                {generatingType === 'roadmap' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate MVP Roadmap
                  </>
                )}
              </Button>
              {getDocumentsByType('roadmap').length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Last generated: {formatDate(getDocumentsByType('roadmap')[0].generated_at)}
                </p>
              )}
            </div>

            <Separator />

            {/* Elevator Pitch Generator */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <h4 className="font-semibold">Elevator Pitch</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Create a compelling 60-90 second pitch for investors and stakeholders.
              </p>
              <Button 
                onClick={handleGenerateElevatorPitch}
                disabled={generatingType === 'elevator_pitch'}
                className="w-full"
                variant="outline"
              >
                {generatingType === 'elevator_pitch' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Crafting Pitch...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Generate Elevator Pitch
                  </>
                )}
              </Button>
              {getDocumentsByType('elevator_pitch').length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Last generated: {formatDate(getDocumentsByType('elevator_pitch')[0].generated_at)}
                </p>
              )}
            </div>

            <Separator />

            {/* AI Model Advisor */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">AI Model Advisor</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Get recommendations for AI models, datasets, and implementation strategies.
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="use-case">Describe your AI/ML use case</Label>
                  <Textarea
                    id="use-case"
                    placeholder="e.g., sentiment analysis for customer reviews, image classification for product categories, chatbot for customer support..."
                    value={modelUseCase}
                    onChange={(e) => setModelUseCase(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleGenerateModelAdvice}
                  disabled={generatingType === 'model_advice' || !modelUseCase.trim()}
                  className="w-full"
                  variant="outline"
                >
                  {generatingType === 'model_advice' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Use Case...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Get AI Model Advice
                    </>
                  )}
                </Button>
              </div>
              {getDocumentsByType('model_advice').length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Last generated: {formatDate(getDocumentsByType('model_advice')[0].generated_at)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Documents Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Generated Documents</span>
            </CardTitle>
            <CardDescription>
              View and manage your AI-generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">No Documents Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the AI generators to create your first document.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card 
                    key={doc._id} 
                    className={`cursor-pointer transition-all hover:shadow-sm ${
                      selectedDocument?._id === doc._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{doc.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {doc.document_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(doc.generated_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditDocument(doc);
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateDiagram(doc);
                            }}
                            disabled={generatingType === 'diagram'}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyContent(doc.content);
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Viewer */}
        {selectedDocument && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedDocument.title}</CardTitle>
                  <CardDescription>
                    Generated on {formatDate(selectedDocument.generated_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditDocument(selectedDocument)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit with AI
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportDocument(selectedDocument, 'docx')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Word
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportDocument(selectedDocument, 'pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyContent(selectedDocument.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CollaborativeEditor
                document={selectedDocument}
                onContentChange={(newContent) => {
                  setSelectedDocument({
                    ...selectedDocument,
                    content: newContent
                  });
                }}
                onSave={async () => {
                  try {
                    await APIService.updateRoadmapDocument(selectedDocument._id, {
                      content: selectedDocument.content
                    });
                    
                    addNotification({
                      type: 'success',
                      title: 'Document Saved',
                      message: 'Your changes have been saved successfully'
                    });
                    
                    onDocumentGenerated();
                  } catch (error) {
                    addNotification({
                      type: 'error',
                      title: 'Save Failed',
                      message: error instanceof Error ? error.message : 'Failed to save document'
                    });
                  }
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Chat Dialog for Document Enhancement */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-primary" />
              <span>AI Document Editor</span>
            </DialogTitle>
            <DialogDescription>
              Chat with AI to enhance and improve your {selectedDocument?.document_type.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
            {/* Document Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Document Content</h4>
                <Button 
                  size="sm" 
                  onClick={handleSaveEnhancedDocument}
                  disabled={!editingContent.trim()}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save Enhanced
                </Button>
              </div>
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Document content will appear here..."
              />
            </div>

            {/* AI Chat */}
            <div className="flex flex-col space-y-4">
              <h4 className="font-semibold">AI Assistant</h4>
              
              {/* Chat Messages */}
              <ScrollArea className="flex-1 border rounded-lg p-4 min-h-[400px]">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me to improve, add details, restructure, or enhance any part of your document..."
                  className="flex-1 resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isChatting}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Add more specific KPIs and success metrics")}
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Add KPIs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Expand the risk analysis section with more details")}
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Risk Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Improve the timeline and make it more specific")}
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Timeline
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};