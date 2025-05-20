
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQRCodesInFolder, fetchUserFolders, Folder } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import DashboardSidebar from "@/components/DashboardSidebar";
import QRCodeList from "@/components/QRCodeList";

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  
  // Redirect if no folder ID is provided
  useEffect(() => {
    if (!folderId) {
      navigate('/dashboard');
    }
  }, [folderId, navigate]);

  const { 
    isLoading: qrCodesLoading, 
    error: qrCodesError 
  } = useQuery({
    queryKey: ['qrCodes', folderId, searchQuery],
    queryFn: () => fetchQRCodesInFolder(folderId!),
    enabled: !!folderId,
  });

  const {
    data: folders = [],
    isLoading: foldersLoading,
  } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchUserFolders,
  });

  const currentFolder = folders.find((folder: Folder) => folder.id === folderId);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (!folderId) {
    return null;
  }

  if (foldersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={`h-full bg-background border-r border-border transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[250px]'}`}>
          <DashboardSidebar
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            setShowFolderDialog={setShowFolderDialog}
            onSearch={handleSearch}
          />
        </div>

        <main className="flex-1 container mx-auto px-4 pt-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-8 mt-24">
            <div className="flex items-center">
              <Button 
                variant="ghost"
                size="sm"
                className="mr-2"
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {currentFolder ? currentFolder.name : 'Folder'}
                </h1>
                <p className="text-muted-foreground">
                  Manage QR codes in this folder
                </p>
              </div>
            </div>

            <div className="space-y-4">                
              {qrCodesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : qrCodesError ? (
                <div className="text-center py-12">
                  <div className="bg-destructive/10 border border-destructive rounded-xl p-8 max-w-md mx-auto">
                    <h3 className="text-xl font-medium mb-2">Error Loading QR Codes</h3>
                    <p className="text-muted-foreground mb-6">
                      {qrCodesError instanceof Error ? qrCodesError.message : "Failed to load QR codes"}
                    </p>
                    <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['qrCodes', folderId] })}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <QRCodeList folderId={folderId} searchQuery={searchQuery} />
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default FolderView;
