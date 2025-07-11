import { useState } from "react";
import Header from "@/components/Header";
import FooterAuth from "@/components/FooterAuth";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/components/ui/use-toast";

const Wifi = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const { toast } = useToast();

  const generateWifiQR = async () => {
    if (!ssid) {
      toast({
        title: "Error",
        description: "Please enter the network name (SSID)",
        variant: "destructive",
      });
      return;
    }

    try {
      const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${
        hidden ? "true" : "false"
      };;`;
      
      const dataUrl = await QRCode.toDataURL(wifiString, {
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
        description: "WiFi QR code generated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "wifi-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "WiFi QR code downloaded successfully",
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
                WiFi <span className="text-primary">QR Code</span>
              </h1>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ssid">Network Name (SSID)</Label>
                  <Input
                    id="ssid"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    placeholder="Enter network name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="encryption">Security Type</Label>
                  <Select value={encryption} onValueChange={setEncryption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select security type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {encryption !== "nopass" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter network password"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hidden"
                    checked={hidden}
                    onCheckedChange={(checked) => setHidden(checked as boolean)}
                  />
                  <Label htmlFor="hidden">Hidden network</Label>
                </div>

                <Button
                  className="w-full"
                  onClick={generateWifiQR}
                >
                  Generate QR Code
                </Button>
              </div>
            </div>

            {qrDataUrl && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit">
                  <img
                    src={qrDataUrl}
                    alt="Generated WiFi QR Code"
                    className="w-64 h-64"
                  />
                </div>

                <div className="flex justify-center">
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

      <FooterAuth />
    </div>
  );
};

export default Wifi;
