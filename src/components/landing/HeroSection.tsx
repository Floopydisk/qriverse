
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Check, Shield } from "lucide-react";
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
    <section className="min-h-screen pt-36 md:pt-40 lg:pt-44 xl:pt-48 2xl:pt-52 3xl:pt-56 4xl:pt-64 pb-12 relative flex items-center">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] 3xl:w-[800px] 3xl:h-[800px] 4xl:w-[1000px] 4xl:h-[1000px] rounded-full bg-green-800/20 blur-[120px] 3xl:blur-[150px] 4xl:blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] 3xl:w-[700px] 3xl:h-[700px] 4xl:w-[900px] 4xl:h-[900px] rounded-full bg-green-600/10 blur-[150px] 3xl:blur-[180px] 4xl:blur-[220px] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-4xl 3xl:max-w-6xl 4xl:max-w-8xl mx-auto text-center space-y-8 3xl:space-y-12 4xl:space-y-16 mb-12 3xl:mb-16 4xl:mb-20 transition-all duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl 3xl:text-8xl 4xl:text-9xl font-bold leading-tight">
            Create, Share, Track
            <span className="block mt-2">
              <span className="text-primary">QR Codes </span>
              <span className="text-white">That </span>
              <span className="text-primary">Work</span>
            </span>
          </h1>
          
          <p className={`text-lg md:text-xl 3xl:text-2xl 4xl:text-3xl text-gray-300 max-w-2xl 3xl:max-w-4xl 4xl:max-w-5xl mx-auto transition-all delay-200 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            Create dynamic QR codes for all your business needs with our easy-to-use platform.
            Track scans, customize designs, and manage all your QR codes in one place.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 3xl:gap-6 4xl:gap-8 justify-center transition-all delay-300 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-primary hover:bg-primary/90 text-white text-base 3xl:text-lg 4xl:text-xl px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
            </Button>
            <Link to="/guides">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-transparent border-white/20 hover:bg-white/10 text-white text-base 3xl:text-lg 4xl:text-xl px-6 py-3 3xl:px-8 3xl:py-4 4xl:px-10 4xl:py-5"
              >
                <BookOpen className="mr-2 h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        <div className={`relative mt-16 3xl:mt-20 4xl:mt-24 max-w-5xl 3xl:max-w-7xl 4xl:max-w-9xl mx-auto transition-all delay-500 duration-1000 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
          <div className="bg-card rounded-2xl 3xl:rounded-3xl 4xl:rounded-4xl border border-white/10 shadow-xl overflow-hidden">
            <img 
              src="/img/web_img.png" 
              alt="QR Code Platform Dashboard" 
              className="w-full h-auto" 
            />
          </div>
          <div className="absolute -bottom-6 3xl:-bottom-8 4xl:-bottom-10 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-lg border border-white/10 rounded-full px-8 py-3 3xl:px-10 3xl:py-4 4xl:px-12 4xl:py-5 flex items-center gap-4 3xl:gap-6 4xl:gap-8">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 3xl:w-4 3xl:h-4 4xl:w-5 4xl:h-5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm 3xl:text-base 4xl:text-lg">Live tracking</span>
            </div>
            <div className="w-px h-6 3xl:h-8 4xl:h-10 bg-white/10"></div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 text-primary" />
              <span className="text-sm 3xl:text-base 4xl:text-lg">100% Scannable</span>
            </div>
            <div className="w-px h-6 3xl:h-8 4xl:h-10 bg-white/10 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2">
              <Shield className="h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6 text-primary" />
              <span className="text-sm 3xl:text-base 4xl:text-lg">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
