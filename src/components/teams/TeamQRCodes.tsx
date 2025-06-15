
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Eye, Download, MoreHorizontal } from 'lucide-react';
import { QRCode } from '@/lib/api/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamQRCodesProps {
  teamId: string;
  qrCodes: QRCode[];
}

const TeamQRCodes = ({ teamId, qrCodes }: TeamQRCodesProps) => {
  if (qrCodes.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No team QR codes</h3>
        <p className="text-muted-foreground">
          QR codes created for this team will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg truncate">{qrCode.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{qrCode.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {qrCode.scan_count} scans
              </span>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="aspect-square bg-white rounded-lg border flex items-center justify-center mb-3">
              <QrCode className="h-16 w-16 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {qrCode.content}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Created {new Date(qrCode.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeamQRCodes;
