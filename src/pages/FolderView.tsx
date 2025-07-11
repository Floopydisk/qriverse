
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQRCodesInFolder, fetchUserFolders, Folder } from "@/lib/api";
import Header from "@/components/Header";
import FooterAuth from "@/components/FooterAuth";
import FloatingCircles from "@/components/FloatingCircles";
import DashboardSidebar from "@/components/DashboardSidebar";
import QRCodeList from "@/components/QRCodeList";

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    queryKey: ['qrCodes', folderId],
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
    <div className="min-h-screen flex flex-col w-full">
      <FloatingCircles />
      <Header />

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border fixed top-0 left-0 h-screen transition-all duration-200 z-10`}>
          <DashboardSidebar 
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            setShowFolderDialog={setShowFolderDialog}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="container mx-auto px-4 pt-8 pb-12">
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
          </div>
          
          <FooterAuth />
        </div>
      </div>
    </div>
  );
};

export default FolderView;
