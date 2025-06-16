
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authRateLimiter } from '@/lib/security/rate-limiter';
import { sessionManager } from '@/lib/security/session-manager';
import { validatePassword } from '@/lib/security/password-policy';
import { useToast } from '@/hooks/use-toast';

interface SecureAuthState {
  isRateLimited: boolean;
  remainingAttempts: number;
  blockTimeRemaining: number;
  sessionValid: boolean;
}

export const useSecureAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [secureState, setSecureState] = useState<SecureAuthState>({
    isRateLimited: false,
    remainingAttempts: 5,
    blockTimeRemaining: 0,
    sessionValid: false
  });

  const getClientIdentifier = useCallback(() => {
    // Use IP-like identifier (in production, use actual IP from server)
    return `client_${navigator.userAgent.slice(0, 50).replace(/\s/g, '')}`;
  }, []);

  const updateRateLimitState = useCallback(() => {
    const identifier = getClientIdentifier();
    const status = authRateLimiter.getStatus(identifier, 'login');
    
    setSecureState(prev => ({
      ...prev,
      isRateLimited: status.blocked,
      remainingAttempts: status.remaining,
      blockTimeRemaining: status.retryAfter || 0
    }));
  }, [getClientIdentifier]);

  useEffect(() => {
    updateRateLimitState();
    
    // Update rate limit state every second if blocked
    const interval = setInterval(() => {
      updateRateLimitState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateRateLimitState]);

  useEffect(() => {
    // Initialize session when user logs in
    if (auth.user && auth.session) {
      sessionManager.initializeSession(auth.user, auth.session).then(success => {
        setSecureState(prev => ({ ...prev, sessionValid: success }));
        if (!success) {
          toast({
            title: "Security Warning",
            description: "Session could not be validated. Please log in again.",
            variant: "destructive"
          });
          auth.signOut();
        }
      });
    }

    // Listen for session timeout events
    const handleSessionTimeout = () => {
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive"
      });
      auth.signOut();
    };

    window.addEventListener('session-timeout', handleSessionTimeout);
    return () => window.removeEventListener('session-timeout', handleSessionTimeout);
  }, [auth.user, auth.session, auth.signOut, toast]);

  const secureSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const identifier = getClientIdentifier();
    
    // Check rate limiting
    if (authRateLimiter.isRateLimited(identifier, 'login')) {
      const status = authRateLimiter.getStatus(identifier, 'login');
      return {
        success: false,
        error: `Too many failed attempts. Please try again in ${Math.ceil((status.retryAfter || 0) / 1000 / 60)} minutes.`
      };
    }

    // Validate password strength for new passwords (optional check)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid && passwordValidation.score < 40) {
      console.warn('Weak password detected during login');
    }

    try {
      // Record attempt before trying to sign in
      const rateLimitResult = authRateLimiter.recordAttempt(identifier, 'login');
      
      await auth.signIn(email, password);
      
      // Reset rate limiting on successful login
      authRateLimiter.reset(identifier, 'login');
      updateRateLimitState();
      
      return { success: true };
    } catch (error: any) {
      updateRateLimitState();
      
      return {
        success: false,
        error: error.message || 'Sign in failed'
      };
    }
  };

  const secureSignUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const identifier = getClientIdentifier();
    
    // Check rate limiting for signup
    if (authRateLimiter.isRateLimited(identifier, 'signup')) {
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.'
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: passwordValidation.errors.join(', ')
      };
    }

    try {
      authRateLimiter.recordAttempt(identifier, 'signup');
      await auth.signUp(email, password);
      authRateLimiter.reset(identifier, 'signup');
      
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign up failed'
      };
    }
  };

  const validateCurrentSession = useCallback((): boolean => {
    const isValid = sessionManager.isSessionValid();
    setSecureState(prev => ({ ...prev, sessionValid: isValid }));
    
    if (!isValid && auth.user) {
      toast({
        title: "Session Invalid",
        description: "Your session is no longer valid. Please log in again.",
        variant: "destructive"
      });
      auth.signOut();
    }
    
    return isValid;
  }, [auth.user, auth.signOut, toast]);

  return {
    ...auth,
    secureSignIn,
    secureSignUp,
    validateCurrentSession,
    secureState,
    isRateLimited: secureState.isRateLimited,
    remainingAttempts: secureState.remainingAttempts,
    blockTimeRemaining: secureState.blockTimeRemaining
  };
};
