
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserFolders, updateQRCode, Folder } from "@/lib/api";
import { Folder as FolderIcon, X, Plus, FolderOpen, Check, Loader2 } from "lucide-react";

interface MoveQRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeId: string;
  currentFolderId: string | null;
}

const MoveQRCodeDialog = ({ isOpen, onClose, qrCodeId, currentFolderId }: MoveQRCodeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);

  // Reset selected folder when dialog opens with new QR code
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId);
    }
  }, [isOpen, currentFolderId]);

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchUserFolders,
    enabled: isOpen,
  });

  const moveQRCodeMutation = useMutation({
    mutationFn: async () => {
      return await updateQRCode(qrCodeId, { folder_id: selectedFolderId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrCodes'] });
      toast({
        title: "QR Code moved",
        description: selectedFolderId 
          ? `QR Code moved to folder successfully` 
          : "QR Code removed from folder",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move QR Code",
        variant: "destructive",
      });
    },
  });

  const handleMoveQRCode = () => {
    moveQRCodeMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move QR Code</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Button 
              variant={selectedFolderId === null ? "default" : "outline"}
              className="w-full justify-start mb-2"
              onClick={() => setSelectedFolderId(null)}
            >
              {selectedFolderId === null ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Remove from folder
            </Button>
          </div>

          <h3 className="text-sm font-medium mb-2">Select folder:</h3>
          
          {foldersLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground text-sm">
              No folders created yet
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-2">
                {folders.map((folder: Folder) => (
                  <Button
                    key={folder.id}
                    variant={selectedFolderId === folder.id ? "default" : "outline"}
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    {selectedFolderId === folder.id ? (
                      <FolderOpen className="h-4 w-4 mr-2" />
                    ) : (
                      <FolderIcon className="h-4 w-4 mr-2" />
                    )}
                    {folder.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveQRCode}
              disabled={moveQRCodeMutation.isPending}
            >
              {moveQRCodeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Move
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoveQRCodeDialog;
