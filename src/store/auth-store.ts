import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { auth } from '@devvai/devv-code-backend';

export interface User {
  uid: string;
  email: string;
  name: string;
  projectId: string;
  createdTime: number;
  lastLoginTime: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

  // sendOTP removed for password-based auth

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Auth store: attempting login with', email);
          
          const response = await fetch('http://localhost:4000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          console.log('Login response status:', response.status);
          
          const result = await response.json();
          console.log('Login response data:', result);
          
          if (!response.ok) {
            throw new Error(result.error || 'Login failed');
          }
          
          if (result && result.user) {
            const user: User = {
              uid: result.user.uid,
              email: result.user.email,
              name: result.user.name || email.split('@')[0],
              projectId: result.user.projectId || '',
              createdTime: result.user.createdTime || Date.now(),
              lastLoginTime: Date.now()
            };
            console.log('Setting authenticated user:', user);
            set({ user, isAuthenticated: true, isLoading: false, error: null, isInitialized: true });
          } else {
            throw new Error('Authentication failed: Invalid response from server');
          }
        } catch (error) {
          let errorMessage = 'Login failed';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          console.error('Login error in auth store:', errorMessage);
          set({ isLoading: false, error: errorMessage, user: null, isAuthenticated: false, isInitialized: true });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        // If you want to call a backend logout endpoint, add it here
        set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      },

      clearError: () => set({ error: null }),

      initialize: () => {
        const state = get();
        console.log('Auth store initializing, current state:', state);
        if (state.user && state.user.uid) {
          console.log('Found persisted user, setting authenticated');
          set({ isAuthenticated: true, isInitialized: true });
        } else {
          console.log('No persisted user found');
          set({ isInitialized: true });
        }
      }
    }),
    {
      name: 'mvp-auth-storage',
      version: 1
    }
  )
);

// Initialize the store when it's first created
if (typeof window !== 'undefined') {
  // Give the store time to hydrate, then initialize
  setTimeout(() => {
    useAuthStore.getState().initialize();
  }, 100);
}