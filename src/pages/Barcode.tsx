
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Barcode from "react-barcode";

const BarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [type, setType] = useState("CODE128");
  const { toast } = useToast();

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

  const downloadBarcode = () => {
    const svg = document.querySelector("#barcode svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast({
        title: "Error",
        description: "Failed to create canvas context",
        variant: "destructive",
      });
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "barcode.png";
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast({
        title: "Success",
        description: "Barcode downloaded successfully",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
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
                Generate <span className="text-primary">Barcode</span>
              </h1>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Barcode Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select barcode type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODE128">Code 128</SelectItem>
                      <SelectItem value="EAN13">EAN-13</SelectItem>
                      <SelectItem value="EAN8">EAN-8</SelectItem>
                      <SelectItem value="UPC">UPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text or number"
                  />
                </div>
              </div>
            </div>

            {text && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit" id="barcode">
                  <Barcode
                    value={text}
                    format={type as any}
                    width={2}
                    height={100}
                    displayValue={true}
                    background="#FFFFFF"
                    lineColor="#000000"
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
                    onClick={downloadBarcode}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
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

export default BarcodeGenerator;
