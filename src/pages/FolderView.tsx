
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FolderOpen, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCodeList from "@/components/QRCodeList";
import { useAuth } from "@/hooks/use-auth";
import { fetchFolder } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFolder } from "@/lib/api";

const FolderView = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const { data: folder, isLoading: isFolderLoading } = useQuery({
    queryKey: ['folder', folderId],
    queryFn: () => folderId ? fetchFolder(folderId) : null,
    enabled: !!folderId
  });

  useEffect(() => {
    if (folder) {
      setFolderName(folder.name);
    }
  }, [folder]);

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: {id: string, name: string}) => updateFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder', folderId] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Folder Renamed",
        description: "The folder has been renamed successfully"
      });
      setRenameDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to rename folder",
        variant: "destructive"
      });
    }
  });

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRenameFolder = () => {
    if (!folderName.trim() || !folderId) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive"
      });
      return;
    }

    renameMutation.mutate({ id: folderId, name: folderName });
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!folderId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-4">Folder Not Found</h3>
          <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <FloatingCircles />
        <Header />

        <div className="flex-1 flex">
          <Sidebar variant="sidebar" collapsible={sidebarCollapsed ? "icon" : "none"}>
            <DashboardSidebar
              view="active" 
              setView={() => {}}
              setShowFolderDialog={() => {}}
              sidebarCollapsed={sidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
          </Sidebar>

          <main className="flex-1 container mx-auto px-4 pt-8 pb-12">
            <div className="max-w-7xl mx-auto space-y-8 mt-24">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={handleBackToDashboard}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  
                  {isFolderLoading ? (
                    <div className="h-8 w-48 animate-pulse bg-muted rounded-md"></div>
                  ) : (
                    <h1 className="text-2xl font-bold mr-2">
                      {folder?.name || "Folder"}
                    </h1>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setRenameDialogOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {folderId && <QRCodeList folderId={folderId} />}
              </div>
            </div>
          </main>
        </div>

        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
              <Button 
                className="w-full" 
                onClick={handleRenameFolder}
                disabled={renameMutation.isPending}
              >
                {renameMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default FolderView;
