
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes, deleteQRCode, QRCode } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {qrCodes.map((qrCode: QRCode) => (
        <div 
          key={qrCode.id} 
          className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors rounded-lg overflow-hidden"
        >
          <div className="p-6 flex gap-4">
            {/* QR Code Image */}
            <div className="flex-shrink-0">
              <div className="bg-white p-2 rounded-md border shadow-sm">
                <img
                  src={generateQRDataUrl(qrCode.content)}
                  alt={qrCode.name}
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            
            {/* QR Code Info */}
            <div className="flex flex-col flex-grow min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold truncate">{qrCode.name}</h3>
                  
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    {qrCode.type === "url" && <Link className="h-3.5 w-3.5 flex-shrink-0" />}
                    <span className="truncate">{qrCode.content}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-muted/30 text-xs px-2 py-0 h-5">
                      {qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/30 text-xs px-2 py-0 h-5">
                      0 Scans
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(qrCode.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-3">
                <Button variant="outline" size="sm" onClick={() => handleEdit(qrCode.id)} className="h-8">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={() => handleDownload(qrCode.id, qrCode.name, generateQRDataUrl(qrCode.content))}
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Download
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => handleDelete(qrCode.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QRCodeList;
