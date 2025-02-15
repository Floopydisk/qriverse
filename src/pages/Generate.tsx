import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import QRCode from "qrcode";

const Generate = () => {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const { toast } = useToast();

  const generateQR = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter some text to generate a QR code",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: "#10B981",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
      toast({
        title: "Success",
        description: "QR code generated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value === "") {
      setQrDataUrl("");
    }
  };

  const copyText = async () => {
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
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "QR code downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingCircles />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground text-center">
                Generate <span className="text-primary">QR Code</span>
              </h1>
              
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter text or URL"
                  value={text}
                  onChange={handleTextChange}
                  onKeyUp={(e) => e.key === "Enter" && generateQR()}
                  className="pr-24"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={generateQR}
                >
                  Generate
                </Button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="w-64 h-64"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    className="w-40"
                    onClick={copyText}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </Button>
                  <Button
                    className="w-40"
                    onClick={downloadQR}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
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

export default Generate;
