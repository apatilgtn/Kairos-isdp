import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';

// Import tab components
import { OverviewTab } from './tabs/OverviewTab';
import { RoadmapTab } from './tabs/RoadmapTab';
import { BusinessCaseTab } from './tabs/BusinessCaseTab';
import { FeasibilityStudyTab } from './tabs/FeasibilityStudyTab';
import { ProjectCharterTab } from './tabs/ProjectCharterTab';
import { ScopeStatementTab } from './tabs/ScopeStatementTab';
import { RFPTab } from './tabs/RFPTab';
import { AIDiagramsTab } from './tabs/AIDiagramsTab';
import { ExportTab } from './tabs/ExportTab';
import { EnterpriseIntegrationsTab } from './EnterpriseIntegrationsTab';
import { EnhancedExportIntegrationSystem } from './EnhancedExportIntegrationSystem';
import { AdvancedAIAnalytics } from './AdvancedAIAnalytics';
import { OptimizedGenerationDashboard } from './OptimizedGenerationDashboard';
import { EnterpriseCollaborationDashboard } from './EnterpriseCollaborationDashboard';
import { EnhancedIntegrationSetup } from './EnhancedIntegrationSetup';

import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  TrendingUp,
  Edit3,
  MoreHorizontal,
  Users,
  FileText,
  Share2,
  Star,
  Clock,
  Zap
} from 'lucide-react';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface ModernProjectViewProps {
  project: MVPProject;
  onBack: () => void;
  onUpdate: () => void;
}

export const ModernProjectView: React.FC<ModernProjectViewProps> = ({ 
  project, 
  onBack, 
  onUpdate 
}) => {
  // Local state for tab management to avoid global state conflicts
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [documents, setDocuments] = useState<RoadmapDocument[]>([]);
  const [diagrams, setDiagrams] = useState<UserDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useAppStore();

  useEffect(() => {
    loadProjectData();
  }, [project._id]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const [projectDocuments, projectDiagrams] = await Promise.all([
        APIService.getDocuments(project._id),
        APIService.getDiagrams(project._id)
      ]);
      setDocuments(projectDocuments);
      setDiagrams(projectDiagrams);
    } catch (error) {
      console.error('Failed to load project data:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Project Data',
        message: 'Could not load project documents and diagrams.',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: MVPProject['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Tab configuration with proper grouping
  const tabGroups = [
    {
      label: 'Project Overview',
      tabs: [
        { id: 'overview', label: 'Overview', icon: Target }
      ]
    },
    {
      label: 'Business Documents',
      tabs: [
        { id: 'business_case', label: 'Business Case', icon: FileText },
        { id: 'feasibility', label: 'Feasibility Study', icon: TrendingUp },
        { id: 'charter', label: 'Project Charter', icon: Star },
        { id: 'scope', label: 'Scope Statement', icon: Target },
        { id: 'rfp', label: 'RFP Document', icon: FileText }
      ]
    },
    {
      label: 'AI & Analytics',
      tabs: [
        { id: 'roadmap', label: 'AI Roadmap', icon: TrendingUp },
        { id: 'diagrams', label: 'Diagrams', icon: Share2 },
        { id: 'ai_analytics', label: 'AI Analytics', icon: TrendingUp },
        { id: 'optimized_generation', label: 'Optimized Generation', icon: Zap }
      ]
    },
    {
      label: 'Export & Integration',
      tabs: [
        { id: 'enterprise', label: 'Enterprise', icon: Users },
        { id: 'collaboration', label: 'Collaboration', icon: Users },
        { id: 'export', label: 'Export', icon: Share2 }
      ]
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-purple-50/50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Navigation and Title */}
            <div className="flex items-center gap-4 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBack}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground">{project.name}</h1>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(project.status)}
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.industry} • Created {formatDate(project.created_at)}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 py-6">
        {/* Project Summary Card */}
        <Card className="mb-6 border-l-4 border-l-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-lg text-foreground">Problem Statement</CardTitle>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {project.problem_statement}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <p className="text-xl font-bold text-foreground">{documents.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diagrams</p>
                  <p className="text-xl font-bold text-foreground">{diagrams.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Collaborators</p>
                  <p className="text-xl font-bold text-foreground">3</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="space-y-4">
            {tabGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground px-1">
                  {group.label}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {group.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                          transition-all duration-200 border
                          ${isActive 
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                            : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                project={project}
                documents={documents}
                diagrams={diagrams}
                isLoading={isLoading}
                onRefresh={loadProjectData}
              />
            )}

            {activeTab === 'business_case' && (
              <BusinessCaseTab project={project} />
            )}

            {activeTab === 'feasibility' && (
              <FeasibilityStudyTab project={project} />
            )}

            {activeTab === 'charter' && (
              <ProjectCharterTab project={project} />
            )}

            {activeTab === 'scope' && (
              <ScopeStatementTab project={project} />
            )}

            {activeTab === 'rfp' && (
              <RFPTab project={project} />
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTab 
                project={project}
                documents={documents}
                onDocumentGenerated={loadProjectData}
              />
            )}

            {activeTab === 'diagrams' && (
              <AIDiagramsTab 
                project={project}
                diagrams={diagrams}
                onDiagramSaved={loadProjectData}
              />
            )}

            {activeTab === 'ai_analytics' && (
              <AdvancedAIAnalytics project={project} />
            )}

            {activeTab === 'optimized_generation' && (
              <OptimizedGenerationDashboard project={project} />
            )}

            {activeTab === 'enterprise' && (
              <EnhancedExportIntegrationSystem projectId={project._id} />
            )}

            {activeTab === 'collaboration' && (
              <EnterpriseCollaborationDashboard />
            )}

            {activeTab === 'export' && (
              <ExportTab 
                project={project}
                documents={documents}
                diagrams={diagrams}
              />
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};