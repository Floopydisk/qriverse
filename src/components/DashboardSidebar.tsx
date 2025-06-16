
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  QrCode, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Users, 
  Link,
  Key,
  Webhook,
  Zap,
  Search,
  List,
  Barcode,
  CheckCircle2,
  PauseCircle,
  Plus,
  Menu,
  X
} from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchUserQRCodes, fetchUserDynamicQRCodes, fetchUserFolders } from "@/lib/api";
import { Dispatch, SetStateAction } from "react";

interface DashboardSidebarProps {
  selectedView?: string;
  setSelectedView?: Dispatch<SetStateAction<string>>;
  setShowFolderDialog?: Dispatch<SetStateAction<boolean>> | (() => void);
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
  searchQuery?: string;
  setSearchQuery?: Dispatch<SetStateAction<string>>;
}

const DashboardSidebar = ({
  selectedView = "all",
  setSelectedView,
  setShowFolderDialog,
  sidebarCollapsed = false,
  toggleSidebar,
  searchQuery = "",
  setSearchQuery
}: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { data: qrCodes = [] } = useQuery({
    queryKey: ['qrCodes'],
    queryFn: fetchUserQRCodes
  });

  const { data: dynamicQRCodes = [] } = useQuery({
    queryKey: ['dynamicQRCodes'],
    queryFn: fetchUserDynamicQRCodes
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchUserFolders
  });

  // Get counts for different types of QR codes
  const allCodesCount = qrCodes.length;
  const barcodeCount = qrCodes.filter(code => code.type === "barcode").length;
  const staticQrCount = qrCodes.filter(code => code.type !== "dynamic" && code.type !== "barcode").length;
  const dynamicQrCount = dynamicQRCodes.length;
  const activeQrCount = dynamicQRCodes.filter(code => code.active !== false).length;
  const pausedQrCount = dynamicQRCodes.filter(code => code.active === false).length;

  const handleViewSelect = (view: string) => {
    if (setSelectedView) {
      setSelectedView(view);
    }
    
    if (view === "dynamic") {
      navigate("/dynamic-qr");
    } else if (view === "dynamic-active" || view === "dynamic-paused") {
      navigate("/dynamic-qr");
    } else if (view === "barcode") {
      navigate("/barcode");
    } else {
      navigate("/dashboard");
    }
  };

  const handleCreateFolder = () => {
    if (setShowFolderDialog) {
      // Handle both possible types of setShowFolderDialog
      if (typeof setShowFolderDialog === 'function' && setShowFolderDialog.length === 0) {
        // It's a () => void function
        setShowFolderDialog();
      } else {
        // It's a Dispatch<SetStateAction<boolean>> function
        (setShowFolderDialog as Dispatch<SetStateAction<boolean>>)(true);
      }
    }
  };

  const menuItems = [
    { icon: QrCode, label: "QR Codes", path: "/dashboard" },
    { icon: Link, label: "Dynamic QR", path: "/dynamic-qr" },
    { icon: Barcode, label: "Barcodes", path: "/barcode" },
    { icon: Users, label: "Teams", path: "/teams" },
    { icon: Key, label: "API Management", path: "/api-management" },
    { icon: Webhook, label: "Webhooks", path: "/webhooks" },
    { icon: Settings, label: "Profile", path: "/profile" },
  ];

  const filterItems = [
    { 
      id: "all", 
      label: `All (${allCodesCount})`, 
      icon: List,
      description: "All your QR codes and barcodes"
    },
    { 
      id: "static", 
      label: `Static QR (${staticQrCount})`, 
      icon: QrCode,
      description: "Fixed content QR codes"
    },
    { 
      id: "dynamic", 
      label: `Dynamic QR (${dynamicQrCount})`, 
      icon: BarChart3,
      description: "Editable and trackable QR codes"
    },
    { 
      id: "barcode", 
      label: `Barcodes (${barcodeCount})`, 
      icon: Barcode,
      description: "Various barcode formats"
    },
  ];

  const dynamicSubItems = [
    { 
      id: "dynamic-active", 
      label: `Active (${activeQrCount})`, 
      icon: CheckCircle2,
      color: "text-green-600"
    },
    { 
      id: "dynamic-paused", 
      label: `Paused (${pausedQrCount})`, 
      icon: PauseCircle,
      color: "text-red-600"
    },
  ];

  if (sidebarCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 h-screen flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-8 h-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "w-10 h-10",
                    isActive && "bg-green-600 text-white hover:bg-green-700"
                  )}
                  asChild
                >
                  <RouterLink to={item.path}>
                    <item.icon className="h-4 w-4" />
                  </RouterLink>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <RouterLink to="/" className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold">QrLabs</span>
          </RouterLink>
          {toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="w-8 h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {setSearchQuery && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search QR Codes..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {/* Navigation Menu */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-3">
              Navigation
            </h3>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-green-600 text-white hover:bg-green-700"
                  )}
                  asChild
                >
                  <RouterLink to={item.path}>
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </RouterLink>
                </Button>
              );
            })}
          </div>

          {/* Filter Section - only show if we have filter functionality */}
          {setSelectedView && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-3">
                Filter Codes
              </h3>
              {filterItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  <Button
                    variant={selectedView === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleViewSelect(item.id)}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                  
                  {/* Dynamic QR submenu */}
                  {item.id === "dynamic" && (selectedView.startsWith("dynamic")) && (
                    <div className="pl-7 space-y-1">
                      {dynamicSubItems.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant={selectedView === subItem.id ? "default" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => handleViewSelect(subItem.id)}
                        >
                          <subItem.icon className={`h-4 w-4 mr-2 ${subItem.color}`} />
                          {subItem.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Folders Section */}
          {setShowFolderDialog && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Folders
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={handleCreateFolder}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {folders.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4 px-3">
                  No folders yet
                </div>
              ) : (
                <div className="space-y-1">
                  {folders.map((folder) => (
                    <Button
                      key={folder.id}
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <RouterLink to={`/dashboard/folder/${folder.id}`}>
                        <FolderOpen className="mr-3 h-4 w-4" />
                        {folder.name}
                      </RouterLink>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default DashboardSidebar;
