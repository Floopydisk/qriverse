
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordStrengthIndicator } from "@/components/security/PasswordStrengthIndicator";
import { Shield, Clock, AlertTriangle } from "lucide-react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const navigate = useNavigate();
  const { 
    secureSignIn, 
    secureSignUp, 
    signInWithGoogle, 
    loading, 
    isRateLimited,
    remainingAttempts,
    blockTimeRemaining 
  } = useSecureAuth();
  const { toast } = useToast();

  const formatTimeRemaining = (ms: number): string => {
    const minutes = Math.ceil(ms / 1000 / 60);
    return minutes > 1 ? `${minutes} minutes` : '1 minute';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isRateLimited) {
      setError(`Too many failed attempts. Please try again in ${formatTimeRemaining(blockTimeRemaining)}.`);
      return;
    }

    const result = await secureSignIn(email, password);
    
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Sign-in failed. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please ensure your password meets all security requirements.");
      return;
    }

    const result = await secureSignUp(email, password);
    
    if (result.success) {
      localStorage.setItem('isNewUser', 'true');
      navigate("/dashboard");
      toast({
        title: "Account Created",
        description: "Your account has been created successfully with enhanced security. Welcome!",
      });
    } else {
      setError(result.error || "Sign-up failed. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0B10] text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border border-border">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Secure Authentication</span>
              </div>
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? "Sign up with enhanced security features" 
                  : "Sign in to your secure account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rate Limiting Warning */}
                {isRateLimited && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Account temporarily locked due to too many failed attempts. 
                      Please try again in {formatTimeRemaining(blockTimeRemaining)}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Remaining Attempts Warning */}
                {!isRateLimited && remainingAttempts <= 2 && remainingAttempts > 0 && (
                  <Alert variant="default" className="border-yellow-500">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before temporary lockout.
                    </AlertDescription>
                  </Alert>
                )}

                <Tabs 
                  defaultValue="email" 
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="google">Google</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email" className="space-y-4">
                    {!isSignUp ? (
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isRateLimited}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link 
                              to="/forgot-password" 
                              className="text-xs text-primary hover:underline"
                            >
                              Forgot Password?
                            </Link>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isRateLimited}
                          />
                        </div>
                        
                        {error && (
                          <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-md p-3">
                            {error}
                          </div>
                        )}
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading || isRateLimited}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                              Signing in...
                            </div>
                          ) : "Sign In"}
                        </Button>
                        
                        <div className="text-center text-sm">
                          Don't have an account?{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto font-normal text-primary"
                            onClick={() => setIsSignUp(true)}
                          >
                            Sign Up
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          
                          {password && (
                            <PasswordStrengthIndicator
                              password={password}
                              onValidationChange={(result) => setIsPasswordValid(result.isValid)}
                            />
                          )}
                        </div>
                        
                        {error && (
                          <div className="bg-destructive/10 border border-destructive text-destructive text-sm rounded-md p-3">
                            {error}
                          </div>
                        )}
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={loading || !isPasswordValid}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                              Creating account...
                            </div>
                          ) : "Sign Up"}
                        </Button>
                        
                        <div className="text-center text-sm">
                          Already have an account?{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto font-normal text-primary"
                            onClick={() => setIsSignUp(false)}
                          >
                            Sign In
                          </Button>
                        </div>
                      </form>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="google">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Click the button below to sign in with your Google account.
                      </p>
                      
                      <Button 
                        onClick={handleGoogleSignIn} 
                        className="w-full flex items-center justify-center"
                        variant="outline"
                        disabled={loading || isRateLimited}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Connecting...
                          </div>
                        ) : (
                          <>
                            <img 
                              src="/google-icon.svg" 
                              alt="Google" 
                              className="w-4 h-4 mr-2" 
                            />
                            Continue with Google
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
