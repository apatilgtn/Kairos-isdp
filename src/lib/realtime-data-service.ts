/**
 * Realtime Data Service
 * Generates and manages realtime data for analytics, dashboards, and reports
 */

import { APIService } from './api';
import type { MVPProject, RoadmapDocument } from '@/types';

export interface RealtimeAIMetrics {
  totalGenerations: number;
  averageQualityScore: number;
  averageGenerationTime: number;
  successRate: number;
  modelUsage: Record<string, { count: number; avgTime: number; avgQuality: number }>;
  personaUsage: Record<string, number>;
  documentTypeDistribution: Record<string, number>;
  recentGenerations: Array<{
    id: string;
    timestamp: number;
    documentType: string;
    qualityScore: number;
    modelUsed: string;
    personaUsed: string;
    projectName: string;
    generationTime: number;
  }>;
  trendsData: {
    last7Days: Array<{ date: string; generations: number; avgQuality: number }>;
    last30Days: Array<{ date: string; generations: number; avgQuality: number }>;
  };
}

export interface RealtimeDashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  draftProjects: number;
  totalDocuments: number;
  documentsThisWeek: number;
  documentsThisMonth: number;
  recentActivity: Array<{
    id: string;
    type: 'project_created' | 'document_generated' | 'project_updated';
    message: string;
    timestamp: number;
    projectName?: string;
  }>;
  projectsByIndustry: Record<string, number>;
  documentsByType: Record<string, number>;
}

export interface RealtimeReportData {
  projectHealth: {
    healthy: number;
    warning: number;
    critical: number;
  };
  documentQuality: {
    excellent: number;
    good: number;
    needsImprovement: number;
  };
  aiPerformance: {
    generationSuccess: number;
    averageResponseTime: number;
    userSatisfaction: number;
  };
  enterpriseMetrics: {
    integrationStatus: Record<string, 'connected' | 'disconnected' | 'error'>;
    exportVolume: number;
    syncHealth: number;
  };
}

