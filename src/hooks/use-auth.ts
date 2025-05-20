
import { useContext } from 'react';
import { AuthContext, useAuth as originalUseAuth } from '@/contexts/AuthContext';

// Re-export the useAuth hook for backward compatibility
export const useAuth = originalUseAuth;

// Export context directly if needed
export { AuthContext };
