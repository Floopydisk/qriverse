import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Link, ExternalLink, QrCode, Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUserQRCodes, deleteQRCode, QRCode as QRCodeType, fetchQRCodesInFolder } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { downloadQRCode } from "@/lib/supabaseUtils";
import MoveQRCodeDialog from "@/components/MoveQRCodeDialog";
import BulkOperations from "./BulkOperations";
import AdvancedSearch from "./AdvancedSearch";

import DragDropQRList from "./DragDropQRList";


interface QRCodeListProps {
  folderId?: string;
  filterType?: string;
  searchQuery?: string;
}

interface SearchFilters {
  query: string;
  type: string;
  dateRange: { from?: Date; to?: Date };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
}

const QRCodeList = ({ folderId, filterType = "all", searchQuery = "" }: QRCodeListProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrImageUrls, setQrImageUrls] = useState<Record<string, string>>({});
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<{id: string, folderId: string | null} | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Advanced search filters
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchQuery,
    type: filterType,
    dateRange: {},
    sortBy: 'created_at',
    sortOrder: 'desc',
    
  });
  
  const { data: qrCodes = [], isLoading, error } = useQuery({
    queryKey: ['qrCodes', folderId],
    queryFn: () => folderId ? fetchQRCodesInFolder(folderId) : fetchUserQRCodes()
  });

  // Update filters when props change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      query: searchQuery,
      type: filterType
    }));
  }, [searchQuery, filterType]);

  // Apply filters and sorting
  const filteredQRCodes = useMemo(() => {
    let filtered = [...qrCodes];

    // Apply search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(qr => 
        qr.name.toLowerCase().includes(query) || 
        qr.content.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filters.type && filters.type !== "all") {
      if (filters.type === "barcode") {
        filtered = filtered.filter(qr => qr.type === "barcode");
      } else if (filters.type === "static") {
        filtered = filtered.filter(qr => qr.type !== "dynamic" && qr.type !== "barcode");
      } else if (filters.type === "dynamic") {
        filtered = filtered.filter(qr => qr.type === "dynamic");
      } else if (filters.type === "dynamic-active") {
        filtered = filtered.filter(qr => qr.type === "dynamic" && qr.active !== false);
      } else if (filters.type === "dynamic-paused") {
        filtered = filtered.filter(qr => qr.type === "dynamic" && qr.active === false);
      } else {
        filtered = filtered.filter(qr => qr.type === filters.type);
      }
    }


    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(qr => {
        const qrDate = new Date(qr.created_at);
        if (filters.dateRange.from && qrDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && qrDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof QRCodeType];
      let bValue: any = b[filters.sortBy as keyof QRCodeType];

      if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [qrCodes, filters]);


  useEffect(() => {
    const fetchQrImages = async () => {
      const urls: Record<string, string> = {};
      
      for (const qrCode of qrCodes) {
        if (qrCode.options && typeof qrCode.options === 'object') {
          const options = qrCode.options as Record<string, any>;
          
          // Try to get image from storage first
          if (options.storagePath) {
            try {
              const { data, error } = await supabase.storage
                .from('qrcodes')
                .download(options.storagePath);
              
              if (data && !error) {
                const url = URL.createObjectURL(data);
                urls[qrCode.id] = url;
                continue; // Skip to next QR code if storage image found
              }
            } catch (err) {
              console.error(`Error fetching QR code image from storage for ${qrCode.id}:`, err);
            }
          }
          
          // Fallback to dataUrl if storage image not available
          if (options.dataUrl) {
            urls[qrCode.id] = options.dataUrl;
          }
        }
      }
      
      setQrImageUrls(urls);
    };
    
    if (qrCodes.length > 0) {
      fetchQrImages();
    }
    
    return () => {
      // Only revoke blob URLs, not data URLs
      Object.values(qrImageUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
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
        if (qrImageUrls[id].startsWith('blob:')) {
          URL.revokeObjectURL(qrImageUrls[id]);
        }
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


  // Bulk operations handlers
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedItems(filteredQRCodes.map(qr => qr.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => handleDelete(id)));
      setSelectedItems([]);
      toast({
        title: "QR Codes Deleted",
        description: `${selectedItems.length} QR codes deleted successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some QR codes",
        variant: "destructive"
      });
    }
  };

  const handleDownloadSelected = async () => {
    try {
      await Promise.all(selectedItems.map(id => {
        const qrCode = qrCodes.find(qr => qr.id === id);
        if (qrCode) {
          return handleDownload(id, qrCode.name);
        }
      }));
      toast({
        title: "QR Codes Downloaded",
        description: `${selectedItems.length} QR codes downloaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download some QR codes",
        variant: "destructive"
      });
    }
  };

  const handleMoveSelected = () => {
    // This would open a bulk move dialog
    toast({
      title: "Feature Coming Soon",
      description: "Bulk move functionality will be available soon"
    });
  };

  const handleReorder = (reorderedItems: any[]) => {
    // Handle reordering logic here
    console.log("Reordered items:", reorderedItems);
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

  return (
    <>
      <div className="space-y-6">
        <AdvancedSearch
          filters={filters}
          onFiltersChange={setFilters}
          totalResults={filteredQRCodes.length}
        />

        <BulkOperations
          selectedItems={selectedItems}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onMoveSelected={handleMoveSelected}
          onDownloadSelected={handleDownloadSelected}
          totalItems={filteredQRCodes.length}
          isAllSelected={selectedItems.length === filteredQRCodes.length && filteredQRCodes.length > 0}
        />

        <DragDropQRList
          qrCodes={filteredQRCodes.map(qr => ({
            ...qr,
            imageUrl: qrImageUrls[qr.id]
          }))}
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onMove={(id) => handleMoveQRCode(id, null)}
        />
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
