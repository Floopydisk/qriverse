
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text, Wifi, Contact, MessageSquare, Mail, Twitter, Bitcoin } from "lucide-react";

interface QRTabSelectorProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function QRTabSelector({ activeTab, setActiveTab, children }: QRTabSelectorProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-4 mb-2">
        <TabsTrigger value="text" className="flex items-center gap-1">
          <Text className="h-4 w-4" />
          <span className="hidden sm:inline">Text/URL</span>
        </TabsTrigger>
        <TabsTrigger value="wifi" className="flex items-center gap-1">
          <Wifi className="h-4 w-4" />
          <span className="hidden sm:inline">WiFi</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-1">
          <Contact className="h-4 w-4" />
          <span className="hidden sm:inline">Contact</span>
        </TabsTrigger>
        <TabsTrigger value="more" className="flex items-center gap-1">
          <span>More</span>
        </TabsTrigger>
      </TabsList>

      {activeTab === "more" && (
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="sms" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">SMS</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="flex items-center gap-1">
            <Twitter className="h-4 w-4" />
            <span className="hidden sm:inline">Twitter</span>
          </TabsTrigger>
          <TabsTrigger value="bitcoin" className="flex items-center gap-1">
            <Bitcoin className="h-4 w-4" />
            <span className="hidden sm:inline">Bitcoin</span>
          </TabsTrigger>
        </TabsList>
      )}
      
      {children}
    </Tabs>
  );
}
