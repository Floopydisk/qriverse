
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodePreviewProps {
  qrDataUrl: string;
  activeTab: string;
  text?: string;
}

export function QRCodePreview({ qrDataUrl, activeTab, text = "" }: QRCodePreviewProps) {
  const { toast } = useToast();

  const copyText = async () => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `qrcode-${activeTab}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  if (!qrDataUrl) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-lg p-4 mx-auto w-fit">
        <img
          src={qrDataUrl}
          alt="Generated QR Code"
          className="w-64 h-64"
        />
      </div>

      <div className="flex justify-center gap-4">
        {activeTab === "text" && (
          <Button
            variant="outline"
            className="w-40"
            onClick={copyText}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
        )}
        <Button
          className="w-40"
          onClick={downloadQR}
        >
          <Download className="mr-2 h-4 w-4" />
          Download QR
        </Button>
      </div>
    </div>
  );
}
