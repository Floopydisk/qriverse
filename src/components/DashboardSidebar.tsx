
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  QrCode,
  Barcode,
  CheckCircle2,
  PauseCircle,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderOpen
} from "lucide-react";
import FolderList from "@/components/FolderList";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setShowFolderDialog: (show: boolean) => void;
  onSearch: (query: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  sidebarCollapsed,
  toggleSidebar,
  setShowFolderDialog,
  onSearch
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-full flex flex-col">
      {/* Sidebar Header & Search */}
      <div className="p-4 mt-24">
        {!sidebarCollapsed && (
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search codes..." 
              className="h-9 pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        )}
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-auto p-2">
        {/* My QR Codes Section */}
        <div className="mb-6">
          <div className="flex items-center px-2 mb-2">
            <span className={cn(
              "text-xs font-medium text-muted-foreground",
              sidebarCollapsed && "sr-only"
            )}>
              MY CODES
            </span>
          </div>

          <div className="space-y-1">
            <Button
              variant={isActive("/dashboard") ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard">
                <List className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>All (32)</span>}
              </Link>
            </Button>

            <Button
              variant={isActive("/barcode") ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/barcode">
                <Barcode className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>Barcodes</span>}
              </Link>
            </Button>

            <Button
              variant={isActive("/dashboard") && !location.search.includes("dynamic") ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <Link to="/dashboard">
                <QrCode className="h-4 w-4 mr-2" />
                {!sidebarCollapsed && <span>Static QR Codes</span>}
              </Link>
            </Button>

            <div className="ml-6 space-y-1">
              <Button
                variant={isActive("/dynamic-qr") ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/dynamic-qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  {!sidebarCollapsed && <span>Dynamic QR Codes</span>}
                </Link>
              </Button>

              <div className="ml-6 space-y-1">
                <Button
                  variant={isActive("/dynamic-qr") && location.search.includes("active") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/dynamic-qr?status=active">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {!sidebarCollapsed && <span>Active (10)</span>}
                  </Link>
                </Button>

                <Button
                  variant={isActive("/dynamic-qr") && location.search.includes("paused") ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/dynamic-qr?status=paused">
                    <PauseCircle className="h-4 w-4 mr-2" />
                    {!sidebarCollapsed && <span>Paused (11)</span>}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* My Folders Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className={cn(
              "text-xs font-medium text-muted-foreground",
              sidebarCollapsed && "sr-only"
            )}>
              MY FOLDERS
            </span>
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
          
          <div className={cn(sidebarCollapsed && "hidden")}>
            <FolderList />
          </div>
          
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowFolderDialog(true)}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
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
