
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes, deleteQRCode, QRCode } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const QRCodeList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['qrCodes'],
    queryFn: fetchUserQRCodes
  });

  const handleEdit = (id: string) => {
    navigate(`/generate?edit=${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQRCode(id);
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive"
      });
    }
  };

  const handleDownload = (id: string, name: string, imageUrl: string) => {
    // In a real app with real QR codes, this would use the actual QR code image
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${name.replace(/\s+/g, "_")}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been downloaded successfully"
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-destructive/10 border border-destructive rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">Error Loading QR Codes</h3>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Failed to load QR codes"}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['qrCodes'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">No QR Codes Found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't created any QR codes yet. Get started by creating your first QR code!
          </p>
          <Button onClick={() => navigate("/generate")}>
            Create QR Code
          </Button>
        </div>
      </div>
    );
  }

  // Generate QR code data URLs for display
  const generateQRDataUrl = (content: string) => {
    // This is a placeholder for demonstration purposes
    // In a real app, we would generate a real QR code image
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkAQMAAAAjexcCAAAAA1BMVEX///+nxBvIAAAAGElEQVRIx+3BMQEAAADCIPunXg0PAAAA3wHGvgABT9RYrwAAAABJRU5ErkJggg==";
  };

  return (
    <div className="space-y-4">
      {qrCodes.map((qrCode: QRCode) => (
        <div key={qrCode.id} className="border rounded-lg overflow-hidden bg-white">
          <div className="flex items-start p-4 gap-4">
            <div className="flex-shrink-0">
              <div className="bg-white p-2 border rounded-lg">
                <img
                  src={generateQRDataUrl(qrCode.content)}
                  alt={qrCode.name}
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            
            <div className="flex flex-col flex-grow min-w-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold truncate mr-2">{qrCode.name}</h3>
                <div className="text-sm font-medium text-primary">
                  {qrCode.type === "url" ? "Website" : qrCode.type}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {qrCode.type === "url" && <Link className="h-3.5 w-3.5" />}
                <span className="truncate">{qrCode.content}</span>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>Created on {new Date(qrCode.created_at).toLocaleDateString()}</span>
                {qrCode.folder_id && <span>• In folder: {qrCode.folder_id}</span>}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="bg-muted/50 rounded-full text-xs px-3 py-1">
                  0 Scans
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                  Details <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => handleEdit(qrCode.id)} className="flex-shrink-0">
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDownload(qrCode.id, qrCode.name, generateQRDataUrl(qrCode.content))}
              >
                Download
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive" 
                onClick={() => handleDelete(qrCode.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QRCodeList;
