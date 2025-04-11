
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { 
  QrCode, 
  Scan, 
  Wifi, 
  Barcode, 
  ArrowRight, 
  Star, 
  MessageSquare,
  Zap,
  Code,
  Users,
  LineChart 
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
      <div className="min-h-screen flex items-center justify-center">
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
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Purple gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-transparent pointer-events-none" />
          
          {/* Glowing circle */}
          <div className="absolute bottom-0 right-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-600 to-pink-500 opacity-30 blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Integration badge */}
            <div className="max-w-lg mx-auto mb-12 md:mb-16">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-2 px-4 text-sm text-center w-fit mx-auto">
                <span className="text-purple-300">hundreds of integrations</span>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto text-center space-y-6 mb-12 md:mb-16">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
                BarQR is the new
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  standard for collaboration
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                The delightfully smart QR code platform.
              </p>
            </div>
            
            {/* Email signup */}
            <div className="max-w-md mx-auto flex gap-2">
              <Input 
                placeholder="Email address..." 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
              />
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6"
                onClick={handleGetStarted}
              >
                Join waitlist
              </Button>
            </div>
          </div>
        </section>
        
        {/* App Screenshot Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            {/* App UI Mockup */}
            <div className="max-w-5xl mx-auto border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-[#1A1A24]">
              {/* Mockup header */}
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <QrCode className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-medium">BarQR Project</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Members • 5</span>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(n => (
                      <div key={n} className="h-6 w-6 rounded-full bg-gray-500 border border-[#1A1A24]"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Mock UI content */}
              <div className="grid grid-cols-12 min-h-[400px]">
                {/* Sidebar */}
                <div className="col-span-3 border-r border-white/10 p-3">
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-md p-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                      <span className="text-sm">Chat</span>
                    </div>
                    <div className="rounded-md p-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Code</span>
                    </div>
                    <div className="rounded-md p-2 flex items-center gap-2">
                      <LineChart className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Analytics</span>
                    </div>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="col-span-6 p-4">
                  <div className="space-y-6">
                    {/* Chat messages */}
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tyler</span>
                          <span className="text-xs text-gray-400">12:34 PM</span>
                        </div>
                        <div className="mt-1 bg-white/5 rounded-lg p-3 text-sm">
                          Hey! Art I wanted to check in with you on the next release and bug list.
                          <br />Do you think we're on track to share the latest with the team on Friday?
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex-shrink-0"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Art</span>
                          <span className="text-xs text-gray-400">12:36 PM</span>
                        </div>
                        <div className="mt-1 bg-white/5 rounded-lg p-3 text-sm">
                          There are a few items on the tasklist that needs to be addressed on iOS.
                        </div>
                      </div>
                    </div>
                    
                    {/* Code block */}
                    <div className="bg-[#111118] rounded-md p-3 font-mono text-xs text-gray-300">
                      <div className="text-gray-500">// GitHub Pull Request</div>
                      <div className="mt-2">
                        <span className="text-purple-400">#</span> <span className="text-blue-300">Create a new directory for the website files</span>
                      </div>
                      <div>mkdir qr_website</div>
                    </div>
                  </div>
                </div>
                
                {/* Right sidebar */}
                <div className="col-span-3 border-l border-white/10 p-3 space-y-4">
                  <div className="text-sm font-medium">Quick Access</div>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-md p-2 text-xs flex items-center gap-1.5">
                      <div className="h-3 w-3 bg-purple-500 rounded-sm"></div>
                      <span>Database</span>
                    </div>
                    <div className="bg-white/5 rounded-md p-2 text-xs flex items-center gap-1.5">
                      <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                      <span>API Credentials</span>
                    </div>
                  </div>
                  
                  <div className="text-sm font-medium mt-4">Tasks</div>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-md p-2 text-xs">QR-211: Selector fix</div>
                    <div className="bg-white/5 rounded-md p-2 text-xs">Barcode scan</div>
                  </div>
                  
                  <div className="text-sm font-medium mt-4">Documents</div>
                  <div className="space-y-2">
                    <div className="bg-white/5 rounded-md p-2 text-xs flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>Product wiki</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-800 opacity-10 blur-3xl pointer-events-none"
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">All the tools you need</h2>
              <p className="text-gray-300">Generate QR codes for your website, WiFi networks, or any text, and manage them all in one place.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={cn(
                    "p-6 rounded-xl backdrop-blur-sm border hover:border-purple-400/50 transition-colors",
                    index === 0 ? "bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-500/20" : "bg-white/5 border-white/10"
                  )}
                >
                  <feature.icon className={cn(
                    "h-12 w-12 mb-4",
                    index === 0 ? "text-purple-400" : "text-gray-400"
                  )} />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-purple-900/30 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Join thousands of users creating and managing QR codes with BarQR
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg h-auto"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const features = [
  {
    icon: QrCode,
    title: "QR Generator",
    description: "Create custom QR codes with your brand colors and logo",
  },
  {
    icon: Scan,
    title: "QR Scanner",
    description: "Scan any QR code instantly using your device's camera",
  },
  {
    icon: Wifi,
    title: "WiFi QR Codes",
    description: "Generate QR codes for easy WiFi network sharing",
  },
  {
    icon: Barcode,
    title: "Organization",
    description: "Group your QR codes into folders and manage them easily",
  },
  {
    icon: Users,
    title: "Team Sharing",
    description: "Collaborate with your team on QR code projects",
  },
  {
    icon: LineChart,
    title: "Analytics",
    description: "Track scans and interactions with your QR codes",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate and download QR codes in seconds",
  },
  {
    icon: Star,
    title: "Premium Support",
    description: "Get priority support from our dedicated team",
  },
];

export default Index;
