
import { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  GripVertical, 
  QrCode, 
  Download, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Link,
  Folder
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QRCodeItem {
  id: string;
  name: string;
  type: string;
  content: string;
  scan_count: number;
  created_at: string;
  imageUrl?: string;
}

interface DragDropQRListProps {
  qrCodes: QRCodeItem[];
  selectedItems: string[];
  onSelectionChange: (selected: string[]) => void;
  onReorder: (items: QRCodeItem[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, name: string) => void;
  onMove: (id: string) => void;
}

const DragDropQRList = ({
  qrCodes,
  selectedItems,
  onSelectionChange,
  onReorder,
  onEdit,
  onDelete,
  onDownload,
  onMove
}: DragDropQRListProps) => {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    setDraggedOver(null);
    
    if (!result.destination) {
      return;
    }

    const items = Array.from(qrCodes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  const handleDragStart = () => {
    // Optional: Add haptic feedback or visual cues
  };

  const handleDragUpdate = (update: any) => {
    if (update.destination) {
      setDraggedOver(update.destination.droppableId);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    onSelectionChange(newSelection);
  };

  if (qrCodes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 max-w-md mx-auto">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No QR Codes Found</h3>
          <p className="text-muted-foreground mb-6">Create your first QR code to get started</p>
          <Button onClick={() => window.location.href = "/generate"}>
            Create QR Code
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragUpdate={handleDragUpdate}
    >
      <Droppable droppableId="qr-codes">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {qrCodes.map((qrCode, index) => (
              <Draggable key={qrCode.id} draggableId={qrCode.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-all duration-200 ${
                      snapshot.isDragging 
                        ? 'shadow-lg rotate-1 scale-105 bg-card border-primary' 
                        : 'hover:shadow-md'
                    } ${
                      selectedItems.includes(qrCode.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'bg-card/50 backdrop-blur-sm'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Selection Checkbox */}
                        <Checkbox
                          checked={selectedItems.includes(qrCode.id)}
                          onCheckedChange={() => toggleSelection(qrCode.id)}
                          className="h-4 w-4"
                        />

                        {/* QR Code Image */}
                        <div className="flex-shrink-0">
                          <div className="bg-white p-2 rounded border shadow-sm">
                            {qrCode.imageUrl ? (
                              <img
                                src={qrCode.imageUrl}
                                alt={qrCode.name}
                                className="w-16 h-16 object-contain"
                              />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-muted/30">
                                <QrCode className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium truncate">{qrCode.name}</h3>
                              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <Link className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{qrCode.content}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {qrCode.type.charAt(0).toUpperCase() + qrCode.type.slice(1)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {qrCode.scan_count} scans
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(qrCode.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(qrCode.id)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDownload(qrCode.id, qrCode.name)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onMove(qrCode.id)}>
                                <Folder className="h-3.5 w-3.5 mr-2" />
                                Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDelete(qrCode.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragDropQRList;
