
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link, ExternalLink, QrCode, Folder, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes, fetchQRCodesInFolder, deleteQRCode, QRCode as QRCodeType } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { downloadQRCode } from "@/lib/supabaseUtils";
import MoveQRCodeDialog from "@/components/MoveQRCodeDialog";

interface QRCodeListProps {
  folderId?: string;
}

const QRCodeList = ({ folderId }: QRCodeListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrImageUrls, setQrImageUrls] = useState<Record<string, string>>({});
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{id: string, folderId: string | null} | null>(null);
  
  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['qrCodes', folderId],
    queryFn: () => folderId ? fetchQRCodesInFolder(folderId) : fetchUserQRCodes()
  });

  useEffect(() => {
    const fetchQrImages = async () => {
      const urls: Record<string, string> = {};
      
      for (const qrCode of qrCodes) {
        if (qrCode.options && typeof qrCode.options === 'object' && 'storagePath' in qrCode.options) {
          try {
            const { data, error } = await supabase.storage
              .from('qrcodes')
              .download(qrCode.options.storagePath as string);
            
            if (data && !error) {
              const url = URL.createObjectURL(data);
              urls[qrCode.id] = url;
            }
          } catch (err) {
            console.error(`Error fetching QR code image for ${qrCode.id}:`, err);
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
      
      if (qrCode?.options && typeof qrCode.options === 'object' && 'storagePath' in qrCode.options) {
        await supabase.storage
          .from('qrcodes')
          .remove([qrCode.options.storagePath as string]);
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

    // Use the QR code name for the filename
    const sanitizedName = name.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedName}.png`;

    if (qrCode.options && 
        typeof qrCode.options === 'object' && 
        'storagePath' in qrCode.options) {
      
      const storagePath = qrCode.options.storagePath as string;
      
      try {
        const success = await downloadQRCode(storagePath, fileName);
        
        if (success) {
          toast({
            title: "QR Code Downloaded",
            description: "Your QR code has been downloaded successfully"
          });
        } else {
          downloadFromUrlObject(id, name);
        }
      } catch (error) {
        console.error("Error downloading from storage:", error);
        downloadFromUrlObject(id, name);
      }
    } else {
      downloadFromUrlObject(id, name);
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
    
    // Use the QR code name for the filename
    const sanitizedName = name.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedName}.png`;
    
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = fileName;
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
  
  const handleBackToFolders = () => {
    navigate('/dashboard');
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
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['qrCodes', folderId] })}>
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
            {folderId 
              ? "This folder is empty. Add QR codes to this folder by creating new ones or moving existing ones here."
              : "You haven't created any QR codes yet. Get started by creating your first QR code!"
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/generate")}>
              Create QR Code
            </Button>
            {folderId && (
              <Button variant="outline" onClick={handleBackToFolders}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {folderId && (
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={handleBackToFolders} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {qrCodes.map((qrCode: QRCodeType) => (
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
                      <Badge variant="outline" className="bg-muted/30 text-xs px-2 py-0 h-5">
                        0 Scans
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
    </>
  );
};

export default QRCodeList;
