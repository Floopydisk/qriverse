
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Download, FolderOpen, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BulkOperationsProps {
  selectedItems: string[];
  onSelectAll: (selected: boolean) => void;
  onDeleteSelected: () => void;
  onMoveSelected: () => void;
  onDownloadSelected: () => void;
  totalItems: number;
  isAllSelected: boolean;
}

const BulkOperations = ({
  selectedItems,
  onSelectAll,
  onDeleteSelected,
  onMoveSelected,
  onDownloadSelected,
  totalItems,
  isAllSelected
}: BulkOperationsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to delete",
        variant: "destructive"
      });
      return;
    }
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDeleteSelected();
    setShowDeleteDialog(false);
  };

  if (totalItems === 0) return null;

  return (
    <>
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="h-4 w-4"
            />
            <span className="text-sm text-muted-foreground">
              {selectedItems.length > 0 
                ? `${selectedItems.length} of ${totalItems} selected`
                : `Select all ${totalItems} items`
              }
            </span>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadSelected}
                className="h-8"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download ({selectedItems.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onMoveSelected}
                className="h-8"
              >
                <FolderOpen className="h-3.5 w-3.5 mr-1" />
                Move ({selectedItems.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete ({selectedItems.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QR Codes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} QR code{selectedItems.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperations;
