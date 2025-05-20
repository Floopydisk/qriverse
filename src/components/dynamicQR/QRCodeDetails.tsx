
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
import { Pencil, Link2 } from 'lucide-react';
import { DynamicQRCode, getDynamicQRRedirectUrl } from '@/lib/api';

interface QRCodeDetailsProps {
  qrCode: DynamicQRCode;
  onEdit: () => void;
}

const QRCodeDetails = ({ qrCode, onEdit }: QRCodeDetailsProps) => {
  const redirectUrl = getDynamicQRRedirectUrl(qrCode.short_code);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(redirectUrl);
    alert('Link copied to clipboard!');
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
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(redirectUrl)}`}
            alt={`QR code for ${qrCode.name}`}
            className="w-44 h-44"
          />
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
              {qrCode.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
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
