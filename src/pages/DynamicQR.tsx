
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import FooterAuth from '@/components/FooterAuth';
import DashboardSidebar from "@/components/DashboardSidebar";
import FloatingCircles from '@/components/FloatingCircles';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserDynamicQRCodes, createDynamicQRCode } from '@/lib/api';
import DynamicQRCodeList from '@/components/DynamicQRCodeList';
import AdvancedSearch from '@/components/AdvancedSearch';
import BulkOperations from '@/components/BulkOperations';
import { useSidebar } from '@/components/ui/sidebar';
import HeaderAvatar from '@/components/ui/header-avatar';


interface SearchFilters {
  query: string;
  type: string;
  dateRange: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const DynamicQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('view');
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("dynamic");

  // Set sidebar collapsed by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    dateRange: {},
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

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
    queryFn: async () => {
      const data = await fetchUserDynamicQRCodes();
      console.log('Fetched dynamic QR codes:', data);
      return data;
    },
  });

  // Filter and sort dynamic QR codes based on filters
  const filteredAndSortedQRCodes = dynamicQRCodes
    .filter(code => {
      // Search query filter
      if (filters.query && !code.name.toLowerCase().includes(filters.query.toLowerCase()) && 
          !code.target_url.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }

      // Status filter for dynamic QR codes
      if (selectedView === "dynamic-active" && code.active !== true) return false;
      if (selectedView === "dynamic-paused" && code.active !== false) return false;


      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const codeDate = new Date(code.created_at);
        if (filters.dateRange.from && codeDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && codeDate > filters.dateRange.to) return false;
      }

      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'scan_count':
          comparison = (a.scan_count || 0) - (b.scan_count || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          comparison = new Date(a.updated_at || a.created_at).getTime() - new Date(b.updated_at || b.created_at).getTime();
          break;
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
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

  const switchToCreateTab = () => {
    setActiveTab('create');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Bulk operations handlers
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(filteredAndSortedQRCodes.map(code => code.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    // TODO: Implement bulk delete for dynamic QR codes
    toast({
      title: 'Feature Coming Soon',
      description: 'Bulk delete for dynamic QR codes will be available soon',
    });
    setSelectedItems([]);
  };

  const handleMoveSelected = () => {
    // TODO: Implement bulk move for dynamic QR codes
    toast({
      title: 'Feature Coming Soon',
      description: 'Bulk move for dynamic QR codes will be available soon',
    });
  };

  const handleDownloadSelected = () => {
    // TODO: Implement bulk download for dynamic QR codes
    toast({
      title: 'Feature Coming Soon',
      description: 'Bulk download for dynamic QR codes will be available soon',
    });
  };

  const isAllSelected = selectedItems.length > 0 && selectedItems.length === filteredAndSortedQRCodes.length;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FloatingCircles />
      <HeaderAvatar />
      <div className="flex-1 flex w-full relative">
        {/* Sidebar */}
        <div className={cn(
          "bg-background border-r border-border h-screen fixed top-0 left-0 transition-all duration-200 z-20",
          sidebarCollapsed ? 'w-16' : 'w-64',
          // On mobile, overlay the content when expanded
          isMobile && !sidebarCollapsed && "shadow-lg"
        )}>
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

        {/* Overlay for mobile when sidebar is open */}
        {isMobile && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/20 z-10" 
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-200",
          // On desktop, push content when sidebar is open
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64'),
          // On mobile, don't push content (overlay instead)
          isMobile && 'ml-0'
        )}>
          <div className="container mx-auto px-4 pt-8 pb-12">
            <div className="max-w-6xl mx-auto space-y-8 mt-8">
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
                
                <TabsContent value="view" className="mt-6 space-y-6">
                  {/* Advanced Search */}
                  <AdvancedSearch
                    filters={filters}
                    onFiltersChange={setFilters}
                    totalResults={filteredAndSortedQRCodes.length}
                  />

                  {/* Bulk Operations */}
                  <BulkOperations
                    selectedItems={selectedItems}
                    onSelectAll={handleSelectAll}
                    onDeleteSelected={handleDeleteSelected}
                    onMoveSelected={handleMoveSelected}
                    onDownloadSelected={handleDownloadSelected}
                    totalItems={filteredAndSortedQRCodes.length}
                    isAllSelected={isAllSelected}
                  />

                  {/* Dynamic QR Code List */}
                  <DynamicQRCodeList
                    dynamicQRCodes={filteredAndSortedQRCodes}
                    isLoading={isLoading}
                    onCreateNew={switchToCreateTab}
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
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

      <FooterAuth />
    </div>
  );
};

export default DynamicQR;
