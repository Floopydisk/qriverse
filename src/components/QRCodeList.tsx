
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link, ExternalLink, QrCode, Folder, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes, deleteQRCode, QRCode as QRCodeType, fetchQRCodeScanStats } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { downloadQRCode } from "@/lib/supabaseUtils";
import MoveQRCodeDialog from "@/components/MoveQRCodeDialog";
import QRCodeScanDialog from "./QRCodeScanDialog";

interface QRCodeListProps {
  folderId?: string;
  filterType?: string;
  searchQuery?: string;
}

const QRCodeList = ({ folderId, filterType = "all", searchQuery = "" }: QRCodeListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrImageUrls, setQrImageUrls] = useState<Record<string, string>>({});
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{id: string, folderId: string | null} | null>(null);
  const [selectedQRCodeForStats, setSelectedQRCodeForStats] = useState<QRCodeType | null>(null);
  
  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['qrCodes', folderId],
    queryFn: () => folderId ? fetchQRCodesInFolder(folderId) : fetchUserQRCodes()
  });

  useEffect(() => {
    const fetchQrImages = async () => {
      const urls: Record<string, string> = {};
      
      for (const qrCode of qrCodes) {
        if (qrCode.options && typeof qrCode.options === 'object') {
          const options = qrCode.options as Record<string, any>;
          
          if (options.storagePath) {
            try {
              const { data, error } = await supabase.storage
                .from('qrcodes')
                .download(options.storagePath);
              
              if (data && !error) {
                const url = URL.createObjectURL(data);
                urls[qrCode.id] = url;
              }
            } catch (err) {
              console.error(`Error fetching QR code image for ${qrCode.id}:`, err);
            }
          }
        }
      }
      
      setQrImageUrls(urls);
    };
    
    if (qrCodes.length > 0) {
      fetchQrImages();
    }
    
    return () => {
      Object.values(qrImageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [qrCodes]);

  const handleEdit = (id: string) => {
    navigate(`/generate?edit=${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      const qrCode = qrCodes.find(qr => qr.id === id);
      
      if (qrCode?.options && typeof qrCode.options === 'object') {
        const options = qrCode.options as Record<string, any>;
        
        if (options.storagePath) {
          await supabase.storage
            .from('qrcodes')
            .remove([options.storagePath]);
        }
      }
      
      await deleteQRCode(id);
      
      if (qrImageUrls[id]) {
        URL.revokeObjectURL(qrImageUrls[id]);
        const newUrls = { ...qrImageUrls };
        delete newUrls[id];
        setQrImageUrls(newUrls);
      }
      
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

  const handleDownload = async (id: string, name: string) => {
    const qrCode = qrCodes.find(qr => qr.id === id);
    
    if (!qrCode) {
      toast({
        title: "Error",
        description: "QR code not found",
        variant: "destructive"
      });
      return;
    }

    // Clean up name for file - remove special characters and spaces
    const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, "_");

    if (qrCode.options && typeof qrCode.options === 'object') {
      const options = qrCode.options as Record<string, any>;
      
      if (options.storagePath) {
        const storagePath = options.storagePath;
        const fileName = `${cleanName}.png`;
        
        try {
          const success = await downloadQRCode(storagePath, fileName);
          
          if (success) {
            toast({
              title: "QR Code Downloaded",
              description: "Your QR code has been downloaded successfully"
            });
          } else {
            downloadFromUrlObject(id, cleanName);
          }
        } catch (error) {
          console.error("Error downloading from storage:", error);
          downloadFromUrlObject(id, cleanName);
        }
      } else {
        downloadFromUrlObject(id, cleanName);
      }
    } else {
      downloadFromUrlObject(id, cleanName);
    }
  };
  
  const downloadFromUrlObject = (id: string, name: string) => {
    const imageUrl = qrImageUrls[id];
    
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "QR code image not available",
        variant: "destructive"
      });
      return;
    }
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been downloaded successfully"
    });
  };

  const handleMoveQRCode = (id: string, folderId: string | null) => {
    setSelectedQRCode({ id, folderId });
    setMoveDialogOpen(true);
  };

  const handleShowScanStats = (qrCode: QRCodeType) => {
    setSelectedQRCodeForStats(qrCode);
    setScanDialogOpen(true);
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

  // Apply filtering based on filterType
  let filteredQRCodes = [...qrCodes];
  
  // First filter by folder if specified
  if (folderId) {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.folder_id === folderId);
  }
  
  // Then apply type filtering
  if (filterType === "barcode") {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.type === "barcode");
  } else if (filterType === "static") {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.type !== "dynamic" && qr.type !== "barcode");
  } else if (filterType === "dynamic") {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.type === "dynamic");
  } else if (filterType === "dynamic-active") {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.type === "dynamic" && qr.active !== false);
  } else if (filterType === "dynamic-paused") {
    filteredQRCodes = filteredQRCodes.filter(qr => qr.type === "dynamic" && qr.active === false);
  }
  
  // Apply search filtering if a search query exists
  if (searchQuery && searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase().trim();
    filteredQRCodes = filteredQRCodes.filter(qr => 
      qr.name.toLowerCase().includes(query) || 
      qr.content.toLowerCase().includes(query)
    );
  }

  if (filteredQRCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">No QR Codes Found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "No results matched your search." 
              : folderId 
                ? "This folder is empty." 
                : "You haven't created any QR codes yet."
            }
          </p>
          <Button onClick={() => navigate("/generate")}>
            Create QR Code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQRCodes.map((qrCode: QRCodeType) => (
          <div 
            key={qrCode.id} 
            className="bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors rounded-lg overflow-hidden"
          >
            <div className="p-6 flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <div className="bg-white p-2 rounded-md border shadow-sm">
                  {qrImageUrls[qrCode.id] ? (
                    <img
                      src={qrImageUrls[qrCode.id]}
                      alt={qrCode.name}
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-muted/30">
                      <QrCode className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col flex-grow min-w-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="w-full">
                    <h3 className="text-lg font-semibold truncate">{qrCode.name}</h3>
                    
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      {qrCode.type === "url" && <Link className="h-3.5 w-3.5 flex-shrink-0" />}
                      <span className="truncate">{qrCode.content}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="bg-muted/30 text-xs px-2 py-0 h-5">
                        {qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                      </Badge>
                      <Badge 
                        variant={qrCode.scan_count && qrCode.scan_count > 0 ? "secondary" : "outline"} 
                        className={`${qrCode.scan_count && qrCode.scan_count > 0 ? 'bg-secondary/80' : 'bg-muted/30'} text-xs px-2 py-0 h-5 cursor-pointer`}
                        onClick={() => handleShowScanStats(qrCode)}
                      >
                        {qrCode.scan_count || 0} Scans
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(qrCode.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-auto pt-3 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(qrCode.id)} className="h-8">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                    onClick={() => handleDownload(qrCode.id, qrCode.name)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleMoveQRCode(qrCode.id, qrCode.folder_id)}
                  >
                    <Folder className="h-3.5 w-3.5 mr-1" /> Move
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleShowScanStats(qrCode)}
                  >
                    <BarChart2 className="h-3.5 w-3.5 mr-1" /> Stats
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

      {selectedQRCode && (
        <MoveQRCodeDialog
          isOpen={moveDialogOpen}
          onClose={() => setMoveDialogOpen(false)}
          qrCodeId={selectedQRCode.id}
          currentFolderId={selectedQRCode.folderId}
        />
      )}

      {selectedQRCodeForStats && (
        <QRCodeScanDialog
          isOpen={scanDialogOpen}
          onClose={() => setScanDialogOpen(false)}
          qrCode={selectedQRCodeForStats}
        />
      )}
    </>
  );
};

export default QRCodeList;
