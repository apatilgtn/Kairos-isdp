import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  EnterpriseIntegration, 
  ExportJob, 
  EnterpriseSettings, 
  IntegrationType, 
  ExportFormat,
  BatchExportOptions,
  IntegrationStatus
} from '@/types';

interface EnterpriseState {
  // Integrations
  integrations: EnterpriseIntegration[];
  activeIntegration: EnterpriseIntegration | null;
  
  // Export Jobs
  exportJobs: ExportJob[];
  activeExportJob: ExportJob | null;
  
  // Settings
  enterpriseSettings: EnterpriseSettings | null;
  
  // UI State
  showIntegrationDialog: boolean;
  showExportDialog: boolean;
  selectedDocuments: string[];
  exportProgress: Record<string, number>;
  
  // Actions
  setIntegrations: (integrations: EnterpriseIntegration[]) => void;
  addIntegration: (integration: EnterpriseIntegration) => void;
  updateIntegration: (id: string, updates: Partial<EnterpriseIntegration>) => void;
  removeIntegration: (id: string) => void;
  setActiveIntegration: (integration: EnterpriseIntegration | null) => void;
  
  setExportJobs: (jobs: ExportJob[]) => void;
  addExportJob: (job: ExportJob) => void;
  updateExportJob: (id: string, updates: Partial<ExportJob>) => void;
  setActiveExportJob: (job: ExportJob | null) => void;
  
  setEnterpriseSettings: (settings: EnterpriseSettings) => void;
  updateEnterpriseSettings: (updates: Partial<EnterpriseSettings>) => void;
  
  setShowIntegrationDialog: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setSelectedDocuments: (documents: string[]) => void;
  updateExportProgress: (jobId: string, progress: number) => void;
  
  // Computed
  getIntegrationByType: (type: IntegrationType) => EnterpriseIntegration | null;
  getConnectedIntegrations: () => EnterpriseIntegration[];
  getActiveExportJobs: () => ExportJob[];
  getCompletedExportJobs: () => ExportJob[];
  
  // Reset
  reset: () => void;
}

const initialState = {
  integrations: [],
  activeIntegration: null,
  exportJobs: [],
  activeExportJob: null,
  enterpriseSettings: null,
  showIntegrationDialog: false,
  showExportDialog: false,
  selectedDocuments: [],
  exportProgress: {},
};

export const useEnterpriseStore = create<EnterpriseState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Integration Actions
      setIntegrations: (integrations) => set({ integrations }),
      
      addIntegration: (integration) => set((state) => ({
        integrations: [...state.integrations, integration]
      })),
      
      updateIntegration: (id, updates) => set((state) => ({
        integrations: state.integrations.map(integration =>
          integration.id === id ? { ...integration, ...updates } : integration
        )
      })),
      
      removeIntegration: (id) => set((state) => ({
        integrations: state.integrations.filter(integration => integration.id !== id),
        activeIntegration: state.activeIntegration?.id === id ? null : state.activeIntegration
      })),
      
      setActiveIntegration: (integration) => set({ activeIntegration: integration }),

      // Export Job Actions
      setExportJobs: (exportJobs) => set({ exportJobs }),
      
      addExportJob: (job) => set((state) => ({
        exportJobs: [job, ...state.exportJobs]
      })),
      
      updateExportJob: (id, updates) => set((state) => ({
        exportJobs: state.exportJobs.map(job =>
          job._id === id ? { ...job, ...updates } : job
        )
      })),
      
      setActiveExportJob: (job) => set({ activeExportJob: job }),

      // Settings Actions
      setEnterpriseSettings: (settings) => set({ enterpriseSettings: settings }),
      
      updateEnterpriseSettings: (updates) => set((state) => ({
        enterpriseSettings: state.enterpriseSettings 
          ? { ...state.enterpriseSettings, ...updates }
          : null
      })),

      // UI Actions
      setShowIntegrationDialog: (show) => set({ showIntegrationDialog: show }),
      setShowExportDialog: (show) => set({ showExportDialog: show }),
      setSelectedDocuments: (documents) => set({ selectedDocuments: documents }),
      
      updateExportProgress: (jobId, progress) => set((state) => ({
        exportProgress: { ...state.exportProgress, [jobId]: progress }
      })),

      // Computed Getters
      getIntegrationByType: (type) => {
        const { integrations } = get();
        return integrations.find(integration => integration.type === type) || null;
      },
      
      getConnectedIntegrations: () => {
        const { integrations } = get();
        return integrations.filter(integration => integration.status === 'connected');
      },
      
      getActiveExportJobs: () => {
        const { exportJobs } = get();
        return exportJobs.filter(job => 
          job.status === 'pending' || job.status === 'processing'
        );
      },
      
      getCompletedExportJobs: () => {
        const { exportJobs } = get();
        return exportJobs.filter(job => 
          job.status === 'completed' || job.status === 'failed'
        );
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'enterprise-store',
      version: 2, // Increment version to clear old cached data
      partialize: (state) => ({
        integrations: state.integrations,
        enterpriseSettings: state.enterpriseSettings,
        exportJobs: state.exportJobs.slice(0, 50), // Keep only recent jobs
      }),
    }
  )
);