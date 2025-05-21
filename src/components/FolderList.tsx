
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, Edit } from "lucide-react";
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
      <div className="py-2 px-1 text-sm text-muted-foreground">
        Loading folders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 px-1 text-sm text-destructive">
        Error loading folders
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="py-2 px-1 text-sm text-muted-foreground">
        No folders yet
      </div>
    );
  }

  return (
    <>
      {folders.map((folder: Folder) => (
        <li key={folder.id} className="group/menu-item relative">
          <button 
            onClick={() => handleOpenFolder(folder.id)}
            className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-has-[[data-sidebar=menu-action]]/menu-item:pr-8"
          >
            <FolderOpen className="h-4 w-4" />
            <span>{folder.name}</span>
            
            {/* Edit and Delete buttons positioned absolutely */}
            <div className="absolute right-0 top-0 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(folder.id, folder.name);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive hover:text-destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(folder.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </button>
        </li>
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
    </>
  );
};

export default FolderList;
