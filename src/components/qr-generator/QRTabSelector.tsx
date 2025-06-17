/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, AtSign, Wifi, Phone, CreditCard, Link, MessageSquare, Twitter, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface QRTabSelectorProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  qrData?: any;
  children?: ReactNode;
  setActiveTab?: (tab: string) => void;
}

const QRTabSelector = ({ activeTab, onTabChange, qrData, children, setActiveTab }: QRTabSelectorProps) => {
  const [isDynamicEnabled, setIsDynamicEnabled] = useState(false);
  const [showDynamicDialog, setShowDynamicDialog] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main tabs to display directly
  const mainTabs = [
    { id: "url", label: "URL", icon: <Link className="h-4 w-4" /> },
    { id: "text", label: "Text", icon: <QrCode className="h-4 w-4" /> },
    { id: "email", label: "Email", icon: <AtSign className="h-4 w-4" /> },
  ];

  // Tabs to display in the "More" dropdown
  const moreTabs = [
    { id: "wifi", label: "WiFi", icon: <Wifi className="h-4 w-4" /> },
    { id: "phone", label: "Phone", icon: <Phone className="h-4 w-4" /> },
    { id: "sms", label: "SMS", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "vcard", label: "Contact", icon: <CreditCard className="h-4 w-4" /> },
    { id: "twitter", label: "Twitter", icon: <Twitter className="h-4 w-4" /> },
    { id: "bitcoin", label: "Bitcoin", icon: <CreditCard className="h-4 w-4" /> },
  ];

  // Handle tab change, with fallback to setActiveTab if onTabChange is not provided
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    } else if (setActiveTab) {
      setActiveTab(value);
    }
    // Close the more dropdown if it's open
    if (moreOpen) {
      setMoreOpen(false);
    }
  };

  // Handle the switch toggle
  const handleDynamicToggle = (checked: boolean) => {
    setIsDynamicEnabled(checked);
    if (checked) {
      setShowDynamicDialog(true);
    }
  };

  // Continue to dynamic QR page with data from current QR
  const handleContinueToDynamic = () => {
    let targetUrl = "";
    
    // Determine the content based on the active tab
    switch (activeTab) {
      case "url":
        targetUrl = qrData?.url || "";
        break;
      case "text":
        targetUrl = qrData?.text ? `data:text/plain;charset=utf-8,${encodeURIComponent(qrData.text)}` : "";
        break;
      case "email":
        if (qrData?.email) {
          const subject = encodeURIComponent(qrData.emailSubject || "");
          const body = encodeURIComponent(qrData.emailBody || "");
          targetUrl = `mailto:${qrData.email}?subject=${subject}&body=${body}`;
        }
        break;
      case "sms":
        if (qrData?.phone) {
          const message = encodeURIComponent(qrData.message || "");
          targetUrl = `sms:${qrData.phone}?body=${message}`;
        }
        break;
      default:
        break;
    }

    if (!targetUrl) {
      toast({
        title: "Error",
        description: "Please provide valid content before switching to dynamic QR code",
        variant: "destructive"
      });
      setShowDynamicDialog(false);
      setIsDynamicEnabled(false);
      return;
    }

    // Navigate to dynamic QR page with the content
    const name = qrData?.name || "My QR Code";
    navigate(`/dynamic-qr`, { state: { name, targetUrl } });
    toast({
      title: "Switching to Dynamic QR",
      description: "Your content has been transferred to the dynamic QR creation page"
    });
  };
  
  // Find current active tab in moreTabs
  const activeMoreTab = moreTabs.find(tab => tab.id === activeTab);
  
  // Determine if the active tab is in the "More" section
  const isMoreTabActive = activeMoreTab !== undefined;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Content Type
          </h2>
          
          {/* Dynamic QR toggle switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="dynamic-mode"
              checked={isDynamicEnabled}
              onCheckedChange={handleDynamicToggle}
            />
            <Label htmlFor="dynamic-mode" className="text-sm">Make Dynamic QR</Label>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            {/* Main tabs */}
            {mainTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
            
            {/* "More" dropdown tab */}
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger asChild>
                <TabsTrigger 
                  value={isMoreTabActive ? activeTab : "more"}
                  className={`flex flex-col items-center gap-1 py-3 ${isMoreTabActive ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}`}
                >
                  {isMoreTabActive ? activeMoreTab.icon : <ChevronDown className="h-4 w-4" />}
                  <span className="text-xs">{isMoreTabActive ? activeMoreTab.label : "More"}</span>
                </TabsTrigger>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-48" align="end">
                <div className="bg-popover rounded-md overflow-hidden border">
                  {moreTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant="ghost"
                      className={`w-full justify-start px-3 py-3 text-sm rounded-none ${activeTab === tab.id ? "bg-accent" : ""}`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </TabsList>
          
          {children}
        </Tabs>
      </div>

      {/* Dialog for confirming dynamic QR code conversion */}
      <Dialog open={showDynamicDialog} onOpenChange={(open) => {
        setShowDynamicDialog(open);
        if (!open) {
          setIsDynamicEnabled(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Dynamic QR Code</DialogTitle>
            <DialogDescription>
              Dynamic QR codes allow you to change the destination URL without creating a new QR code. 
              This QR code will be converted to a dynamic QR code, and your content will be transferred.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDynamicDialog(false);
              setIsDynamicEnabled(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleContinueToDynamic}>
              Continue to Dynamic QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRTabSelector;
