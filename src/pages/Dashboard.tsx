
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Plus,
  FolderPlus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import QRCodeList from "@/components/QRCodeList";
import { useAuth } from "@/hooks/use-auth";
import { createFolder } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarProvider,
} from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [view, setView] = useState<"active" | "all" | "paused">("active");
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Success",
        description: `Folder "${newFolderName}" created successfully`,
      });
      setNewFolderName("");
      setShowFolderDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      });
    }
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    createFolderMutation.mutate(newFolderName);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="min-h-screen flex flex-col w-full">
        <FloatingCircles />
        <Header />

        <div className="flex-1 flex w-full">
          <Sidebar 
            variant="sidebar" 
            collapsible={sidebarCollapsed ? "icon" : "none"}
          >
            <DashboardSidebar 
              view={view}
              setView={setView}
              setShowFolderDialog={setShowFolderDialog}
              sidebarCollapsed={sidebarCollapsed}
              toggleSidebar={toggleSidebar}
            />
          </Sidebar>

          <main className="flex-1 container mx-auto px-4 pt-8 pb-12">
            <div className="max-w-7xl mx-auto space-y-8 mt-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      Static QR Codes
                    </h1>
                  </div>
                  <p className="text-muted-foreground">Manage your Static QR codes and folders</p>
                </div>
                
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        CREATE QR CODE
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate("/generate")}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Create QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dynamic-qr")}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Create Dynamic QR
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowFolderDialog(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Create Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4">                
                <QRCodeList />
              </div>
            </div>
          </main>

          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={handleCreateFolder}
                  disabled={createFolderMutation.isPending}
                >
                  {createFolderMutation.isPending ? "Creating..." : "Create Folder"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Footer />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
