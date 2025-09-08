import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  MVPProject, 
  RoadmapDocument, 
  UserDiagram, 
  NotificationMessage,
  AppStore 
} from '@/types';

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Auth (managed by auth-store)
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      },
      setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),
      login: async () => { throw new Error('Use auth store for login'); },
      logout: async () => { throw new Error('Use auth store for logout'); },
      
      // Projects
      projects: [],
      selectedProject: null,
      isLoading: false,
      error: null,
      
      setProjects: (projects) => set({ projects }),
      setSelectedProject: (selectedProject) => set({ selectedProject }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      // Documents & Diagrams
      documents: [],
      diagrams: [],
      setDocuments: (documents) => set({ documents }),
      setDiagrams: (diagrams) => set({ diagrams }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const newNotification: NotificationMessage = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));
        
        // Auto-remove after duration
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, notification.duration);
        }
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        }));
      },
      
      clearNotifications: () => set({ notifications: [] }),
      
      // UI State
      activeTab: 'overview',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'mvp-app-storage',
      version: 2, // Increment version to clear old cached data
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        activeTab: state.activeTab,
      }),
    }
  )
);