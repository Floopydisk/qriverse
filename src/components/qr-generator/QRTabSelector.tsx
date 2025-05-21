
import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, AtSign, Wifi, Phone, CreditCard, Link, MessageSquare, Twitter } from "lucide-react";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle tab change, with fallback to setActiveTab if onTabChange is not provided
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    } else if (setActiveTab) {
      setActiveTab(value);
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
      // Add other cases if needed
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

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold">QR Code Content Type</h2>
          
          {/* Dynamic QR toggle switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="dynamic-mode"
              checked={isDynamicEnabled}
              onCheckedChange={handleDynamicToggle}
            />
            <Label htmlFor="dynamic-mode">Make Dynamic QR</Label>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden md:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden md:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              <span className="hidden md:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="wifi" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="hidden md:inline">WiFi</span>
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">Phone</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="vcard" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              <span className="hidden md:inline">Twitter</span>
            </TabsTrigger>
          </TabsList>
          
          {/* We wrap the children inside the Tabs component */}
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
