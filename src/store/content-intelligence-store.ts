import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentAnalysis, ContentIntelligence, StakeholderOptimization } from '@/lib/enhanced-ai-analysis';

interface ContentIntelligenceState {
  // Document analyses cache
  documentAnalyses: Map<string, DocumentAnalysis>;
  
  // Project content intelligence cache
  projectIntelligence: Map<string, ContentIntelligence>;
  
  // Stakeholder optimizations cache
  stakeholderOptimizations: Map<string, StakeholderOptimization>;
  
  // Analysis settings
  settings: {
    autoAnalyze: boolean;
    cacheResults: boolean;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
    preferredModel: 'default' | 'kimi-k2-0711-preview';
  };
  
  // Actions
  setDocumentAnalysis: (documentId: string, analysis: DocumentAnalysis) => void;
  getDocumentAnalysis: (documentId: string) => DocumentAnalysis | undefined;
  
  setProjectIntelligence: (projectId: string, intelligence: ContentIntelligence) => void;
  getProjectIntelligence: (projectId: string) => ContentIntelligence | undefined;
  
  setStakeholderOptimization: (key: string, optimization: StakeholderOptimization) => void;
  getStakeholderOptimization: (key: string) => StakeholderOptimization | undefined;
  
  updateSettings: (newSettings: Partial<ContentIntelligenceState['settings']>) => void;
  
  clearCache: (type?: 'documents' | 'projects' | 'optimizations') => void;
  
  // Analytics
  getAnalysisStats: () => {
    totalAnalyses: number;
    documentsAnalyzed: number;
    projectsAnalyzed: number;
    optimizationsGenerated: number;
    averageQualityScore: number;
  };
}

export const useContentIntelligenceStore = create<ContentIntelligenceState>()(
  persist(
    (set, get) => ({
      documentAnalyses: new Map(),
      projectIntelligence: new Map(),
      stakeholderOptimizations: new Map(),
      
      settings: {
        autoAnalyze: true,
        cacheResults: true,
        analysisDepth: 'detailed',
        preferredModel: 'kimi-k2-0711-preview'
      },

      setDocumentAnalysis: (documentId: string, analysis: DocumentAnalysis) => {
        const state = get();
        if (state.settings.cacheResults) {
          const newAnalyses = new Map(state.documentAnalyses);
          newAnalyses.set(documentId, analysis);
          set({ documentAnalyses: newAnalyses });
        }
      },

      getDocumentAnalysis: (documentId: string) => {
        const state = get();
        return state.documentAnalyses.get(documentId);
      },

      setProjectIntelligence: (projectId: string, intelligence: ContentIntelligence) => {
        const state = get();
        if (state.settings.cacheResults) {
          const newIntelligence = new Map(state.projectIntelligence);
          newIntelligence.set(projectId, intelligence);
          set({ projectIntelligence: newIntelligence });
        }
      },

      getProjectIntelligence: (projectId: string) => {
        const state = get();
        return state.projectIntelligence.get(projectId);
      },

      setStakeholderOptimization: (key: string, optimization: StakeholderOptimization) => {
        const state = get();
        if (state.settings.cacheResults) {
          const newOptimizations = new Map(state.stakeholderOptimizations);
          newOptimizations.set(key, optimization);
          set({ stakeholderOptimizations: newOptimizations });
        }
      },

      getStakeholderOptimization: (key: string) => {
        const state = get();
        return state.stakeholderOptimizations.get(key);
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      clearCache: (type) => {
        set((state) => {
          const updates: Partial<ContentIntelligenceState> = {};
          
          if (!type || type === 'documents') {
            updates.documentAnalyses = new Map();
          }
          if (!type || type === 'projects') {
            updates.projectIntelligence = new Map();
          }
          if (!type || type === 'optimizations') {
            updates.stakeholderOptimizations = new Map();
          }
          
          return updates;
        });
      },

      getAnalysisStats: () => {
        const state = get();
        
        const totalAnalyses = state.documentAnalyses.size + state.projectIntelligence.size + state.stakeholderOptimizations.size;
        const documentsAnalyzed = state.documentAnalyses.size;
        const projectsAnalyzed = state.projectIntelligence.size;
        const optimizationsGenerated = state.stakeholderOptimizations.size;
        
        // Calculate average quality score from document analyses
        const analyses = Array.from(state.documentAnalyses.values());
        const averageQualityScore = analyses.length > 0
          ? analyses.reduce((sum, analysis) => sum + analysis.analysis.overallScore, 0) / analyses.length
          : 0;

        return {
          totalAnalyses,
          documentsAnalyzed,
          projectsAnalyzed,
          optimizationsGenerated,
          averageQualityScore: Math.round(averageQualityScore)
        };
      }
    }),
    {
      name: 'kairos-content-intelligence',
      version: 1,
      // Custom storage to handle Map objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          try {
            const parsed = JSON.parse(str);
            
            // Convert arrays back to Maps
            if (parsed.state.documentAnalyses) {
              parsed.state.documentAnalyses = new Map(parsed.state.documentAnalyses);
            }
            if (parsed.state.projectIntelligence) {
              parsed.state.projectIntelligence = new Map(parsed.state.projectIntelligence);
            }
            if (parsed.state.stakeholderOptimizations) {
              parsed.state.stakeholderOptimizations = new Map(parsed.state.stakeholderOptimizations);
            }
            
            return parsed;
          } catch (error) {
            console.error('Failed to parse content intelligence store:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Convert Maps to arrays for storage
            const toStore = {
              ...value,
              state: {
                ...value.state,
                documentAnalyses: Array.from(value.state.documentAnalyses.entries()),
                projectIntelligence: Array.from(value.state.projectIntelligence.entries()),
                stakeholderOptimizations: Array.from(value.state.stakeholderOptimizations.entries())
              }
            };
            
            localStorage.setItem(name, JSON.stringify(toStore));
          } catch (error) {
            console.error('Failed to save content intelligence store:', error);
          }
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);