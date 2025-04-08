
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

// Mock data - in a real app, this would come from your backend
const mockFolders = [
  {
    id: "1",
    name: "Personal",
    createdAt: "2025-04-01T10:00:00Z",
    count: 5
  },
  {
    id: "2",
    name: "Work",
    createdAt: "2025-04-02T14:30:00Z",
    count: 12
  },
  {
    id: "3",
    name: "Website",
    createdAt: "2025-04-03T09:15:00Z",
    count: 3
  }
];

const FolderList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [folders, setFolders] = useState(mockFolders);
  const [editFolder, setEditFolder] = useState<{id: string, name: string} | null>(null);

  const handleOpenFolder = (id: string) => {
    navigate(`/dashboard/folder/${id}`);
    // In a real app, this would navigate to the folder view
    toast({
      title: "Folder Opened",
      description: "Loading folder contents..."
    });
  };

  const handleDelete = (id: string) => {
    setFolders(folders.filter(folder => folder.id !== id));
    toast({
      title: "Folder Deleted",
      description: "The folder has been deleted successfully"
    });
  };

  const handleEdit = (id: string, name: string) => {
    setEditFolder({ id, name });
  };

  const handleSaveEdit = () => {
    if (!editFolder) return;
    
    setFolders(folders.map(folder => 
      folder.id === editFolder.id ? { ...folder, name: editFolder.name } : folder
    ));
    
    toast({
      title: "Folder Updated",
      description: "The folder has been renamed successfully"
    });
    
    setEditFolder(null);
  };

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {folders.map((folder) => (
        <Card key={folder.id} className="overflow-hidden hover:border-primary/50 transition-colors">
          <div 
            className="bg-muted/30 p-6 flex items-center justify-center cursor-pointer"
            onClick={() => handleOpenFolder(folder.id)}
          >
            <FolderOpen className="h-24 w-24 text-primary/60" />
          </div>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold truncate">{folder.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <QrCode className="h-3.5 w-3.5" />
              <span>{folder.count} QR {folder.count === 1 ? 'code' : 'codes'}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Created on {new Date(folder.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="ghost" size="sm" onClick={() => handleOpenFolder(folder.id)}>
              <FolderOpen className="h-4 w-4 mr-1" /> Open
            </Button>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(folder.id, folder.name)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(folder.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
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
