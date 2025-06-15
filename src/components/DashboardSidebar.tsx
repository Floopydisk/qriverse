
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  QrCode, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Users, 
  Link,
  Key,
  Webhook,
  Zap
} from "lucide-react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: QrCode, label: "QR Codes", path: "/dashboard" },
    { icon: Link, label: "Dynamic QR", path: "/dynamic-qr" },
    { icon: Users, label: "Teams", path: "/teams" },
    { icon: Key, label: "API Management", path: "/api-management" },
    { icon: Webhook, label: "Webhooks", path: "/webhooks" },
    { icon: Settings, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <RouterLink to="/" className="flex items-center space-x-2">
          <QrCode className="h-8 w-8 text-green-600" />
          <span className="text-xl font-bold">QrLabs</span>
        </RouterLink>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
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
        </nav>
      </ScrollArea>
    </div>
  );
};

export default DashboardSidebar;
