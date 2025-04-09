
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Export both default and named export for backwards compatibility
export const useAuth = useAuthContext;
export default useAuth;
