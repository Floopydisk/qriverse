
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ensureQRCodeStorageBucket } from '@/lib/api';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoading: boolean; 
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  isLoading: true,
  signInWithGoogle: async () => {},
});

// Add useAuth hook here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Session token expiry time - 10 hours in milliseconds
const SESSION_EXPIRY_TIME = 10 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [rememberMe, setRememberMe] = useState<boolean>(localStorage.getItem('rememberMe') === 'true');
  const navigate = useNavigate();
  const { toast } = useToast();

  // User activity monitoring
  useEffect(() => {
    const updateLastActivity = () => {
      setLastActivity(Date.now());
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Events to track user activity
    window.addEventListener('mousemove', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('scroll', updateLastActivity);

    // Check session expiration periodically
    const checkSession = setInterval(() => {
      const savedLastActivity = Number(localStorage.getItem('lastActivity')) || Date.now();
      const timeSinceActivity = Date.now() - savedLastActivity;
      
      // If not using "remember me" and session has expired, log out
      if (session && !rememberMe && timeSinceActivity > SESSION_EXPIRY_TIME) {
        toast({
          title: "Session Expired",
          description: "Your session has expired due to inactivity",
        });
        signOut();
      }
    }, 60000); // Check every minute

    return () => {
      window.removeEventListener('mousemove', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('scroll', updateLastActivity);
      clearInterval(checkSession);
    };
  }, [session, rememberMe]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Ensure storage buckets exist for authenticated users
        if (session?.user) {
          ensureQRCodeStorageBucket();
        }
      }
    );

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Ensure storage buckets exist for authenticated users
      if (session?.user) {
        ensureQRCodeStorageBucket();
      }
    });

    // Check for remembered login
    const checkRememberedLogin = async () => {
      const savedEmail = localStorage.getItem('userEmail');
      const savedPassword = localStorage.getItem('userPassword');
      const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
      
      if (savedRememberMe && savedEmail && savedPassword) {
        setRememberMe(true);
        try {
          await supabase.auth.signInWithPassword({ 
            email: savedEmail, 
            password: savedPassword 
          });
        } catch (error) {
          console.error("Error with remembered login", error);
          // Clear saved credentials if they're invalid
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userPassword');
        }
      }
    };
    
    checkRememberedLogin();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, remember: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Save credentials if remember me is checked
      if (remember) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('rememberMe', 'true');
        setRememberMe(true);
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        localStorage.setItem('rememberMe', 'false');
        setRememberMe(false);
      }
      
      setLastActivity(Date.now());
      localStorage.setItem('lastActivity', Date.now().toString());
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: object = {}) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Signup successful",
        description: "Please check your email to confirm your account",
      });
      
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear remembered login credentials
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPassword');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('lastActivity');
      setRememberMe(false);
      
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      signIn, 
      signUp, 
      signOut, 
      loading, 
      isLoading: loading, 
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
