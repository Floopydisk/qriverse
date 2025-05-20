
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Search,
  QrCode,
  Barcode,
  CheckCircle2,
  PauseCircle,
  List,
  Plus,
  FolderOpen
} from "lucide-react";
import FolderList from "@/components/FolderList";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  setShowFolderDialog: (show: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  setShowFolderDialog
}) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* My QR Codes Section */}
      <SidebarGroup>
        <SidebarGroupLabel>MY CODES</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/dashboard") ? "outline" : "default"}
                isActive={isActive("/dashboard")}
                asChild
              >
                <Link to="/dashboard">
                  <List className="h-4 w-4 mr-2" />
                  <span>All (32)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/barcode") ? "outline" : "default"}
                isActive={isActive("/barcode")}
                asChild
              >
                <Link to="/barcode">
                  <Barcode className="h-4 w-4 mr-2" />
                  <span>Barcodes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/dashboard") && !location.search.includes("dynamic") ? "outline" : "default"}
                isActive={isActive("/dashboard") && !location.search.includes("dynamic")}
                asChild
              >
                <Link to="/dashboard">
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>Static QR Codes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/dynamic-qr") ? "outline" : "default"}
                isActive={isActive("/dynamic-qr")}
                asChild
              >
                <Link to="/dynamic-qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>Dynamic QR Codes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/dynamic-qr") && location.search.includes("active") ? "outline" : "default"}
                isActive={isActive("/dynamic-qr") && location.search.includes("active")}
                asChild
              >
                <Link to="/dynamic-qr?status=active">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>Active (10)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                variant={isActive("/dynamic-qr") && location.search.includes("paused") ? "outline" : "default"}
                isActive={isActive("/dynamic-qr") && location.search.includes("paused")}
                asChild
              >
                <Link to="/dynamic-qr?status=paused">
                  <PauseCircle className="h-4 w-4 mr-2" />
                  <span>Paused (11)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* My Folders Section */}
      <SidebarGroup>
        <div className="flex items-center justify-between px-2">
          <SidebarGroupLabel>MY FOLDERS</SidebarGroupLabel>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5" 
            onClick={() => setShowFolderDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <SidebarGroupContent>
          <FolderList />
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default DashboardSidebar;
