
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  ChartPie,
  Copy,
  Download,
  Link2,
  MoreVertical,
  Pencil,
  Trash,
  Play,
  Pause,
  GripVertical,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DynamicQRCode, deleteDynamicQRCode, updateDynamicQRCode, getDynamicQRRedirectUrl } from '@/lib/api';

interface DynamicQRCodeListProps {
  dynamicQRCodes: DynamicQRCode[];
  isLoading: boolean;
  onCreateNew: () => void;
  selectedItems?: string[];
  onSelectionChange?: (selected: string[]) => void;
}

const DynamicQRCodeList = ({ 
  dynamicQRCodes, 
  isLoading, 
  onCreateNew,
  selectedItems = [],
  onSelectionChange 
}: DynamicQRCodeListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [qrToDelete, setQrToDelete] = useState<string | null>(null);
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({});

  console.log('DynamicQRCodeList received data:', { dynamicQRCodes, isLoading });

  const deleteMutation = useMutation({
    mutationFn: deleteDynamicQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamicQRCodes'] });
      toast({
        title: 'Success',
        description: 'Dynamic QR code deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete dynamic QR code',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => 
      updateDynamicQRCode(id, { active }),
    onSuccess: (updatedQrCode) => {
      queryClient.invalidateQueries({ queryKey: ['dynamicQRCodes'] });
      toast({
        title: 'Success',
        description: `Dynamic QR code ${updatedQrCode?.active ? 'activated' : 'paused'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update QR code status',
        variant: 'destructive',
      });
    }
  });

  const handleCopyLink = (shortCode: string) => {
    const redirectUrl = getDynamicQRRedirectUrl(shortCode);
    navigator.clipboard.writeText(redirectUrl);
    toast({
      title: 'Link copied',
      description: 'QR code link copied to clipboard',
    });
  };

  const handleToggleActive = (qrCode: DynamicQRCode) => {
    toggleActiveMutation.mutate({
      id: qrCode.id,
      active: !qrCode.active
    });
  };

  const handleDownloadQR = async (qrCode: DynamicQRCode) => {
    try {
      let dataUrl = qrDataUrls[qrCode.id];
      
      if (!dataUrl) {
        const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
        dataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 800,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        setQrDataUrls(prev => ({
          ...prev,
          [qrCode.id]: dataUrl
        }));
      }
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `dynamic-qr-${qrCode.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'QR Code downloaded',
        description: 'Your dynamic QR code has been downloaded',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };

  const toggleSelection = (id: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedItems.includes(id)
      ? selectedItems.filter(item => item !== id)
      : [...selectedItems, id];
    onSelectionChange(newSelection);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    // TODO: Implement reordering logic for dynamic QR codes
    console.log('Reordering dynamic QR codes:', result);
  };

  if (isLoading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="animate-pulse bg-gray-200 h-8 rounded-t-lg"></CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="animate-pulse bg-gray-200 h-48 w-48 rounded-md"></div>
              <div className="animate-pulse bg-gray-200 h-4 w-full mt-4 rounded"></div>
            </CardContent>
            <CardFooter className="animate-pulse bg-gray-200 h-12 rounded-b-lg"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (dynamicQRCodes.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No dynamic QR codes found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first dynamic QR code to get started
        </p>
        <Button onClick={onCreateNew}>
          Create Dynamic QR Code
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dynamic-qr-codes">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-colors ${
                snapshot.isDraggingOver ? 'bg-primary/5' : ''
              }`}
            >
              {dynamicQRCodes.map((qrCode, index) => {
                const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
                
                return (
                  <Draggable key={qrCode.id} draggableId={qrCode.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`shadow-sm hover:shadow-md transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'shadow-lg rotate-1 scale-105 bg-card border-primary' 
                            : ''
                        } ${
                          selectedItems.includes(qrCode.id) 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : ''
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              {onSelectionChange && (
                                <Checkbox
                                  checked={selectedItems.includes(qrCode.id)}
                                  onCheckedChange={() => toggleSelection(qrCode.id)}
                                  className="h-4 w-4"
                                />
                              )}
                              <CardTitle className="text-lg truncate">{qrCode.name}</CardTitle>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/dynamic-qr/edit/${qrCode.id}`)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(qrCode)}>
                                  {qrCode.active ? (
                                    <>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyLink(qrCode.short_code)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadQR(qrCode)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download QR
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => navigate(`/dynamic-qr/stats/${qrCode.id}`)}
                                  className="text-blue-600"
                                >
                                  <ChartPie className="h-4 w-4 mr-2" />
                                  View Stats
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setQrToDelete(qrCode.id)}
                                  className="text-red-600"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center pt-4">
                          <div 
                            className="bg-white p-2 rounded-md mb-4 w-36 h-36 flex items-center justify-center cursor-pointer"
                            onClick={() => navigate(`/dynamic-qr/stats/${qrCode.id}`)}
                          >
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(redirectUrl)}`}
                              alt={`QR code for ${qrCode.name}`}
                              className="w-full h-full"
                            />
                          </div>
                          <div className="w-full text-center">
                            <p className="text-xs text-muted-foreground mb-1">Target URL:</p>
                            <p className="text-sm truncate font-medium">{qrCode.target_url}</p>
                            <div className="flex items-center justify-center mt-2 gap-1 text-xs">
                              <div className="bg-primary/10 text-primary rounded-full px-2 py-0.5 flex items-center">
                                <ChartPie className="h-3 w-3 mr-1" />
                                {qrCode.scan_count || 0} scans
                              </div>
                              <div className={`rounded-full px-2 py-0.5 flex items-center ${qrCode.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {qrCode.active ? 'Active' : 'Paused'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between gap-2">
                          <Button 
                            variant={qrCode.active ? "destructive" : "default"}
                            size="sm" 
                            className="w-1/2"
                            onClick={() => handleToggleActive(qrCode)}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {qrCode.active ? (
                              <>
                                <Pause className="h-3.5 w-3.5 mr-1.5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1.5" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-1/2"
                            onClick={() => navigate(`/dynamic-qr/stats/${qrCode.id}`)}
                          >
                            <ChartPie className="h-3.5 w-3.5 mr-1.5" />
                            View Stats
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!qrToDelete} onOpenChange={(open) => !open && setQrToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this dynamic QR code and all its scan data.
              The QR code will no longer work when scanned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (qrToDelete) {
                  deleteMutation.mutate(qrToDelete);
                  setQrToDelete(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DynamicQRCodeList;
