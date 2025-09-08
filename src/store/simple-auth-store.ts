import { create } from 'zustand';

export interface User {
  uid: string;
  email: string;
  name: string;
  projectId: string;
  createdTime: number;
  lastLoginTime: number;
}

interface SimpleAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => void;
}

// Simple localStorage helpers
const AUTH_KEY = 'kairos-auth-user';

const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
};

const loadUser = (): User | null => {
  try {
    // Try new key first
    let userData = localStorage.getItem(AUTH_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Try to migrate from old auth system
    const oldAuthData = localStorage.getItem('mvp-auth-storage');
    if (oldAuthData) {
      const parsed = JSON.parse(oldAuthData);
      if (parsed.state?.user) {
        const user = parsed.state.user;
        console.log('Migrating user from old auth system:', user);
        // Save to new system and return
        saveUser(user);
        return user;
      }
    }
    
    // Try legacy kairos-user
    const legacyUserData = localStorage.getItem('kairos-user');
    if (legacyUserData) {
      const user = JSON.parse(legacyUserData);
      console.log('Migrating user from legacy system:', user);
      // Save to new system and return
      saveUser(user);
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load user from localStorage:', error);
    return null;
  }
};

export const useSimpleAuthStore = create<SimpleAuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Simple auth: attempting login with', email);
      
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
        saveUser(user);
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } else {
        throw new Error('Authentication failed: Invalid response from server');
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Login error:', errorMessage);
      set({ isLoading: false, error: errorMessage, user: null, isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    console.log('Logging out user');
    saveUser(null);
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),

  checkAuth: () => {
    console.log('Checking authentication from localStorage');
    const user = loadUser();
    if (user && user.uid) {
      console.log('Found authenticated user:', user);
      set({ user, isAuthenticated: true });
    } else {
      console.log('No authenticated user found');
      set({ user: null, isAuthenticated: false });
    }
  }
}));

// Initialize auth on store creation
if (typeof window !== 'undefined') {
  useSimpleAuthStore.getState().checkAuth();
}
