
import React from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Re-export the hook for convenience
export { useAuth as default, useAuth };

export const useAuth = useAuthContext;
