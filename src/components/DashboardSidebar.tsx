
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, List, QrCode, Barcode, CheckCircle2, PauseCircle, Folder, FolderPlus, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserQRCodes, fetchUserFolders } from "@/lib/api";
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

  // Get counts for different types of QR codes
  const allCodesCount = qrCodes.length;
  const barcodeCount = qrCodes.filter(code => code.type === "barcode").length;
  const staticQrCount = qrCodes.filter(code => code.type !== "dynamic" && code.type !== "barcode").length;
  const dynamicQrCount = qrCodes.filter(code => code.type === "dynamic").length;
  const activeQrCount = qrCodes.filter(code => code.type === "dynamic" && code.active !== false).length;
  const pausedQrCount = qrCodes.filter(code => code.type === "dynamic" && code.active === false).length;

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
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="px-4 py-6 mt-24">
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
      </div>

      {/* Main Menu Content */}
      <div className="flex-1 overflow-auto px-2">
        {/* MY CODES Section */}
        <div className="mb-4">
          <h3 className="px-2 text-xs font-medium text-muted-foreground mb-2">
            {!sidebarCollapsed && "MY CODES"}
          </h3>
          <ul className="space-y-1">
            {/* All Codes */}
            <li>
              <Button
                variant={selectedView === "all" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => handleViewSelect("all")}
              >
                <List className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>All ({allCodesCount})</span>}
              </Button>
            </li>

            {/* Barcodes */}
            <li>
              <Button
                variant={selectedView === "barcode" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => handleViewSelect("barcode")}
              >
                <Barcode className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>Barcodes ({barcodeCount})</span>}
              </Button>
            </li>

            {/* Static QR Codes */}
            <li>
              <Button
                variant={selectedView === "static" ? "default" : "ghost"}
                className="w-full justify-start text-sm h-9"
                onClick={() => handleViewSelect("static")}
              >
                <QrCode className="h-4 w-4 mr-2" />
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
                className="w-full justify-start text-sm h-9"
                onClick={() => {
                  handleViewSelect("dynamic");
                  setDynamicSubmenuOpen(!dynamicSubmenuOpen);
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>Dynamic QR Codes ({dynamicQrCount})</span>}
              </Button>

              {/* This nested submenu is always visible when parent is selected */}
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
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              {!sidebarCollapsed && "MY FOLDERS"}
            </h3>
            {!sidebarCollapsed && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5" 
                onClick={() => setShowFolderDialog(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <ul className="space-y-1">
              <FolderList />
            </ul>
          )}
        </div>
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
