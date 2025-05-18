
import { User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DynamicQRScan } from '@/lib/api';

interface RecentScansCardProps {
  scans: DynamicQRScan[];
}

const RecentScansCard = ({ scans }: RecentScansCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Recent Scans
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto max-h-64">
          {scans && scans.length > 0 ? (
            <div className="space-y-3">
              {scans.slice(0, 10).map((scan) => (
                <div key={scan.id} className="border-b pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">
                        {format(new Date(scan.scanned_at), 'PPp')}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {scan.country ? `${scan.city || ''} ${scan.country}` : 'Location unknown'}
                      </div>
                    </div>
                    {scan.user_agent && (
                      <div className="text-xs text-right text-muted-foreground max-w-[50%] truncate">
                        {scan.user_agent.split(' ')[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No scan data available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentScansCard;
