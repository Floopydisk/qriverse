
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  List,
  CheckCircle2,
  PauseCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  QrCode
} from "lucide-react";
import { Link } from "react-router-dom";
import FolderList from "@/components/FolderList";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  view: "active" | "all" | "paused";
  setView: (view: "active" | "all" | "paused") => void;
  setShowFolderDialog: (show: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  view,
  setView,
  setShowFolderDialog,
  sidebarCollapsed,
  toggleSidebar
}) => {
  return (
    <>
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
            {/* Add Dynamic QR section */}
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                tooltip="Dynamic QR Codes"
              >
                <Link to="/dynamic-qr">
                  <QrCode className="h-4 w-4" />
                  <span>Dynamic QR</span>
                </Link>
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
      <SidebarFooter className="p-4 mt-auto">
        <Button 
          onClick={toggleSidebar} 
          variant="outline" 
          size="icon"
          className="mx-auto flex h-8 w-8 rounded-full bg-background shadow-md"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </SidebarFooter>
    </>
  );
};

export default DashboardSidebar;
