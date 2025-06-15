
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodePreviewProps {
  qrDataUrl: string;
  activeTab: string;
  text?: string;
  frameStyle?: string;
}

export function QRCodePreview({ qrDataUrl, activeTab, text = "", frameStyle = "none" }: QRCodePreviewProps) {
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

  if (!qrDataUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
        <div className="w-64 h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">QR Code Preview</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill in the form and click "Generate QR Code" to see your QR code here
        </p>
      </div>
    );
  }

  // Frame classes/styles
  let wrapClass = "bg-white rounded-lg p-6 shadow-lg";
  if (frameStyle === "rounded") wrapClass += " rounded-2xl border border-green-500";
  if (frameStyle === "circle") wrapClass += " rounded-full border-4 border-green-600 p-3";
  if (frameStyle === "border") wrapClass += " border-4 border-green-500";

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <div className={wrapClass} style={frameStyle === "circle" ? { aspectRatio: "1/1" } : {}}>
        <img
          src={qrDataUrl}
          alt="Generated QR Code"
          className={frameStyle === "circle" ? "w-56 h-56 rounded-full" : "w-64 h-64"}
        />
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        {(activeTab === "text" || activeTab === "url") && text && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyText}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Text
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={downloadQR}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
