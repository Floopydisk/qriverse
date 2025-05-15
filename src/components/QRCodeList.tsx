import { fetchUserQRCodes, fetchQRCodeScans } from "@/lib/api";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCode } from "../lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash, Download, Eye, Folder, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { downloadQRCode } from "@/lib/supabaseUtils";
import MoveQRCodeDialog from "./MoveQRCodeDialog";
import { useQueryClient } from "@tanstack/react-query";

const QRCodeCard = ({ 
  qrCode, 
  onView, 
  onDownload, 
  onDelete, 
  onMove 
}: { 
  qrCode: QRCode;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onMove: () => void;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState<number>(0);
  
  useEffect(() => {
    // Get QR code image from storage
    const fetchQRImage = async () => {
      if (qrCode.options?.storagePath) {
        const { data } = supabase
          .storage
          .from('qrcodes')
          .getPublicUrl(qrCode.options.storagePath as string);
        
        setImageUrl(data.publicUrl);
      }
    };
    
    // Get scan counts for this QR code
    const fetchScanCount = async () => {
      const count = await fetchQRCodeScans(qrCode.id);
      setScanCount(count);
    };
    
    fetchQRImage();
    fetchScanCount();
  }, [qrCode]);
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-3">
        <div className="aspect-square relative bg-background/50 rounded-md flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={qrCode.name}
              className="w-full h-full object-contain p-2"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-1 text-sm">No preview available</p>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-medium text-base truncate">{qrCode.name}</h3>
          <p className="text-muted-foreground text-xs truncate">
            {new Date(qrCode.created_at).toLocaleDateString()}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">{scanCount}</span> 
              <span className="text-muted-foreground ml-1">scans</span>
            </div>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="Open menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMove}>
                    <Folder className="mr-2 h-4 w-4" />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QRCodeList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  useEffect(() => {
    const fetchQRCodes = async () => {
      if (!user) return;

      try {
        const codes = await fetchUserQRCodes();
        setQRCodes(codes);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast({
          title: "Error",
          description: "Failed to load QR codes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQRCodes();
  }, [user, toast]);

  const handleView = (qrCode: QRCode) => {
    // Implement view functionality
    console.log("View QR code:", qrCode);
  };

  const handleDownload = async (qrCode: QRCode) => {
    if (qrCode.options?.storagePath) {
      const fileName = `${qrCode.name || 'qrcode'}.png`;
      const success = await downloadQRCode(
        qrCode.options.storagePath as string,
        fileName
      );

      if (success) {
        toast({
          title: "Success",
          description: "QR code downloaded successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to download QR code.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (qrCode: QRCode) => {
    // Implement delete functionality
    console.log("Delete QR code:", qrCode);
  };

  const handleMove = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode);
    setShowMoveDialog(true);
  };

  const handleMoveComplete = () => {
    setShowMoveDialog(false);
    setSelectedQRCode(null);
    // Refresh QR codes list
    queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="aspect-square bg-muted animate-pulse rounded-md"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No QR codes found</h3>
        <p className="text-muted-foreground mt-1">
          Create your first QR code to get started
        </p>
        <Button
          onClick={() => navigate("/generate")}
          className="mt-4"
        >
          Create QR Code
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {qrCodes.map((qrCode) => (
          <QRCodeCard
            key={qrCode.id}
            qrCode={qrCode}
            onView={() => handleView(qrCode)}
            onDownload={() => handleDownload(qrCode)}
            onDelete={() => handleDelete(qrCode)}
            onMove={() => handleMove(qrCode)}
          />
        ))}
      </div>

      {selectedQRCode && (
        <MoveQRCodeDialog
          open={showMoveDialog}
          onOpenChange={setShowMoveDialog}
          qrCode={selectedQRCode}
          onComplete={handleMoveComplete}
        />
      )}
    </>
  );
};

export default QRCodeList;
