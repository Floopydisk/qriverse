
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FloatingCircles from "@/components/FloatingCircles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogIn, UserPlus } from "lucide-react";

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
              onClick={() => loginWithRedirect({ screen_hint: "login" })}
            >
              <LogIn className="h-5 w-5" />
              Sign In
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => loginWithRedirect({ screen_hint: "signup" })}
            >
              <UserPlus className="h-5 w-5" />
              Sign Up
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignIn;
