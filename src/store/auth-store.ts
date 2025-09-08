import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@devvai/devv-code-backend';

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
  error: string | null;
  login: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      sendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await auth.sendOTP(email);
          set({ isLoading: false });
        } catch (error) {
          console.error('Failed to send OTP:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to send OTP'
          });
          throw error;
        }
      },

      login: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await auth.verifyOTP(email, otp);
          
          if (result && result.user) {
            const user: User = {
              uid: result.user.uid,
              email: result.user.email,
              name: result.user.name || email.split('@')[0],
              projectId: result.user.projectId,
              createdTime: result.user.createdTime,
              lastLoginTime: Date.now()
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Login failed:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Login failed',
            user: null,
            isAuthenticated: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await auth.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        } catch (error) {
          console.error('Logout failed:', error);
          // Still clear local state even if logout request fails
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'mvp-auth-storage',
      version: 1
    }
  )
);