
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingCircles from "@/components/FloatingCircles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogIn, UserPlus, Mail } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

const SignIn = () => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome to BarQR</h1>
            <p className="text-muted-foreground">Sign in to create and manage your QR codes</p>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full flex items-center justify-center gap-2" 
              onClick={() => loginWithRedirect({ 
                authorizationParams: { ui_locales: 'login' }
              })}
            >
              <LogIn className="h-5 w-5" />
              Sign In with Email
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => loginWithRedirect({ 
                authorizationParams: { ui_locales: 'signup' }
              })}
            >
              <UserPlus className="h-5 w-5" />
              Sign Up with Email
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-sm">or</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <Button 
              variant="secondary"
              className="w-full flex items-center justify-center gap-2" 
              onClick={() => loginWithRedirect({
                authorizationParams: {
                  connection: 'google-oauth2'
                }
              })}
            >
              <FaGoogle className="h-5 w-5" />
              Continue with Google
            </Button>
            
            <Button 
              variant="secondary"
              className="w-full flex items-center justify-center gap-2" 
              onClick={() => loginWithRedirect({
                authorizationParams: {
                  connection: 'email'
                }
              })}
            >
              <Mail className="h-5 w-5" />
              Continue with Email
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
