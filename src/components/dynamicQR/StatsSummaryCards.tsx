
import { ChartPie, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DynamicQRScan } from '@/lib/api';

interface StatsSummaryCardsProps {
  totalScans: number;
  uniqueCountries: number;
  firstScan: DynamicQRScan | null;
}

const StatsSummaryCards = ({ totalScans, uniqueCountries, firstScan }: StatsSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ChartPie className="h-4 w-4 mr-2 text-primary" />
            Total Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalScans}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Globe className="h-4 w-4 mr-2 text-primary" />
            Countries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{uniqueCountries}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            First Scan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {firstScan 
              ? format(new Date(firstScan.scanned_at), 'PP')
              : 'No scans yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryCards;
