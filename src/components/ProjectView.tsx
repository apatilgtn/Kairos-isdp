import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { APIService } from '@/lib/api';
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
import AIAnalyticsDashboard from './AIAnalyticsDashboard';
import { AdvancedAIAnalytics } from './AdvancedAIAnalytics';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  TrendingUp,
  Edit3,
  MoreHorizontal,
  Brain
} from 'lucide-react';
import type { MVPProject, RoadmapDocument, UserDiagram } from '@/types';

interface ProjectViewProps {
  project: MVPProject;
  onBack: () => void;
  onUpdate: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ 
  project, 
  onBack, 
  onUpdate 
}) => {
  const { activeTab, setActiveTab, addNotification } = useAppStore();
  const [documents, setDocuments] = useState<RoadmapDocument[]>([]);
  const [diagrams, setDiagrams] = useState<UserDiagram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      case 'active': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold">{project.name}</h1>
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
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Project Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-lg">Problem Statement</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {project.problem_statement}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-sm font-medium">Diagrams</p>
                  <p className="text-2xl font-bold">{diagrams.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <div className="space-y-4">
            {/* Phase-based Tab Organization */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Project Documentation Phases</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  Justification Phase
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                  Definition & Authority
                </Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                  Procurement & Planning
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                  Analysis & Strategy
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-11 gap-2 p-2 bg-white rounded-lg border shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("overview")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "overview" 
                    ? "!bg-gradient-to-r !from-yellow-400 !to-orange-500 !text-white shadow-md hover:!from-yellow-500 hover:!to-orange-600 border !border-yellow-300" 
                    : "hover:bg-yellow-50 hover:text-yellow-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">🏠</span>
                  <span>Overview</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("business_case")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "business_case" 
                    ? "!bg-gradient-to-r !from-blue-500 !to-indigo-600 !text-white shadow-md hover:!from-blue-600 hover:!to-indigo-700 border !border-blue-300" 
                    : "hover:bg-blue-50 hover:text-blue-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">💼</span>
                  <span>Business Case</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("feasibility")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "feasibility" 
                    ? "!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white shadow-md hover:!from-green-600 hover:!to-emerald-700 border !border-green-300" 
                    : "hover:bg-green-50 hover:text-green-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">📊</span>
                  <span>Feasibility</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("charter")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "charter" 
                    ? "!bg-gradient-to-r !from-purple-500 !to-violet-600 !text-white shadow-md hover:!from-purple-600 hover:!to-violet-700 border !border-purple-300" 
                    : "hover:bg-purple-50 hover:text-purple-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">⭐</span>
                  <span>Charter</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("scope")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "scope" 
                    ? "!bg-gradient-to-r !from-teal-500 !to-cyan-600 !text-white shadow-md hover:!from-teal-600 hover:!to-cyan-700 border !border-teal-300" 
                    : "hover:bg-teal-50 hover:text-teal-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">🎯</span>
                  <span>Scope</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("rfp")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "rfp" 
                    ? "!bg-gradient-to-r !from-rose-500 !to-pink-600 !text-white shadow-md hover:!from-rose-600 hover:!to-pink-700 border !border-rose-300" 
                    : "hover:bg-rose-50 hover:text-rose-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">📄</span>
                  <span>RFP</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("roadmap")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "roadmap" 
                    ? "!bg-gradient-to-r !from-slate-600 !to-gray-700 !text-white shadow-md hover:!from-slate-700 hover:!to-gray-800 border !border-slate-400" 
                    : "hover:bg-slate-50 hover:text-slate-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">🗺️</span>
                  <span>AI Roadmap</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("diagrams")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "diagrams" 
                    ? "!bg-gradient-to-r !from-amber-500 !to-yellow-600 !text-white shadow-md hover:!from-amber-600 hover:!to-yellow-700 border !border-amber-300" 
                    : "hover:bg-amber-50 hover:text-amber-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">📐</span>
                  <span>Diagrams</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("ai_analytics")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "ai_analytics" 
                    ? "!bg-gradient-to-r !from-fuchsia-500 !to-pink-600 !text-white shadow-md hover:!from-fuchsia-600 hover:!to-pink-700 border !border-fuchsia-300" 
                    : "hover:bg-fuchsia-50 hover:text-fuchsia-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">🧠</span>
                  <span>AI Analytics</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("enterprise")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "enterprise" 
                    ? "!bg-gradient-to-r !from-emerald-600 !to-teal-700 !text-white shadow-md hover:!from-emerald-700 hover:!to-teal-800 border !border-emerald-400" 
                    : "hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">🏢</span>
                  <span>Enterprise</span>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("export")}
                className={`h-auto py-2 px-3 text-xs font-medium transition-all duration-200 ${
                  activeTab === "export" 
                    ? "!bg-gradient-to-r !from-sky-500 !to-blue-600 !text-white shadow-md hover:!from-sky-600 hover:!to-blue-700 border !border-sky-300" 
                    : "hover:bg-sky-50 hover:text-sky-700 border border-gray-200"
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span className="text-sm">📤</span>
                  <span>Export</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <OverviewTab 
                project={project}
                documents={documents}
                diagrams={diagrams}
                isLoading={isLoading}
                onRefresh={loadProjectData}
              />
            )}

            {activeTab === "business_case" && (
              <BusinessCaseTab 
                project={project}
              />
            )}

            {activeTab === "feasibility" && (
              <FeasibilityStudyTab 
                project={project}
              />
            )}

            {activeTab === "charter" && (
              <ProjectCharterTab 
                project={project}
              />
            )}

            {activeTab === "scope" && (
              <ScopeStatementTab 
                project={project}
              />
            )}

            {activeTab === "rfp" && (
              <RFPTab 
                project={project}
              />
            )}

            {activeTab === "roadmap" && (
              <RoadmapTab 
                project={project}
                documents={documents}
                onDocumentGenerated={loadProjectData}
              />
            )}

            {activeTab === "diagrams" && (
              <AIDiagramsTab 
                project={project}
                diagrams={diagrams}
                onDiagramSaved={loadProjectData}
              />
            )}

            {activeTab === "enterprise" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <h3 className="text-sm font-medium text-emerald-800">Enterprise Integration Hub</h3>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">
                    Connect and export documents to SharePoint, Confluence, and other enterprise systems
                  </p>
                </div>
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                      <span className="text-muted-foreground">Loading enterprise integrations...</span>
                    </div>
                  </div>
                }>
                  <EnhancedExportIntegrationSystem 
                    projectId={project._id}
                  />
                </React.Suspense>
              </div>
            )}

            {activeTab === "ai_analytics" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <h3 className="text-sm font-medium text-purple-800">Advanced AI Analytics</h3>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Comprehensive AI performance tracking, model usage analysis, and optimization insights
                  </p>
                </div>
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                      <span className="text-muted-foreground">Loading AI analytics...</span>
                    </div>
                  </div>
                }>
                  <AdvancedAIAnalytics 
                    project={project}
                  />
                </React.Suspense>
              </div>
            )}

            {activeTab === "export" && (
              <ExportTab 
                project={project}
                documents={documents}
                diagrams={diagrams}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};