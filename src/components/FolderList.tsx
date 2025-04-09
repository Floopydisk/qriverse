
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, Edit, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchUserFolders, deleteFolder, updateFolder, createFolder, Folder } from "@/lib/api";

const FolderList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editFolder, setEditFolder] = useState<{id: string, name: string} | null>(null);
  
  const { data: folders = [], isLoading, error } = useQuery({
    queryKey: ['folders'],
    queryFn: fetchUserFolders
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Folder Deleted",
        description: "The folder has been deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({id, name}: {id: string, name: string}) => updateFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Folder Updated",
        description: "The folder has been renamed successfully"
      });
      setEditFolder(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive"
      });
    }
  });

  const handleOpenFolder = (id: string) => {
    navigate(`/dashboard/folder/${id}`);
    toast({
      title: "Folder Opened",
      description: "Loading folder contents..."
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string, name: string) => {
    setEditFolder({ id, name });
  };

  const handleSaveEdit = () => {
    if (!editFolder) return;
    updateMutation.mutate({ id: editFolder.id, name: editFolder.name });
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
          <h3 className="text-xl font-medium mb-2">Error Loading Folders</h3>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Failed to load folders"}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['folders'] })}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md mx-auto">
          <h3 className="text-xl font-medium mb-2">No Folders Found</h3>
          <p className="text-muted-foreground mb-6">
            Create folders to organize your QR codes efficiently
          </p>
          <Button>
            Create Folder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {folders.map((folder: Folder) => (
        <div 
          key={folder.id} 
          className="border rounded-lg p-4 bg-white hover:border-primary/50 transition-colors flex items-center gap-4 cursor-pointer"
          onClick={() => handleOpenFolder(folder.id)}
        >
          <div className="bg-muted/30 p-2 rounded-lg">
            <FolderOpen className="h-6 w-6 text-primary/60" />
          </div>
          
          <div className="flex-grow min-w-0">
            <h3 className="text-lg font-medium truncate">{folder.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <QrCode className="h-3.5 w-3.5" />
              <span>0 QR codes</span>
            </div>
          </div>
          
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(folder.id, folder.name)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(folder.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      {/* Edit Folder Dialog */}
      <Dialog open={!!editFolder} onOpenChange={(open) => !open && setEditFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Folder name"
              value={editFolder?.name || ""}
              onChange={(e) => setEditFolder(prev => prev ? {...prev, name: e.target.value} : null)}
            />
            <Button className="w-full" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FolderList;
