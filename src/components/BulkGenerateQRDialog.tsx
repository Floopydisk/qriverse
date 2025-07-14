import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createQRCode } from "@/lib/api";
import { Upload, Download, Plus } from "lucide-react";
import useQrGenerator from "@/hooks/use-qr-generator";

interface BulkGenerateQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface BulkQRItem {
  name: string;
  content: string;
  type: string;
}

export function BulkGenerateQRDialog({ open, onOpenChange, onSuccess }: BulkGenerateQRDialogProps) {
  const [bulkMethod, setBulkMethod] = useState<"csv" | "text">("text");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [qrType, setQrType] = useState("url");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const qrGenerator = useQrGenerator();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "text/csv" || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setCsvFile(file);
      } else {
        toast({
          title: "Invalid File",
          description: "Please select a CSV or Excel file",
          variant: "destructive"
        });
      }
    }
  };

  const parseCsvText = (text: string): BulkQRItem[] => {
    const lines = text.trim().split('\n');
    const items: BulkQRItem[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;
      
      // Handle CSV format (name,content) or simple list
      const parts = trimmedLine.includes(',') 
        ? trimmedLine.split(',').map(p => p.trim())
        : [trimmedLine, trimmedLine];
      
      if (parts.length >= 2) {
        items.push({
          name: parts[0] || `QR Code ${index + 1}`,
          content: parts[1],
          type: qrType
        });
      } else if (parts.length === 1 && parts[0]) {
        items.push({
          name: `QR Code ${index + 1}`,
          content: parts[0],
          type: qrType
        });
      }
    });
    
    return items;
  };

  const parseCsvFile = async (file: File): Promise<BulkQRItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const items = parseCsvText(text);
          resolve(items);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const generateQROptions = (content: string, type: string) => {
    // Generate a QR code to get the data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return {};

    // Use the QR generator to create options
    return {
      dataUrl: '', // Will be generated on the backend
      darkColor: qrGenerator.darkColor,
      lightColor: qrGenerator.lightColor,
      template: qrGenerator.template,
      hasLogo: false,
      useGradient: qrGenerator.useGradient,
      gradientType: qrGenerator.gradientType,
      gradientDirection: qrGenerator.gradientDirection,
      gradientStartColor: qrGenerator.gradientStartColor,
      gradientEndColor: qrGenerator.gradientEndColor,
      backgroundTransparent: qrGenerator.backgroundTransparent,
      foregroundTransparent: qrGenerator.foregroundTransparent,
      backgroundOpacity: qrGenerator.backgroundOpacity,
      foregroundOpacity: qrGenerator.foregroundOpacity
    };
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    
    try {
      let items: BulkQRItem[] = [];
      
      if (bulkMethod === "csv" && csvFile) {
        items = await parseCsvFile(csvFile);
      } else if (bulkMethod === "text" && textInput.trim()) {
        items = parseCsvText(textInput);
      }
      
      if (items.length === 0) {
        toast({
          title: "No Data",
          description: "Please provide valid data to generate QR codes",
          variant: "destructive"
        });
        return;
      }
      
      if (items.length > 100) {
        toast({
          title: "Too Many Items",
          description: "Maximum 100 QR codes can be generated at once",
          variant: "destructive"
        });
        return;
      }
      
      // Generate QR codes in batches
      const batchSize = 10;
      let generated = 0;
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (item) => {
            const options = generateQROptions(item.content, item.type);
            
            await createQRCode({
              name: item.name,
              content: item.content,
              type: item.type,
              options,
              folder_id: null,
              team_id: null,
              scan_count: 0,
              active: true,
              updated_at: new Date().toISOString()
            });
            
            generated++;
          })
        );
        
        // Show progress
        toast({
          title: "Generating...",
          description: `Generated ${generated} of ${items.length} QR codes`,
        });
      }
      
      toast({
        title: "Success",
        description: `Successfully generated ${generated} QR codes`,
      });
      
      onSuccess();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Bulk generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR codes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Content\nExample QR 1,https://example.com\nExample QR 2,https://google.com\nMy Website,https://mywebsite.com";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-bulk-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Generate QR Codes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>QR Code Type</Label>
              <Select value={qrType} onValueChange={setQrType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Input Method</Label>
              <Select value={bulkMethod} onValueChange={(value) => setBulkMethod(value as "csv" | "text")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text/CSV Input</SelectItem>
                  <SelectItem value="csv">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {bulkMethod === "csv" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload CSV/Excel File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with columns: Name, Content
                </p>
              </div>
              
              {csvFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <Upload className="h-4 w-4 inline mr-2" />
                    Selected: {csvFile.name}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Text Input</Label>
              <Textarea
                placeholder={`Enter data line by line:
Example format:
Name 1, Content 1
Name 2, Content 2

Or simple list:
https://example.com
https://google.com
My text content`}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Each line can be "Name, Content" or just content. Maximum 100 entries.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkGenerate} 
              disabled={isGenerating || (bulkMethod === "csv" ? !csvFile : !textInput.trim())}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate QR Codes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}