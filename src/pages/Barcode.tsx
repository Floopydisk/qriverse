import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DashboardSidebar from "@/components/DashboardSidebar";
import FloatingCircles from "@/components/FloatingCircles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Download, Save, Trash2, Edit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Barcode from "react-barcode";
import { fetchUserBarcodes, createBarcode, deleteBarcode, BarcodeData, updateBarcode } from "@/lib/api";

const BarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [name, setName] = useState("My Barcode");
  const [type, setType] = useState("CODE128");
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("barcode");
  const navigate = useNavigate();
  
  // State for saved barcodes
  const [savedBarcodes, setSavedBarcodes] = useState<BarcodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSavedBarcodes();
  }, []);

  // Function to fetch saved barcodes
  const fetchSavedBarcodes = async () => {
    setIsLoading(true);
    
    try {
      const barcodes = await fetchUserBarcodes();
      setSavedBarcodes(barcodes);
    } catch (error) {
      console.error("Error fetching barcodes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your saved barcodes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save barcode
  const saveBarcode = async () => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter text for the barcode",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await createBarcode({
        name: name,
        value: text,
        type: type
      });
      
      if (result) {
        toast({
          title: "Success",
          description: "Barcode saved successfully",
        });
        
        // Refresh the list of saved barcodes
        fetchSavedBarcodes();
      }
    } catch (error) {
      console.error("Error saving barcode:", error);
      toast({
        title: "Error",
        description: "Failed to save barcode",
        variant: "destructive",
      });
    }
  };

  // Function to delete a saved barcode
  const handleDeleteBarcode = async (id: string) => {
    try {
      const success = await deleteBarcode(id);
      
      if (success) {
        toast({
          title: "Success",
          description: "Barcode deleted successfully",
        });
        
        // Update the local state to remove the deleted barcode
        setSavedBarcodes(savedBarcodes.filter(barcode => barcode.id !== id));
      }
    } catch (error) {
      console.error("Error deleting barcode:", error);
      toast({
        title: "Error",
        description: "Failed to delete barcode",
        variant: "destructive",
      });
    }
  };

  // Function to load a saved barcode
  const loadBarcode = (barcode: BarcodeData) => {
    setName(barcode.name);
    setText(barcode.value);
    setType(barcode.type);
    
    toast({
      title: "Barcode Loaded",
      description: `${barcode.name} loaded successfully`,
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
      downloadLink.download = `${name || "barcode"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast({
        title: "Success",
        description: "Barcode downloaded successfully",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter barcodes based on search query
  const filteredBarcodes = searchQuery
    ? savedBarcodes.filter(barcode => 
        barcode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barcode.value.toLowerCase().includes(searchQuery.toLowerCase()))
    : savedBarcodes;

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FloatingCircles />
      <Header />
      
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border h-screen fixed top-0 left-0 transition-all duration-200 z-10`}>
          <DashboardSidebar 
            selectedView={selectedView}
            setSelectedView={setSelectedView}
            setShowFolderDialog={() => {}}
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} pb-24`}>
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-2xl mx-auto mt-24">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-8">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-foreground text-center">
                    Generate <span className="text-primary">Barcode</span>
                  </h1>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Barcode Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter barcode name"
                      />
                    </div>

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

                    <div className="flex flex-wrap justify-center gap-4">
                      <Button
                        variant="outline"
                        onClick={copyText}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Text
                      </Button>
                      <Button
                        variant="outline"
                        onClick={downloadBarcode}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        onClick={saveBarcode}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Barcode
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Saved Barcodes Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Your Saved Barcodes</h2>
                  
                  {isLoading ? (
                    <div className="text-center py-4">Loading saved barcodes...</div>
                  ) : filteredBarcodes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {searchQuery ? "No barcodes match your search" : "You haven't saved any barcodes yet"}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBarcodes.map((barcode) => (
                        <div 
                          key={barcode.id} 
                          className="bg-card border border-border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1 overflow-hidden">
                            <h3 className="font-medium truncate">{barcode.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{barcode.value}</p>
                            <p className="text-xs text-muted-foreground">Type: {barcode.type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => loadBarcode(barcode)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteBarcode(barcode.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default BarcodeGenerator;
