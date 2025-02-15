
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

const Barcode = () => {
  const [text, setText] = useState("");
  const [type, setType] = useState("code128");
  const [barcodeUrl, setBarcodeUrl] = useState("");
  const { toast } = useToast();

  const generateBarcode = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter text to generate a barcode",
        variant: "destructive",
      });
      return;
    }

    // Barcode generation logic will be implemented in future updates
    toast({
      title: "Coming soon",
      description: "Barcode generation will be available in future updates",
    });
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

  const downloadBarcode = () => {
    if (!barcodeUrl) return;
    
    const link = document.createElement("a");
    link.href = barcodeUrl;
    link.download = "barcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success",
      description: "Barcode downloaded successfully",
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
                      <SelectItem value="code128">Code 128</SelectItem>
                      <SelectItem value="ean13">EAN-13</SelectItem>
                      <SelectItem value="ean8">EAN-8</SelectItem>
                      <SelectItem value="upc">UPC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <div className="relative">
                    <Input
                      id="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Enter text or number"
                      className="pr-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={generateBarcode}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {barcodeUrl && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-lg p-4 mx-auto w-fit">
                  <img
                    src={barcodeUrl}
                    alt="Generated Barcode"
                    className="w-64 h-32"
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

export default Barcode;
