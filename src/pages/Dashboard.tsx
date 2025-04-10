
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Plus,
  Folder,
  FolderPlus,
  Search,
  CheckCircle2,
  PauseCircle,
  List,
  ChevronLeft,
  ChevronRight
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
import FolderList from "@/components/FolderList";
import { useAuth } from "@/hooks/use-auth";
import { createFolder } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <FloatingCircles />
        <Header />

        <div className="flex-1 flex">
          <Sidebar variant="sidebar" collapsible={sidebarCollapsed ? "icon" : "none"}>
            <SidebarHeader className="px-4 py-6 mt-24">
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search QR Codes..." 
                    className="h-9 pl-9"
                  />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>MY QR CODES</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={view === "all"} 
                      onClick={() => setView("all")}
                    >
                      <List className="h-4 w-4" />
                      <span>All ({0})</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={view === "active"} 
                      onClick={() => setView("active")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Active ({0})</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      isActive={view === "paused"} 
                      onClick={() => setView("paused")}
                    >
                      <PauseCircle className="h-4 w-4" />
                      <span>Paused ({0})</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel className="flex justify-between items-center">
                  MY FOLDERS
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => setShowFolderDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </SidebarGroupLabel>
                <SidebarMenu>
                  <FolderList />
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 container mx-auto px-4 pt-8 pb-12">
            {/* Sidebar toggle button - moved it to not overlap with search */}
            <Button 
              onClick={toggleSidebar} 
              variant="outline" 
              size="icon"
              className="fixed left-4 top-28 z-40 rounded-full h-8 w-8 bg-background shadow-md"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <div className="max-w-7xl mx-auto space-y-8 mt-24">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">
                      Active QR Codes
                    </h1>
                    <div className="text-sm text-muted-foreground">
                      (0/50 Dynamic codes)
                    </div>
                  </div>
                  <p className="text-muted-foreground">Manage your QR codes and folders</p>
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
                      <DropdownMenuItem onClick={() => setShowFolderDialog(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Create Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={view === "active" ? "default" : "outline"}
                      onClick={() => setView("active")}
                      className="flex items-center gap-1"
                    >
                      <span>Last Created</span>
                    </Button>
                  </div>
                </div>
                
                <QRCodeList />
              </div>
            </div>
          </main>

          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogContent>
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
