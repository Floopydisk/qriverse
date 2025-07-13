import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { bulkCreateDynamicQRCodes } from "@/lib/api";

interface BulkGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkGenerateDialog = ({ open, onOpenChange }: BulkGenerateDialogProps) => {
  const [csvData, setCsvData] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bulkCreateMutation = useMutation({
    mutationFn: bulkCreateDynamicQRCodes,
    onSuccess: (createdQRCodes) => {
      queryClient.invalidateQueries({ queryKey: ['dynamicQRCodes'] });
      toast({
        title: "Success",
        description: `${createdQRCodes.length} dynamic QR codes created successfully`,
      });
      onOpenChange(false);
      setCsvData("");
      setFileInputKey(prev => prev + 1);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create QR codes",
        variant: "destructive",
      });
    },
  });

  const parseCSVData = (data: string) => {
    const lines = data.trim().split('\n');
    const items: Array<{ name: string; target_url: string }> = [];

    for (const line of lines) {
      if (line.trim()) {
        const [name, url] = line.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
        if (name && url) {
          items.push({ name, target_url: url });
        }
      }
    }

    return items;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV data or upload a file",
        variant: "destructive",
      });
      return;
    }

    const items = parseCSVData(csvData);
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "No valid data found. Please check the format.",
        variant: "destructive",
      });
      return;
    }

    bulkCreateMutation.mutate(items);
  };

  const downloadTemplate = () => {
    const template = "Name,URL\nExample QR 1,https://example.com\nExample QR 2,https://google.com";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left">Bulk Generate QR Codes</DialogTitle>
          <DialogDescription className="text-left">
            Create multiple dynamic QR codes at once using CSV data or comma-separated values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <div className="flex-1">
              <Label htmlFor="file-upload" className="sr-only">
                Upload CSV file
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV File
              </Button>
              <input
                key={fileInputKey}
                id="file-upload"
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-data">CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="Name,URL&#10;Example QR 1,https://example.com&#10;Example QR 2,https://google.com"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Each line should contain: Name,URL</li>
                  <li>Use commas to separate values</li>
                  <li>URLs must be valid and include http:// or https://</li>
                  <li>Names should be unique for better organization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={bulkCreateMutation.isPending}
          >
            {bulkCreateMutation.isPending ? "Creating..." : "Create QR Codes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkGenerateDialog;