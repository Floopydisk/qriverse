
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// Export both default and named export for backwards compatibility
export const useAuth = () => useContext(AuthContext);
export default useAuth;
