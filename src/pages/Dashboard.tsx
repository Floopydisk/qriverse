
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Plus,
  Folder,
  FolderPlus,
  Download,
  Trash2,
  Edit,
  FolderOpen,
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import QRCodeList from "@/components/QRCodeList";
import FolderList from "@/components/FolderList";

const Dashboard = () => {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [view, setView] = useState<"folders" | "all">("folders");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    // In a real app, you would save this to the backend
    toast({
      title: "Success",
      description: `Folder "${newFolderName}" created successfully`,
    });
    setNewFolderName("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome, <span className="text-primary">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground">Manage your QR codes and folders</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => navigate("/generate")}>
                <Plus className="mr-2 h-4 w-4" />
                Create QR Code
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                </DialogTrigger>
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
                    <Button className="w-full" onClick={handleCreateFolder}>
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search QR codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={view === "folders" ? "default" : "outline"}
                onClick={() => setView("folders")}
              >
                <Folder className="mr-2 h-4 w-4" />
                Folders
              </Button>
              <Button 
                variant={view === "all" ? "default" : "outline"}
                onClick={() => setView("all")}
              >
                <QrCode className="mr-2 h-4 w-4" />
                All QR Codes
              </Button>
            </div>
          </div>

          {/* Main Content */}
          {view === "folders" ? <FolderList /> : <QRCodeList />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
