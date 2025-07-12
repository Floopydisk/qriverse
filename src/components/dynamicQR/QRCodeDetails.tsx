
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import QRCode from 'qrcode';
import { Pencil, Link2, Play, Pause } from 'lucide-react';
import React from 'react';
import { DynamicQRCode, getDynamicQRRedirectUrl, updateDynamicQRCode } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDetailsProps {
  qrCode: DynamicQRCode;
  onEdit: () => void;
}

const QRCodeDetails = ({ qrCode, onEdit }: QRCodeDetailsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');

  // Generate QR code data URL
  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    
    generateQR();
  }, [redirectUrl]);
  
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => 
      updateDynamicQRCode(id, { active }),
    onSuccess: (updatedQrCode) => {
      queryClient.invalidateQueries({ queryKey: ['dynamicQrCode', qrCode.id] });
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
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(redirectUrl);
    toast({
      title: 'Link copied',
      description: 'QR code link copied to clipboard',
    });
  };

  const handleToggleActive = () => {
    toggleActiveMutation.mutate({
      id: qrCode.id,
      active: !qrCode.active
    });
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{qrCode.name}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-md border shadow-sm">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl}
              alt={`QR code for ${qrCode.name}`}
              className="w-44 h-44"
            />
          ) : (
            <div className="w-44 h-44 bg-gray-200 rounded animate-pulse flex items-center justify-center text-sm text-gray-500">
              Generating QR...
            </div>
          )}
        </div>
        
        <div className="w-full space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Target URL</h4>
            <p className="text-sm text-muted-foreground break-all">
              {qrCode.target_url}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">QR Code Link</h4>
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground truncate flex-1">
                {redirectUrl}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopyLink}
              >
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Status</h4>
            <Badge 
              variant={qrCode.active ? "default" : "secondary"} 
              className={qrCode.active ? "bg-green-500" : "bg-red-500"}
            >
              {qrCode.active ? "Active" : "Paused"}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 space-y-2">
        <Button 
          variant={qrCode.active ? "destructive" : "default"}
          className="w-full" 
          onClick={handleToggleActive}
          disabled={toggleActiveMutation.isPending}
        >
          {qrCode.active ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause QR Code
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Activate QR Code
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit QR Code
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCodeDetails;
