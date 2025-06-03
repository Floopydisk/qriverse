
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, List, QrCode, Barcode, CheckCircle2, PauseCircle, Plus, Home, ChartPie } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchUserQRCodes, fetchUserDynamicQRCodes } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileDashboardSidebarProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  setShowFolderDialog: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onClose?: () => void;
}

const MobileDashboardSidebar: React.FC<MobileDashboardSidebarProps> = ({
  selectedView,
  setSelectedView,
  setShowFolderDialog,
  searchQuery,
  setSearchQuery,
  onClose
}) => {
  const navigate = useNavigate();
  
  const { data: qrCodes = [] } = useQuery({
    queryKey: ['qrCodes'],
    queryFn: fetchUserQRCodes
  });

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

  const handleViewSelect = (view: string) => {
    setSelectedView(view);
    
    if (view === "dynamic") {
      navigate("/dynamic-qr");
    } else if (view === "dynamic-active" || view === "dynamic-paused") {
      navigate("/dynamic-qr");
    } else if (view === "barcode") {
      navigate("/barcode");
    } else {
      navigate("/dashboard");
    }
    
    onClose?.();
  };

  const menuItems = [
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
      icon: ChartPie,
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

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search QR Codes..." 
            className="h-11 pl-9 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1"
                onClick={() => {
                  navigate("/generate");
                  onClose?.();
                }}
              >
                <QrCode className="h-5 w-5" />
                <span className="text-xs">Create QR</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1"
                onClick={() => {
                  navigate("/dynamic-qr");
                  onClose?.();
                }}
              >
                <ChartPie className="h-5 w-5" />
                <span className="text-xs">Dynamic QR</span>
              </Button>
            </div>
          </div>

          {/* My Codes */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              My Codes
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  <Button
                    variant={selectedView === item.id ? "default" : "ghost"}
                    className="w-full justify-start h-14 px-3"
                    onClick={() => handleViewSelect(item.id)}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Button>
                  
                  {/* Dynamic QR submenu */}
                  {item.id === "dynamic" && (selectedView.startsWith("dynamic")) && (
                    <div className="pl-11 space-y-1">
                      {dynamicSubItems.map((subItem) => (
                        <Button
                          key={subItem.id}
                          variant={selectedView === subItem.id ? "default" : "ghost"}
                          className="w-full justify-start h-10 text-sm"
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
          </div>

          {/* Folders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Folders
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => {
                  setShowFolderDialog(true);
                  onClose?.();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-center py-4">
              No folders yet
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default MobileDashboardSidebar;
