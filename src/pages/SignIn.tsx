
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password, rememberMe); // Pass the rememberMe state
        navigate('/dashboard');
      } else {
        await signUp(email, password);
        setMode('signin');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-black text-white">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="mb-8">
            <Link to="/" className="text-4xl font-bold flex items-center">
              <svg width="48" height="48" viewBox="0 0 200 200" fill="currentColor">
                <rect x="0" y="0" width="60" height="60" rx="5" />
                <rect x="140" y="0" width="60" height="60" rx="5" />
                <rect x="0" y="140" width="60" height="60" rx="5" />
                <rect x="140" y="140" width="60" height="60" rx="5" />
                <circle cx="70" cy="30" r="10" />
                <circle cx="30" cy="70" r="10" />
                <circle cx="30" cy="130" r="10" />
                <circle cx="70" cy="170" r="10" />
                <circle cx="130" cy="170" r="10" />
                <circle cx="170" cy="130" r="10" />
                <circle cx="170" cy="70" r="10" />
                <circle cx="130" cy="30" r="10" />
                <path d="M70 30 Q 100 0 130 30" strokeWidth="10" stroke="currentColor" fill="none" />
                <path d="M170 70 Q 200 100 170 130" strokeWidth="10" stroke="currentColor" fill="none" />
                <path d="M130 170 Q 100 200 70 170" strokeWidth="10" stroke="currentColor" fill="none" />
                <path d="M30 130 Q 0 100 30 70" strokeWidth="10" stroke="currentColor" fill="none" />
              </svg>
              <span className="ml-2">QRGen</span>
            </Link>
          </div>
          
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</h1>
              <p className="text-gray-400">
                {mode === 'signin' ? 'Enter your email and password to sign in' : 'Create your account'}
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 10 hours
                  </label>
                </div>
                <Button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isSubmitting
                    ? mode === 'signin'
                      ? 'Signing In...'
                      : 'Signing Up...'
                    : mode === 'signin'
                      ? 'Sign In'
                      : 'Sign Up'}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">OR CONTINUE WITH</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-white bg-gray-800 hover:bg-gray-700"
                    onClick={() => {/* Handle Google sign in */}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Google
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 text-center text-sm text-gray-400">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <Link
                      to="/signin?mode=signup"
                      className="text-emerald-500 hover:text-emerald-400"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('signup');
                      }}
                    >
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Link
                      to="/signin?mode=signin"
                      className="text-emerald-500 hover:text-emerald-400"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode('signin');
                      }}
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3/4 h-3/4">
            <svg width="100%" height="100%" viewBox="0 0 200 200" fill="white" className="opacity-20">
              <rect x="0" y="0" width="60" height="60" rx="5" />
              <rect x="140" y="0" width="60" height="60" rx="5" />
              <rect x="0" y="140" width="60" height="60" rx="5" />
              <rect x="140" y="140" width="60" height="60" rx="5" />
              <circle cx="70" cy="30" r="10" />
              <circle cx="30" cy="70" r="10" />
              <circle cx="30" cy="130" r="10" />
              <circle cx="70" cy="170" r="10" />
              <circle cx="130" cy="170" r="10" />
              <circle cx="170" cy="130" r="10" />
              <circle cx="170" cy="70" r="10" />
              <circle cx="130" cy="30" r="10" />
              <path d="M70 30 Q 100 0 130 30" strokeWidth="10" stroke="white" fill="none" />
              <path d="M170 70 Q 200 100 170 130" strokeWidth="10" stroke="white" fill="none" />
              <path d="M130 170 Q 100 200 70 170" strokeWidth="10" stroke="white" fill="none" />
              <path d="M30 130 Q 0 100 30 70" strokeWidth="10" stroke="white" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
