import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign-in failed. Please check your credentials.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }

    try {
      await signUp(email, password);
      localStorage.setItem('isNewUser', 'true');
      navigate("/dashboard");
      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Welcome!",
      });
    } catch (err: any) {
      setError(err.message || "Sign-up failed. Please try again.");
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

  // Change variable references from isLoading to loading
  return (
    <div className="min-h-screen flex flex-col bg-[#0C0B10] text-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUp 
                  ? "Sign up to start creating QR codes" 
                  : "Sign in to your account to manage your QR codes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                          disabled={loading}
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
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                          disabled={loading}
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
                        disabled={loading}
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
