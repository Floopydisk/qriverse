
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QrScanner from "react-qr-scanner";

interface ScanResult {
  text: string;
  isURL: boolean;
}

const Scan = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const isValidURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleScan = (data: any) => {
    if (data) {
      const text = data.text;
      setScanResult({
        text,
        isURL: isValidURL(text)
      });
      setIsCameraActive(false);
      toast({
        title: "Success",
        description: "QR code scanned successfully",
      });
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    toast({
      title: "Error",
      description: "Failed to access camera",
      variant: "destructive",
    });
  };

  const copyToClipboard = async (text: string) => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Scan <span className="text-primary">QR Code</span>
              </h1>
              
              <p className="text-foreground/80">
                Use your camera to scan a QR code
              </p>
            </div>

            {isCameraActive ? (
              <div className="relative">
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                  constraints={{
                    audio: false,
                    video: { facingMode: "environment" }
                  }}
                />
                <Button
                  className="absolute top-2 right-2"
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsCameraActive(false)}
                >
                  Stop Camera
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={() => setIsCameraActive(true)}
              >
                <Camera className="mr-2 h-5 w-5" />
                Start Camera
              </Button>
            )}

            {scanResult && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-muted rounded-lg">
                  {scanResult.isURL ? (
                    <div className="flex items-center gap-4">
                      <div className="flex-1 flex items-center gap-2 bg-background p-2 rounded">
                        <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{scanResult.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => copyToClipboard(scanResult.text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        className="shrink-0"
                        onClick={() => window.open(scanResult.text, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Link
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className="flex-1">{scanResult.text}</p>
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(scanResult.text)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Scan;
