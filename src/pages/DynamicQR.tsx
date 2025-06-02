
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DashboardSidebar from "@/components/DashboardSidebar";
import FloatingCircles from '@/components/FloatingCircles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserDynamicQRCodes, createDynamicQRCode } from '@/lib/api';
import DynamicQRCodeList from '@/components/DynamicQRCodeList';
import { useSidebar } from '@/components/ui/sidebar';

const DynamicQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('view');
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("dynamic");

  // Handle the data from static QR conversion
  useEffect(() => {
    if (location.state) {
      const { name: qrName, targetUrl: qrUrl } = location.state as { name?: string, targetUrl?: string };
      
      if (qrName) {
        setName(qrName);
      }
      
      if (qrUrl) {
        setTargetUrl(qrUrl);
        setActiveTab('create');
        toast({
          title: 'QR Content Transferred',
          description: 'Your QR content has been transferred to create a dynamic QR code'
        });
      }
    }
  }, [location.state, toast]);

  const {
    data: dynamicQRCodes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dynamicQRCodes'],
    queryFn: fetchUserDynamicQRCodes,
  });

  const handleCreateQRCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name for your QR code',
        variant: 'destructive',
      });
      return;
    }

    if (!targetUrl.trim() || !isValidUrl(targetUrl)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);
      await createDynamicQRCode(name, targetUrl);
      
      toast({
        title: 'Success',
        description: 'Dynamic QR code created successfully',
      });
      
      setName('');
      setTargetUrl('');
      setActiveTab('view');
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create dynamic QR code',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // New function to switch to create tab
  const switchToCreateTab = () => {
    setActiveTab('create');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter dynamic QR codes based on active/paused status if selected
  const filteredDynamicQRCodes = dynamicQRCodes.filter(code => {
    if (selectedView === "dynamic-active") return code.active === true;
    if (selectedView === "dynamic-paused") return code.active === false;
    return true; // Show all for "dynamic" view
  });

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FloatingCircles />
      <Header />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border h-screen fixed top-0 left-0 transition-all duration-200 z-10`}>
          <DashboardSidebar 
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            setShowFolderDialog={() => {}}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto px-4 pt-8 pb-12">
            <div className="max-w-6xl mx-auto space-y-8 mt-24">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    <span className="text-primary">Dynamic QR</span> Codes
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create QR codes that can be updated without changing the QR code itself
                  </p>
                </div>
                <Button
                  onClick={switchToCreateTab}
                  className="md:self-end"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Dynamic QR
                </Button>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full md:w-auto">
                  <TabsTrigger value="view" className="flex-1">View My Codes</TabsTrigger>
                  <TabsTrigger value="create" className="flex-1">Create New Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="view" className="mt-6">
                  <DynamicQRCodeList
                    dynamicQRCodes={filteredDynamicQRCodes}
                    isLoading={isLoading}
                    onCreateNew={switchToCreateTab}
                  />
                </TabsContent>
                
                <TabsContent value="create" className="mt-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 max-w-2xl mx-auto">
                    <form onSubmit={handleCreateQRCode} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">QR Code Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter a name for your QR code"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetUrl">Target URL</Label>
                        <Input
                          id="targetUrl"
                          placeholder="https://example.com"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          This is the website where users will be redirected when they scan the QR code.
                          You can change this URL later without changing the QR code.
                        </p>
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <QrCode className="mr-2 h-4 w-4" />
                              Create Dynamic QR Code
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DynamicQR;
