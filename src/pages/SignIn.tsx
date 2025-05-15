
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
    <div className="container relative flex h-screen w-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-6 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900/80" />
        <div className="relative mt-32 flex items-center justify-center text-center">
          <h1 className="text-4xl font-bold">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="border-none">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">
                {mode === 'signin' ? 'Sign In' : 'Sign Up'}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
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
                  <Button disabled={isSubmitting} type="submit">
                    {isSubmitting
                      ? mode === 'signin'
                        ? 'Signing In...'
                        : 'Signing Up...'
                      : mode === 'signin'
                        ? 'Sign In'
                        : 'Sign Up'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Link
                  to="/sign-in?mode=signup"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => setMode('signup')}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link
                  to="/sign-in?mode=signin"
                  className="underline underline-offset-4 hover:text-primary"
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
