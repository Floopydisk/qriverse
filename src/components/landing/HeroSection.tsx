
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Trigger scroll animation on mount
  useEffect(() => {
    setScrolled(true);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <section className="min-h-screen pt-36 md:pt-40 lg:pt-44 pb-12 relative flex items-center">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-green-800/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-[150px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl mx-auto text-center space-y-8 mb-12 transition-all duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Create, Share, Track
            <span className="block mt-2">
              <span className="text-primary">QR Codes </span>
              <span className="text-white">That </span>
              <span className="text-primary">Work</span>
            </span>
          </h1>
          
          <p className={`text-lg text-gray-300 max-w-2xl mx-auto transition-all delay-200 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Create dynamic QR codes for all your business needs with our easy-to-use platform.
            Track scans, customize designs, and manage all your QR codes in one place.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all delay-300 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/guides">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white/20 hover:bg-white/10 text-white"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className={`relative mt-16 max-w-5xl mx-auto transition-all delay-500 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
          <div className="bg-card rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <img 
              src="/img/web_img.png" 
              alt="QR Code Platform Dashboard" 
              className="w-full h-auto" 
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-lg border border-white/10 rounded-full px-8 py-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm">Live tracking</span>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">100% Scannable</span>
            </div>
            <div className="w-px h-6 bg-white/10 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
