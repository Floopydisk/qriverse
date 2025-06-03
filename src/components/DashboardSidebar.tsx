
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, List, QrCode, Barcode, CheckCircle2, PauseCircle, Folder, FolderPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserQRCodes, fetchUserFolders, fetchUserDynamicQRCodes } from "@/lib/api";
import FolderList from "@/components/FolderList";

interface DashboardSidebarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  selectedView: string;
  setSelectedView: (view: string) => void;
  setShowFolderDialog: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  sidebarCollapsed,
  toggleSidebar,
  selectedView,
  setSelectedView,
  setShowFolderDialog,
  searchQuery,
  setSearchQuery
}) => {
  const navigate = useNavigate();
  
  // Fetch QR codes to count them
  const { data: qrCodes = [] } = useQuery({
    queryKey: ['qrCodes'],
    queryFn: fetchUserQRCodes
  });

  // Fetch dynamic QR codes separately
  const { data: dynamicQRCodes = [] } = useQuery({
    queryKey: ['dynamicQRCodes'],
    queryFn: fetchUserDynamicQRCodes
  });

  // Get counts for different types of QR codes
  const allCodesCount = qrCodes.length;
  const barcodeCount = qrCodes.filter(code => code.type === "barcode").length;
  const staticQrCount = qrCodes.filter(code => code.type !== "dynamic" && code.type !== "barcode").length;
  const dynamicQrCount = dynamicQRCodes.length;
  const activeQrCount = dynamicQRCodes.filter(code => code.active !== false).length;
  const pausedQrCount = dynamicQRCodes.filter(code => code.active === false).length;

  // State to manage dynamic submenu visibility
  const [dynamicSubmenuOpen, setDynamicSubmenuOpen] = useState(
    selectedView === "dynamic" || selectedView === "dynamic-active" || selectedView === "dynamic-paused"
  );

  // Handler for menu item clicks
  const handleViewSelect = (view: string) => {
    setSelectedView(view);
    
    // For dynamic QR categories
    if (view === "dynamic") {
      setDynamicSubmenuOpen(true);
      navigate("/dynamic-qr");
    } else if (view === "dynamic-active" || view === "dynamic-paused") {
      setDynamicSubmenuOpen(true);
      navigate("/dynamic-qr");
    } else if (view === "barcode") {
      navigate("/barcode");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Search Bar */}
      <div className={`px-4 py-6 mt-16 md:mt-24 ${sidebarCollapsed ? 'px-2' : ''}`}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search QR Codes..." 
                className="h-9 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 overflow-auto px-2">
        {/* MY CODES Section */}
        <div className="mb-4">
          {!sidebarCollapsed && (
            <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2">
              MY CODES
            </h3>
          )}
          <ul className="space-y-1">
            {/* All Codes */}
            <li>
              <Button
                variant={selectedView === "all" ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${sidebarCollapsed ? 'h-10 px-2' : 'h-9'}`}
                onClick={() => handleViewSelect("all")}
                title={sidebarCollapsed ? `All (${allCodesCount})` : undefined}
              >
                <List className="h-4 w-4 mr-2 flex-shrink-0" />
                {!sidebarCollapsed && <span>All ({allCodesCount})</span>}
              </Button>
            </li>

            {/* Barcodes */}
            <li>
              <Button
                variant={selectedView === "barcode" ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${sidebarCollapsed ? 'h-10 px-2' : 'h-9'}`}
                onClick={() => handleViewSelect("barcode")}
                title={sidebarCollapsed ? `Barcodes (${barcodeCount})` : undefined}
              >
                <Barcode className="h-4 w-4 mr-2 flex-shrink-0" />
                {!sidebarCollapsed && <span>Barcodes ({barcodeCount})</span>}
              </Button>
            </li>

            {/* Static QR Codes */}
            <li>
              <Button
                variant={selectedView === "static" ? "default" : "ghost"}
                className={`w-full justify-start text-sm ${sidebarCollapsed ? 'h-10 px-2' : 'h-9'}`}
                onClick={() => handleViewSelect("static")}
                title={sidebarCollapsed ? `Static QR Codes (${staticQrCount})` : undefined}
              >
                <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
                {!sidebarCollapsed && <span>Static QR Codes ({staticQrCount})</span>}
              </Button>
            </li>

            {/* Dynamic QR Codes */}
            <li className="space-y-1">
              <Button
                variant={
                  selectedView === "dynamic" || 
                  selectedView === "dynamic-active" || 
                  selectedView === "dynamic-paused" ? "default" : "ghost"
                }
                className={`w-full justify-start text-sm ${sidebarCollapsed ? 'h-10 px-2' : 'h-9'}`}
                onClick={() => {
                  handleViewSelect("dynamic");
                  setDynamicSubmenuOpen(!dynamicSubmenuOpen);
                }}
                title={sidebarCollapsed ? `Dynamic QR Codes (${dynamicQrCount})` : undefined}
              >
                <QrCode className="h-4 w-4 mr-2 flex-shrink-0" />
                {!sidebarCollapsed && <span>Dynamic QR Codes ({dynamicQrCount})</span>}
              </Button>

              {/* Dynamic submenu */}
              {!sidebarCollapsed && dynamicSubmenuOpen && (
                <div className="pl-6 space-y-1">
                  <Button
                    variant={selectedView === "dynamic-active" ? "default" : "ghost"}
                    className="w-full justify-start text-xs h-8"
                    onClick={() => handleViewSelect("dynamic-active")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                    <span>Active ({activeQrCount})</span>
                  </Button>

                  <Button
                    variant={selectedView === "dynamic-paused" ? "default" : "ghost"}
                    className="w-full justify-start text-xs h-8"
                    onClick={() => handleViewSelect("dynamic-paused")}
                  >
                    <PauseCircle className="h-3.5 w-3.5 mr-2" />
                    <span>Paused ({pausedQrCount})</span>
                  </Button>
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* MY FOLDERS Section */}
        {!sidebarCollapsed && (
          <div className="mb-4">
            <div className="flex justify-between items-center px-2 mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                MY FOLDERS
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setShowFolderDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ul className="space-y-1">
              <FolderList />
            </ul>
          </div>
        )}
      </div>

      {/* Sidebar Footer - Collapse/Expand Button */}
      <div className="p-4 mt-auto">
        <Button 
          onClick={toggleSidebar} 
          variant="outline" 
          size="icon"
          className="mx-auto flex h-8 w-8 rounded-full bg-background shadow-md"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