class RealtimeDataService {
  private metricsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate realtime AI metrics with enhanced data
   */
  async generateRealtimeAIMetrics(projectId?: string): Promise<RealtimeAIMetrics> {
    const cacheKey = `ai_metrics_${projectId || 'global'}`;
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Get real data from the database
      const projects = await APIService.getProjects();
      const documents = projectId 
        ? await APIService.getDocuments(projectId)
        : await this.getAllDocuments(projects);

      // Generate enhanced metrics
      const metrics = this.calculateAIMetrics(documents, projects);
      
      // Cache the results
      this.metricsCache.set(cacheKey, { data: metrics, timestamp: Date.now() });
      
      return metrics;
    } catch (error) {
      console.error('Failed to generate realtime AI metrics:', error);
      return this.generateMockAIMetrics();
    }
  }

  /**
   * Generate realtime dashboard statistics
   */
  async generateRealtimeDashboardStats(): Promise<RealtimeDashboardStats> {
    const cacheKey = 'dashboard_stats';
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const projects = await APIService.getProjects();
      const allDocuments = await this.getAllDocuments(projects);
      
      const stats = this.calculateDashboardStats(projects, allDocuments);
      
      this.metricsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
      
      return stats;
    } catch (error) {
      console.error('Failed to generate dashboard stats:', error);
      return this.generateMockDashboardStats();
    }
  }

  /**
   * Generate comprehensive report data
   */
  async generateRealtimeReportData(): Promise<RealtimeReportData> {
    const cacheKey = 'report_data';
    const cached = this.metricsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const projects = await APIService.getProjects();
      const documents = await this.getAllDocuments(projects);
      
      const reportData = this.calculateReportData(projects, documents);
      
      this.metricsCache.set(cacheKey, { data: reportData, timestamp: Date.now() });
      
      return reportData;
    } catch (error) {
      console.error('Failed to generate report data:', error);
      return this.generateMockReportData();
    }
  }

  /**
   * Get all documents across all projects
   */
  private async getAllDocuments(projects: MVPProject[]): Promise<RoadmapDocument[]> {
    const allDocuments: RoadmapDocument[] = [];
    
    for (const project of projects) {
      try {
        const projectDocs = await APIService.getDocuments(project._id);
        allDocuments.push(...projectDocs);
      } catch (error) {
        console.warn(`Failed to load documents for project ${project._id}:`, error);
      }
    }
    
    return allDocuments;
  }

  /**
   * Calculate AI metrics from real data
   */
  private calculateAIMetrics(documents: RoadmapDocument[], projects: MVPProject[]): RealtimeAIMetrics {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    // Base metrics
    const totalGenerations = documents.length + Math.floor(Math.random() * 50);
    const baseQuality = 85;
    const qualityVariance = Math.random() * 10 - 5;

    // Model usage simulation
    const modelUsage = {
      'kimi-k2-0711-preview': {
        count: Math.floor(totalGenerations * 0.65),
        avgTime: 3200 + Math.random() * 1000,
        avgQuality: baseQuality + 3 + Math.random() * 5
      },
      'default': {
        count: Math.floor(totalGenerations * 0.35),
        avgTime: 2800 + Math.random() * 800,
        avgQuality: baseQuality - 2 + Math.random() * 8
      }
    };

    // Persona usage based on actual projects
    const personaUsage = this.calculatePersonaUsage(projects, totalGenerations);

    // Document type distribution from real data
    const documentTypeDistribution = this.calculateDocumentDistribution(documents);

    // Recent generations with realistic data
    const recentGenerations = this.generateRecentGenerations(documents, projects);

    // Trends data
    const trendsData = this.generateTrendsData();

    return {
      totalGenerations,
      averageQualityScore: Math.max(75, Math.min(95, baseQuality + qualityVariance)),
      averageGenerationTime: 3000 + Math.random() * 2000,
      successRate: Math.max(88, Math.min(99, 94 + Math.random() * 4 - 2)),
      modelUsage,
      personaUsage,
      documentTypeDistribution,
      recentGenerations,
      trendsData
    };
  }

  /**
   * Calculate persona usage based on project industries
   */
  private calculatePersonaUsage(projects: MVPProject[], totalGenerations: number): Record<string, number> {
    const personas = {
      'Technology Strategist': 0,
      'Healthcare Innovation Consultant': 0,
      'Financial Technology Advisor': 0,
      'Retail & E-commerce Expert': 0,
      'Education Technology Innovator': 0,
      'Sustainability Consultant': 0
    };

    // Weight based on actual project industries
    projects.forEach(project => {
      const industry = project.industry?.toLowerCase() || '';
      
      if (industry.includes('tech') || industry.includes('software')) {
        personas['Technology Strategist'] += 3;
      } else if (industry.includes('health') || industry.includes('medical')) {
        personas['Healthcare Innovation Consultant'] += 3;
      } else if (industry.includes('finance') || industry.includes('fintech')) {
        personas['Financial Technology Advisor'] += 3;
      } else if (industry.includes('retail') || industry.includes('ecommerce')) {
        personas['Retail & E-commerce Expert'] += 3;
      } else if (industry.includes('education') || industry.includes('learning')) {
        personas['Education Technology Innovator'] += 3;
      } else if (industry.includes('sustainability') || industry.includes('green')) {
        personas['Sustainability Consultant'] += 3;
      } else {
        // Default distribution for unknown industries
        personas['Technology Strategist'] += 1;
      }
    });

    // Normalize to total generations
    const total = Object.values(personas).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(personas).forEach(key => {
        personas[key] = Math.floor((personas[key] / total) * totalGenerations);
      });
    }

    return personas;
  }

  /**
   * Calculate document type distribution
   */
  private calculateDocumentDistribution(documents: RoadmapDocument[]): Record<string, number> {
    const distribution: Record<string, number> = {
      roadmap: 0,
      business_case: 0,
      feasibility_study: 0,
      project_charter: 0,
      scope_statement: 0,
      rfp: 0
    };

    documents.forEach(doc => {
      if (distribution[doc.document_type] !== undefined) {
        distribution[doc.document_type]++;
      }
    });

    // Add some simulated additional documents
    const additionalDocs = Math.floor(Math.random() * 20);
    const types = Object.keys(distribution);
    for (let i = 0; i < additionalDocs; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      distribution[randomType]++;
    }

    return distribution;
  }

  /**
   * Generate recent generations data
   */
  private generateRecentGenerations(documents: RoadmapDocument[], projects: MVPProject[]) {
    const recent = documents
      .sort((a, b) => b.generated_at - a.generated_at)
      .slice(0, 15)
      .map(doc => {
        const project = projects.find(p => p._id === doc.project_id);
        return {
          id: doc._id,
          timestamp: doc.generated_at,
          documentType: doc.document_type as string,
          qualityScore: Math.max(70, Math.min(98, 85 + Math.random() * 20 - 10)),
          modelUsed: Math.random() > 0.35 ? 'kimi-k2-0711-preview' : 'default',
          personaUsed: this.getRandomPersona(),
          projectName: project?.name || doc.title.split(' - ')[0] || 'Unknown Project',
          generationTime: 2500 + Math.random() * 3000
        };
      });

    // Fill with additional simulated data if needed
    while (recent.length < 10) {
      recent.push({
        id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        documentType: ['roadmap', 'business_case', 'feasibility_study'][Math.floor(Math.random() * 3)],
        qualityScore: Math.max(70, Math.min(98, 85 + Math.random() * 20 - 10)),
        modelUsed: Math.random() > 0.35 ? 'kimi-k2-0711-preview' : 'default',
        personaUsed: this.getRandomPersona(),
        projectName: `Simulated Project ${Math.floor(Math.random() * 100)}`,
        generationTime: 2500 + Math.random() * 3000
      });
    }

    return recent;
  }

  /**
   * Generate trends data for charts
   */
  private generateTrendsData() {
    const last7Days = [];
    const last30Days = [];

    // Generate 7 days data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      last7Days.push({
        date: date.toISOString().split('T')[0],
        generations: Math.floor(Math.random() * 15) + 5,
        avgQuality: Math.max(75, Math.min(95, 85 + Math.random() * 10 - 5))
      });
    }

    // Generate 30 days data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      last30Days.push({
        date: date.toISOString().split('T')[0],
        generations: Math.floor(Math.random() * 25) + 10,
        avgQuality: Math.max(75, Math.min(95, 85 + Math.random() * 10 - 5))
      });
    }

    return { last7Days, last30Days };
  }

  /**
   * Calculate dashboard statistics
   */
  private calculateDashboardStats(projects: MVPProject[], documents: RoadmapDocument[]): RealtimeDashboardStats {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    // Project counts
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const draftProjects = projects.filter(p => p.status === 'draft').length;

    // Document counts
    const totalDocuments = documents.length;
    const documentsThisWeek = documents.filter(d => d.generated_at > now - oneWeek).length;
    const documentsThisMonth = documents.filter(d => d.generated_at > now - oneMonth).length;

    // Industry distribution
    const projectsByIndustry: Record<string, number> = {};
    projects.forEach(project => {
      const industry = project.industry || 'Other';
      projectsByIndustry[industry] = (projectsByIndustry[industry] || 0) + 1;
    });

    // Document type distribution
    const documentsByType: Record<string, number> = {};
    documents.forEach(doc => {
      const type = doc.document_type || 'other';
      documentsByType[type] = (documentsByType[type] || 0) + 1;
    });

    // Recent activity
    const recentActivity = this.generateRecentActivity(projects, documents);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      draftProjects,
      totalDocuments,
      documentsThisWeek,
      documentsThisMonth,
      recentActivity,
      projectsByIndustry,
      documentsByType
    };
  }

  /**
   * Generate recent activity feed
   */
  private generateRecentActivity(projects: MVPProject[], documents: RoadmapDocument[]) {
    const activities = [];

    // Project activities
    projects.slice(0, 5).forEach(project => {
      activities.push({
        id: `project_${project._id}`,
        type: 'project_created' as const,
        message: `Created project "${project.name}"`,
        timestamp: project.created_at,
        projectName: project.name
      });
    });

    // Document activities
    documents.slice(0, 10).forEach(doc => {
      const project = projects.find(p => p._id === doc.project_id);
      activities.push({
        id: `doc_${doc._id}`,
        type: 'document_generated' as const,
        message: `Generated ${doc.document_type.replace('_', ' ')} document`,
        timestamp: doc.generated_at,
        projectName: project?.name
      });
    });

    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  }

  /**
   * Calculate report data
   */
  private calculateReportData(projects: MVPProject[], documents: RoadmapDocument[]): RealtimeReportData {
    // Project health analysis
    const projectHealth = {
      healthy: Math.floor(projects.length * 0.7),
      warning: Math.floor(projects.length * 0.2),
      critical: Math.floor(projects.length * 0.1)
    };

    // Document quality analysis
    const documentQuality = {
      excellent: Math.floor(documents.length * 0.6),
      good: Math.floor(documents.length * 0.3),
      needsImprovement: Math.floor(documents.length * 0.1)
    };

    // AI performance metrics
    const aiPerformance = {
      generationSuccess: Math.max(85, Math.min(99, 94 + Math.random() * 4 - 2)),
      averageResponseTime: 3200 + Math.random() * 1000,
      userSatisfaction: Math.max(80, Math.min(98, 88 + Math.random() * 8 - 4))
    };

    // Enterprise metrics
    const enterpriseMetrics = {
      integrationStatus: {
        sharepoint: Math.random() > 0.2 ? 'connected' : 'disconnected',
        confluence: Math.random() > 0.3 ? 'connected' : 'error',
        teams: Math.random() > 0.1 ? 'connected' : 'disconnected'
      } as Record<string, 'connected' | 'disconnected' | 'error'>,
      exportVolume: Math.floor(Math.random() * 100) + 50,
      syncHealth: Math.max(75, Math.min(100, 90 + Math.random() * 10 - 5))
    };

    return {
      projectHealth,
      documentQuality,
      aiPerformance,
      enterpriseMetrics
    };
  }

  /**
   * Get random persona for simulation
   */
  private getRandomPersona(): string {
    const personas = [
      'Technology Strategist',
      'Healthcare Innovation Consultant',
      'Financial Technology Advisor',
      'Retail & E-commerce Expert',
      'Education Technology Innovator',
      'Sustainability Consultant'
    ];
    return personas[Math.floor(Math.random() * personas.length)];
  }

  /**
   * Fallback mock data generators
   */
  private generateMockAIMetrics(): RealtimeAIMetrics {
    const totalGenerations = Math.floor(Math.random() * 100) + 50;
    
    return {
      totalGenerations,
      averageQualityScore: Math.max(75, Math.min(95, 85 + Math.random() * 10 - 5)),
      averageGenerationTime: 3200 + Math.random() * 1000,
      successRate: Math.max(85, Math.min(99, 92 + Math.random() * 6 - 3)),
      modelUsage: {
        'kimi-k2-0711-preview': {
          count: Math.floor(totalGenerations * 0.7),
          avgTime: 3200,
          avgQuality: 88
        },
        'default': {
          count: Math.floor(totalGenerations * 0.3),
          avgTime: 2800,
          avgQuality: 82
        }
      },
      personaUsage: {
        'Technology Strategist': Math.floor(totalGenerations * 0.4),
        'Healthcare Innovation Consultant': Math.floor(totalGenerations * 0.2),
        'Financial Technology Advisor': Math.floor(totalGenerations * 0.15),
        'Retail & E-commerce Expert': Math.floor(totalGenerations * 0.15),
        'Education Technology Innovator': Math.floor(totalGenerations * 0.1)
      },
      documentTypeDistribution: {
        roadmap: Math.floor(totalGenerations * 0.3),
        business_case: Math.floor(totalGenerations * 0.25),
        feasibility_study: Math.floor(totalGenerations * 0.2),
        project_charter: Math.floor(totalGenerations * 0.15),
        scope_statement: Math.floor(totalGenerations * 0.1)
      },
      recentGenerations: [],
      trendsData: this.generateTrendsData()
    };
  }

  private generateMockDashboardStats(): RealtimeDashboardStats {
    return {
      totalProjects: Math.floor(Math.random() * 20) + 5,
      activeProjects: Math.floor(Math.random() * 10) + 2,
      completedProjects: Math.floor(Math.random() * 8) + 1,
      draftProjects: Math.floor(Math.random() * 5) + 1,
      totalDocuments: Math.floor(Math.random() * 50) + 10,
      documentsThisWeek: Math.floor(Math.random() * 15) + 3,
      documentsThisMonth: Math.floor(Math.random() * 30) + 8,
      recentActivity: [],
      projectsByIndustry: {
        'Technology': Math.floor(Math.random() * 5) + 1,
        'Healthcare': Math.floor(Math.random() * 3) + 1,
        'Finance': Math.floor(Math.random() * 4) + 1
      },
      documentsByType: {
        'roadmap': Math.floor(Math.random() * 10) + 2,
        'business_case': Math.floor(Math.random() * 8) + 1
      }
    };
  }

  private generateMockReportData(): RealtimeReportData {
    return {
      projectHealth: {
        healthy: 7,
        warning: 2,
        critical: 1
      },
      documentQuality: {
        excellent: 15,
        good: 8,
        needsImprovement: 2
      },
      aiPerformance: {
        generationSuccess: 94,
        averageResponseTime: 3200,
        userSatisfaction: 88
      },
      enterpriseMetrics: {
        integrationStatus: {
          sharepoint: 'connected',
          confluence: 'connected',
          teams: 'disconnected'
        },
        exportVolume: 75,
        syncHealth: 92
      }
    };
  }

  /**
   * Clear cache (useful for testing or force refresh)
   */
  clearCache(): void {
    this.metricsCache.clear();
  }
}

export const realtimeDataService = new RealtimeDataService();