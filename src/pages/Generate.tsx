
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download, Upload, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Generate = () => {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [darkColor, setDarkColor] = useState("#10B981"); // Default green color
  const [lightColor, setLightColor] = useState("#FFFFFF"); // Default white color
  const [logo, setLogo] = useState<string | null>(null);
  const [addLogo, setAddLogo] = useState(false);
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
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrDataUrl(dataUrl);
      
      // If user wants to add logo and has uploaded one
      if (addLogo && logo) {
        addLogoToQR(dataUrl);
      } else {
        toast({
          title: "Success",
          description: "QR code generated successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const addLogoToQR = (qrDataUrl: string) => {
    if (!logo) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const qrImage = new Image();
    
    qrImage.onload = () => {
      canvas.width = qrImage.width;
      canvas.height = qrImage.height;
      
      // Draw QR code
      if (ctx) ctx.drawImage(qrImage, 0, 0);
      
      // Draw logo in center
      const logoImg = new Image();
      logoImg.onload = () => {
        // Calculate logo size (25% of QR code)
        const logoSize = qrImage.width * 0.25;
        const logoX = (qrImage.width - logoSize) / 2;
        const logoY = (qrImage.height - logoSize) / 2;
        
        // Draw logo with white background - fixed assignments
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
          
          // Draw the logo
          ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
          
          // Convert to data URL
          const finalQR = canvas.toDataURL("image/png");
          setQrDataUrl(finalQR);
          
          toast({
            title: "Success",
            description: "QR code with logo generated successfully",
          });
        }
      };
      logoImg.src = logo;
    };
    qrImage.src = qrDataUrl;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (e.target.value === "") {
      setQrDataUrl("");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setLogo(event.target.result);
          setAddLogo(true);
          toast({
            title: "Logo uploaded",
            description: "Your logo has been uploaded successfully",
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setAddLogo(false);
    if (qrDataUrl) {
      generateQR();
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
              
              {/* Color and Logo Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="darkColor">QR Code Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="darkColor"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={darkColor}
                      onChange={(e) => setDarkColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lightColor">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="lightColor"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={lightColor}
                      onChange={(e) => setLightColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="addLogo" 
                    checked={addLogo} 
                    onCheckedChange={(checked) => {
                      setAddLogo(checked === true);
                      if (checked === false) {
                        setLogo(null);
                      }
                    }}
                  />
                  <Label htmlFor="addLogo">Add Logo to Center</Label>
                </div>
                
                {addLogo && (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {logo ? "Change Logo" : "Upload Logo"}
                      </Button>
                      
                      {logo && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={removeLogo}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    
                    {logo && (
                      <div className="flex justify-center">
                        <img
                          src={logo}
                          alt="Logo preview"
                          className="h-16 w-16 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
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
