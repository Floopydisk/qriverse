import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authRateLimiter } from '@/lib/security/rate-limiter';
import { sessionManager } from '@/lib/security/session-manager';
import { validatePassword } from '@/lib/security/password-policy';
import { useToast } from '@/hooks/use-toast';
import { loginMonitor } from '@/lib/security/login-monitor';
import { auditLogger } from '@/lib/security/audit-logger';

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
    
    // Check if IP is blocked by login monitor
    if (loginMonitor.isIPBlocked(identifier)) {
      const error = 'IP address is blocked due to suspicious activity';
      loginMonitor.trackLoginAttempt(email, false, 'ip_blocked');
      return { success: false, error };
    }
    
    // Check rate limiting
    if (authRateLimiter.isRateLimited(identifier, 'login')) {
      const status = authRateLimiter.getStatus(identifier, 'login');
      const error = `Too many failed attempts. Please try again in ${Math.ceil((status.retryAfter || 0) / 1000 / 60)} minutes.`;
      loginMonitor.trackLoginAttempt(email, false, 'rate_limited');
      return { success: false, error };
    }

    // Validate password strength for new passwords (optional check)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid && passwordValidation.score < 40) {
      console.warn('Weak password detected during login');
      auditLogger.log('suspicious_activity_detected', {
        type: 'weak_password_login_attempt',
        email,
        passwordScore: passwordValidation.score
      }, 'low');
    }

    try {
      // Record attempt before trying to sign in
      const rateLimitResult = authRateLimiter.recordAttempt(identifier, 'login');
      
      await auth.signIn(email, password);
      
      // Reset rate limiting on successful login
      authRateLimiter.reset(identifier, 'login');
      updateRateLimitState();
      
      // Track successful login
      loginMonitor.trackLoginAttempt(email, true);
      auditLogger.logAuthEvent('login', true, { email }, auth.user?.id);
      
      return { success: true };
    } catch (error: any) {
      updateRateLimitState();
      
      // Track failed login with detailed reason
      const failureReason = error.message || 'unknown_error';
      loginMonitor.trackLoginAttempt(email, false, failureReason);
      auditLogger.logAuthEvent('login', false, { 
        email, 
        error: failureReason,
        identifier 
      });
      
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
      loginMonitor.trackLoginAttempt(email, false, 'signup_rate_limited');
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.'
      };
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      auditLogger.logAuthEvent('signup', false, {
        email,
        error: 'password_validation_failed',
        passwordErrors: passwordValidation.errors
      });
      return {
        success: false,
        error: passwordValidation.errors.join(', ')
      };
    }

    try {
      authRateLimiter.recordAttempt(identifier, 'signup');
      await auth.signUp(email, password);
      authRateLimiter.reset(identifier, 'signup');
      
      // Track successful signup
      auditLogger.logAuthEvent('signup', true, { 
        email,
        passwordScore: passwordValidation.score 
      }, auth.user?.id);
      
      return { success: true };
    } catch (error: any) {
      // Track failed signup
      auditLogger.logAuthEvent('signup', false, {
        email,
        error: error.message || 'unknown_error'
      });
      
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
