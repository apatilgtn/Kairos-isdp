import { useSimpleAuthStore } from '@/store/simple-auth-store';

/**
 * Compatibility hook that provides auth object in the format expected by legacy components
 * This allows existing components to work without modification while using the new auth store
 */
export const useAuthCompat = () => {
  const { user, isAuthenticated, isLoading } = useSimpleAuthStore();
  
  // Return auth object in the expected format for legacy components
  return {
    auth: {
      user: user ? {
        uid: user.uid,
        name: user.name || user.email || 'User',
        email: user.email || '',
        ...user
      } : null,
      isAuthenticated,
      isLoading
    }
  };
};