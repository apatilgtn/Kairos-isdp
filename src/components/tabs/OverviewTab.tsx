import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DocumentPhaseGuide } from '../DocumentPhaseGuide';
import { 
  FileText, 
  GitBranch, 
  Calendar, 
  TrendingUp,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface OverviewTabProps {
  project: MVPProject;
  documents: RoadmapDocument[];
  diagrams: UserDiagram[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  project,
  documents,
  diagrams,
  isLoading,
  onRefresh
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDocumentsByType = (type: RoadmapDocument['document_type']) => {
    return documents.filter(doc => doc.document_type === type);
  };

  const getDiagramsByType = (type: UserDiagram['diagram_type']) => {
    return diagrams.filter(diagram => diagram.diagram_type === type);
  };

  const getProjectProgress = () => {
    const totalAssets = documents.length + diagrams.length;
    const completedAssets = documents.filter(doc => doc.status === 'generated').length + diagrams.length;
    return totalAssets > 0 ? (completedAssets / totalAssets) * 100 : 0;
  };

  const getRecentActivity = () => {
    const allItems = [
      ...documents.map(doc => ({ ...doc, type: 'document', timestamp: doc.generated_at })),
      ...diagrams.map(diagram => ({ ...diagram, type: 'diagram', timestamp: diagram.created_at }))
    ].sort((a, b) => b.timestamp - a.timestamp);
    
    return allItems.slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Current status and progress for {project.name}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Project Completion</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(getProjectProgress())}%
              </span>
            </div>
            <Progress value={getProjectProgress()} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{documents.length}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{diagrams.length}</p>
                <p className="text-xs text-muted-foreground">Diagrams</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.ceil((Date.now() - project.created_at) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-xs text-muted-foreground">Days Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">
                  {documents.filter(doc => doc.status === 'exported').length}
                </p>
                <p className="text-xs text-muted-foreground">Exported</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Phase Guide */}
      <DocumentPhaseGuide />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary" />
              <span>Generated Documents</span>
            </CardTitle>
            <CardDescription>
              AI-generated content for your MVP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { type: 'roadmap' as const, label: 'MVP Roadmap', icon: TrendingUp },
                { type: 'elevator_pitch' as const, label: 'Elevator Pitch', icon: Activity },
                { type: 'model_advice' as const, label: 'AI Model Advice', icon: CheckCircle2 }
              ].map(({ type, label, icon: Icon }) => {
                const docs = getDocumentsByType(type);
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={docs.length > 0 ? "default" : "secondary"}>
                        {docs.length} generated
                      </Badge>
                      {docs.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Latest: {formatDate(Math.max(...docs.map(d => d.generated_at)))}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {documents.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documents generated yet</p>
                <p className="text-xs">Use the AI Roadmap tab to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagrams Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-accent" />
              <span>Visual Diagrams</span>
            </CardTitle>
            <CardDescription>
              Flowcharts and architectural diagrams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { type: 'flowchart' as const, label: 'Flowcharts' },
                { type: 'sequence' as const, label: 'Sequence Diagrams' },
                { type: 'user_journey' as const, label: 'User Journeys' },
                { type: 'gantt' as const, label: 'Gantt Charts' }
              ].map(({ type, label }) => {
                const diagrams = getDiagramsByType(type);
                return (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                    <span className="font-medium">{label}</span>
                    <Badge variant={diagrams.length > 0 ? "default" : "secondary"}>
                      {diagrams.length}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {diagrams.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No diagrams created yet</p>
                <p className="text-xs">Use the Diagrams tab to create visuals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest updates to your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getRecentActivity().length > 0 ? (
            <div className="space-y-3">
              {getRecentActivity().map((item, index) => (
                <div key={`${item.type}-${item._id}`} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.type === 'document' ? 'Generated' : 'Created'} {' '}
                      {item.type === 'document' 
                        ? (item as RoadmapDocument).document_type.replace('_', ' ').toLowerCase()
                        : (item as UserDiagram).diagram_type.replace('_', ' ').toLowerCase()
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(item as any).title || 'Untitled'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs">Start generating content to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};