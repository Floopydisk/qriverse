
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  Scan, 
  Wifi, 
  MessageSquare,
  ArrowRight,
  Star, 
  Zap,
  Code,
  Users,
  LineChart,
  BookOpen,
  Smartphone,
  Check,
  Shield,
  BarChart,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0C0B10]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Only show the landing page for non-authenticated users
  if (user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0C0B10] text-white">
      <div className="fixed w-full z-50">
        <Header />
      </div>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="min-h-screen pt-24 pb-12 relative flex items-center">
          {/* Background gradients */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-green-800/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-green-600/10 blur-[150px] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Create, Share, Track
                <span className="block mt-2">
                  <span className="text-primary">QR Codes </span>
                  <span className="text-white">That </span>
                  <span className="text-primary">Work</span>
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Create dynamic QR codes for all your business needs with our easy-to-use platform.
                Track scans, customize designs, and manage all your QR codes in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

            <div className="relative mt-16 max-w-5xl mx-auto">
              <div className="bg-card rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/c9dc0c83-e57f-4910-b1e3-cdb0d894a501.png" 
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
        
        {/* Features Grid */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need for QR success</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools you need to create, manage, and track your QR codes effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dynamic QR Codes</h3>
                <p className="text-gray-400 mb-4">
                  Create QR codes that you can edit anytime without reprinting. Change destinations, update content, and fix typos instantly.
                </p>
                <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/generate")}>
                  Create now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-gray-400 mb-4">
                  Track scans in real-time. Get insights on when, where, and how often your QR codes are being scanned to optimize your campaigns.
                </p>
                <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/guides")}>
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>

              <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Custom Design</h3>
                <p className="text-gray-400 mb-4">
                  Personalize your QR codes with colors, logos, and frames that match your brand identity while ensuring optimal scannability.
                </p>
                <Button variant="link" className="px-0 text-primary hover:text-primary/80" onClick={() => navigate("/signin")}>
                  Try it now <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-20 bg-card/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Create, customize, and track your QR codes in just a few simple steps
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
              <div className="flex-1 md:pr-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Choose your QR code type</h3>
                </div>
                <p className="text-gray-400 ml-12">
                  Select from URL, vCard, plain text, email, WiFi credentials, and more. Each type is optimized for its specific purpose.
                </p>
              </div>
              <div className="flex-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                    <QrCode className="h-6 w-6 text-primary" />
                    <span className="text-xs">URL</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                    <Users className="h-6 w-6 text-primary" />
                    <span className="text-xs">vCard</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                    <Code className="h-6 w-6 text-primary" />
                    <span className="text-xs">Text</span>
                  </div>
                  <div className="bg-background p-3 rounded-lg flex flex-col items-center gap-2 border border-white/10">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-xs">Email</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
              <div className="flex-1 order-2 md:order-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-background rounded-lg border border-white/10">
                    <p className="text-sm mb-1">Enter your URL:</p>
                    <div className="flex gap-2">
                      <Input placeholder="https://example.com" />
                      <Button size="sm">Create</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-xs">SEO friendly</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-3 rounded-lg border border-white/10">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-xs">High resolution</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2 md:pl-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Input your content</h3>
                </div>
                <p className="text-gray-400 ml-12">
                  Enter the specific information for your QR code, such as your URL, contact information, or WiFi credentials. Our system validates your input to ensure it works correctly.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
              <div className="flex-1 md:pr-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Customize and download</h3>
                </div>
                <p className="text-gray-400 ml-12">
                  Add your logo, change colors, or apply a frame to your QR code. Make it your own while ensuring it remains scannable. Download in multiple formats and start using it right away.
                </p>
              </div>
              <div className="flex-1 bg-card rounded-xl border border-white/10 p-6 max-w-md">
                <div className="flex gap-4">
                  <QrCode className="h-28 w-28 text-primary bg-white p-3 rounded-lg" />
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="p-2 bg-background rounded-lg border border-white/10 flex items-center justify-between">
                      <span className="text-xs">Colors</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      </div>
                    </div>
                    <div className="p-2 bg-background rounded-lg border border-white/10 flex items-center justify-between">
                      <span className="text-xs">Format</span>
                      <div className="flex gap-1">
                        <span className="text-xs bg-primary/20 text-primary px-2 rounded">PNG</span>
                        <span className="text-xs bg-primary/10 text-primary/60 px-2 rounded">SVG</span>
                      </div>
                    </div>
                    <Button size="sm" className="mt-1">Download</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/20 to-green-900/20 p-12 rounded-2xl border border-primary/30 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to create your first QR code?</h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Get started for free today and experience the full power of dynamic QR codes.
                No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Create Free QR Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/guides">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-transparent border-white/20 hover:bg-white/10 text-white"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Guides
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
