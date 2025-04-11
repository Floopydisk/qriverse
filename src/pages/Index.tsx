
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-800/30 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[150px] pointer-events-none"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Announcement badge */}
            <div className="max-w-lg mx-auto mb-8 md:mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full py-2 px-4 text-sm text-center w-fit mx-auto">
                <span className="text-purple-300">Announcing our Private Beta</span>
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                BarQR is the new
                <span className="block mt-2">
                  <span className="text-purple-400">standard</span>
                  <span className="text-white"> for </span>
                  <span className="text-orange-400">collaboration</span>
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Chat, code, cloud, deployments, and more.
              </p>
            </div>
            
            {/* Email signup */}
            <div className="max-w-md mx-auto flex gap-2 mb-16">
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
            
            {/* App Preview */}
            <div className="max-w-6xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="bg-[#13131c] p-3 flex items-center gap-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gradient-to-br from-purple-500 to-pink-500 w-8 h-8 rounded-lg justify-center">
                    <QrCode className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">BarQR</span>
                </div>
                <div className="text-xs text-gray-400 px-2 py-1 rounded-full bg-white/5">
                  Core Team
                </div>
              </div>
              
              <div className="grid grid-cols-12 bg-[#13131c]">
                {/* Sidebar */}
                <div className="col-span-2 border-r border-white/10 py-4 px-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/5 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 text-sm">
                      <Code className="h-4 w-4" />
                      <span>Code</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-gray-400 text-sm">
                      <LineChart className="h-4 w-4" />
                      <span>Analytics</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-2">
                    <div className="text-xs font-medium text-gray-400 px-2">
                      Direct Messages
                    </div>
                    {['Tejas', 'Ari', 'Landon'].map((name) => (
                      <div key={name} className="flex items-center gap-2 px-2 py-1 text-gray-300 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-700"></div>
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Main content */}
                <div className="col-span-7 p-4 max-h-[400px] overflow-y-auto">
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Tejas</span>
                            <span className="text-xs text-gray-400">11:04 PM</span>
                          </div>
                          <div className="mt-1 space-y-2">
                            <p className="text-sm text-gray-300">
                              Hey Ari! I wanted to check in with you on the next release and bug list. Do you think we'll be on track to share the latest with the team on Friday?
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 mt-1"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Ari</span>
                            <span className="text-xs text-gray-400">11:12 PM</span>
                          </div>
                          <div className="mt-1 space-y-2">
                            <p className="text-sm text-gray-300">
                              There are a few items on the tasklist that needs to be addressed on iOS.
                            </p>
                            <div className="bg-white/5 rounded-md p-3 text-sm">
                              <span className="text-gray-400">// Linear</span>
                              <p className="mt-1">Follow up on highlights in the block at the 2nd level.</p>
                              <p className="mt-1">Also add improvements here's how to handle the kinds of errors.</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="bg-gray-700 text-xs px-2 py-0.5 rounded">iOS-21</span>
                                <span className="text-xs text-gray-400">In Progress</span>
                                <div className="flex -space-x-1 ml-auto">
                                  <div className="w-5 h-5 rounded-full bg-gray-600 border border-gray-800"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 mt-1"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Tejas</span>
                            <span className="text-xs text-gray-400">11:23 PM</span>
                          </div>
                          <div className="mt-1 space-y-2">
                            <p className="text-sm text-gray-300">
                              Awesome! Make sure it's moving as close to the target as possible :)
                            </p>
                            <p className="text-sm text-gray-300">
                              Here's a link to wait if you don't have access yet!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right sidebar */}
                <div className="col-span-3 border-l border-white/10 p-4 bg-[#11111a]">
                  <div>
                    <div className="text-sm font-medium mb-2">Members - 3</div>
                    <div className="space-y-2">
                      {['Tejas', 'Ari', 'Landon'].map((name) => (
                        <div key={name} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700"></div>
                          <span className="text-sm">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">Quick Access</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-md text-xs">
                        <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
                        <span>Release Schedule</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-md text-xs">
                        <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
                        <span>API Documentation</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">Tasks</div>
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-white/5 rounded-md text-xs">
                        Complete UI redesign
                      </div>
                      <div className="px-3 py-2 bg-white/5 rounded-md text-xs">
                        Fix navigation bugs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Collaborate on everything.</h2>
              <p className="text-gray-400 mb-6">From deployments to tasks, work with your team every step of the way.</p>
              
              <div className="bg-[#13131c] rounded-lg border border-white/10 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tejas</span>
                      <span className="text-xs text-gray-400">11:04 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">Cool - have a few improvements in mind - here's a link!</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0"></div>
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Ari</span>
                      <span className="text-xs text-gray-400">11:12 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">There are a few items on the tasklist that needs to be addressed on iOS.</p>
                    <div className="bg-[#0d0d14] rounded-md p-3 mt-2 text-sm">
                      <span className="text-gray-400">// Linear</span>
                      <p className="text-xs text-gray-300 mt-1">Follow up on highlights in the block at the 2nd level.</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-gray-700 text-xs px-2 py-0.5 rounded">iOS-21</span>
                        <span className="text-xs text-gray-400">In Review</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Crafted for your favorite tools</h2>
              <p className="text-gray-400 mb-6">Connect your tools - we'll handle the rest. Many integrations, with more to come.</p>
              
              <div className="bg-[#13131c] rounded-lg border border-white/10 p-10 flex items-center justify-center">
                <div className="relative w-full h-[200px]">
                  {/* Center circle */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center z-20">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Orbiting circles */}
                  <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-black text-xl font-bold">G</span>
                  </div>
                  <div className="absolute top-1/4 right-1/3 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-black text-sm">gh</span>
                  </div>
                  <div className="absolute bottom-1/4 right-1/4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-black text-xl">F</span>
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="text-black text-xl">S</span>
                  </div>
                  
                  {/* Orbit paths */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Everything you need section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 mb-6">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Everything you need - all in one platform.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-16">From prototyping to production - develop without switching tabs.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-left">
                <div className="flex mb-3 items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-medium">Chat</h3>
                </div>
                <p className="text-sm text-gray-400">Communicate with team members using our powerful AI-assisted integrations.</p>
              </div>
              
              <div className="text-left">
                <div className="flex mb-3 items-center">
                  <Code className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-medium">Deployments</h3>
                </div>
                <p className="text-sm text-gray-400">Ship and deploy your applications directly from Dimension.</p>
              </div>
              
              <div className="text-left">
                <div className="flex mb-3 items-center">
                  <Scan className="w-5 h-5 mr-2 text-primary" />
                  <h3 className="font-medium">Code Explorer</h3>
                </div>
                <p className="text-sm text-gray-400">View and edit your repository directly from Dimension.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Partners */}
        <section className="pb-20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400 mb-10">Join the maintainers and contributors to the largest open-source projects on our waitlist.</p>
            
            <div className="flex justify-center items-center flex-wrap gap-12">
              <div className="text-white/60 hover:text-white transition-colors">
                <svg width="120" height="28" viewBox="0 0 120 28" fill="currentColor">
                  <path d="M14 0C6.3 0 0 6.3 0 14s6.3 14 14 14 14-6.3 14-14S21.7 0 14 0zm0 26C7.4 26 2 20.6 2 14S7.4 2 14 2s12 5.4 12 12-5.4 12-12 12z" />
                  <circle cx="14" cy="14" r="7" />
                </svg>
              </div>
              
              <div className="text-white/60 hover:text-white transition-colors">
                <svg width="80" height="28" viewBox="0 0 80 28" fill="none" stroke="currentColor">
                  <rect x="2" y="6" width="76" height="16" rx="3" strokeWidth="2"/>
                  <line x1="20" y1="6" x2="20" y2="22" strokeWidth="2"/>
                  <line x1="40" y1="6" x2="40" y2="22" strokeWidth="2"/>
                  <line x1="60" y1="6" x2="60" y2="22" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="text-white/60 hover:text-white transition-colors">
                <svg width="100" height="28" viewBox="0 0 100 28" fill="none" stroke="currentColor">
                  <path d="M10 14h80M50 4v20" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="50" cy="14" r="10" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="text-white/60 hover:text-white transition-colors">
                <svg width="120" height="28" viewBox="0 0 120 28" fill="none" stroke="currentColor">
                  <path d="M20 4L40 24M60 4L80 24M100 4L120 24" strokeWidth="2"/>
                  <path d="M20 24L40 4M60 24L80 4M100 24L120 4" strokeWidth="2"/>
                </svg>
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
