
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useLocation } from "react-router-dom";
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Show welcome toast when user logs in
  useEffect(() => {
    if (user && !loading) {
      // Only show toast if the user isn't coming from a dynamic QR redirect
      const hasRedirectParam = new URLSearchParams(window.location.search).has('redirect');
      const hasDynamicQRParam = new URLSearchParams(window.location.search).has('dynamic_qr');
      
      if (!hasRedirectParam && !hasDynamicQRParam) {
        // Check localStorage to see if this is a new sign up or returning user
        const isNewUser = localStorage.getItem('isNewUser');
        
        if (isNewUser === 'true') {
          toast({
            title: "Welcome to QrLabs!",
            description: "Thank you for signing up. We're excited to have you on board!",
            variant: "default",
          });
          localStorage.removeItem('isNewUser');
        } else {
          toast({
            title: "Welcome Back!",
            description: `Great to see you again${user.user_metadata?.name ? ', ' + user.user_metadata.name : ''}!`,
            variant: "default",
          });
        }
      }
    }
  }, [user, loading, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
