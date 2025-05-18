
import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Copy, Download, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DynamicQRCode, getDynamicQRRedirectUrl } from '@/lib/api';

interface QRCodeDetailsProps {
  qrCode: DynamicQRCode;
  onEdit: () => void;
}

const QRCodeDetails = ({ qrCode, onEdit }: QRCodeDetailsProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const generateQrImage = async () => {
      try {
        const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
        const dataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 800,
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
    
    generateQrImage();
  }, [qrCode]);

  const handleCopyLink = () => {
    const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
    navigator.clipboard.writeText(redirectUrl);
    
    toast({
      title: 'Link copied',
      description: 'QR code link copied to clipboard',
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `dynamic-qr-${qrCode.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'QR Code downloaded',
      description: 'Your dynamic QR code has been downloaded',
    });
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>{qrCode.name}</CardTitle>
        <CardDescription>Dynamic QR Code Details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qrDataUrl && (
          <div className="bg-white p-4 rounded-lg mb-6">
            <img 
              src={qrDataUrl} 
              alt={`QR code for ${qrCode.name}`}
              className="w-48 h-48 object-contain"
            />
          </div>
        )}
        
        <div className="w-full space-y-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Target URL:</p>
            <div className="flex items-center">
              <Link className="h-3.5 w-3.5 mr-1 text-primary" />
              <p className="text-sm truncate flex-1">
                {qrCode.target_url}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">QR Code Link:</p>
            <p className="text-sm truncate">{getDynamicQRRedirectUrl(qrCode.short_code)}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status:</p>
            <p className={`text-sm font-medium ${qrCode.active ? 'text-green-600' : 'text-red-600'}`}>
              {qrCode.active ? 'Active' : 'Inactive'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created:</p>
            <p className="text-sm">
              {format(new Date(qrCode.created_at), 'PPP')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <Button 
            onClick={handleCopyLink}
            variant="outline"
            className="w-full"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy QR Link
          </Button>
          <Button
            onClick={handleDownloadQR}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
          <Button
            onClick={onEdit}
            variant="secondary"
            className="w-full"
          >
            <Link className="mr-2 h-4 w-4" />
            Change Target URL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDetails;
