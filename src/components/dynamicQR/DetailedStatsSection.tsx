
import ScansOverTimeChart from './ScansOverTimeChart';
import CountryDistributionChart from './CountryDistributionChart';
import RecentScansCard from './RecentScansCard';
import { DynamicQRScan } from '@/lib/api';

interface DetailedStatsSectionProps {
  barChartData: Array<{ date: string; scans: number }>;
  pieChartData: Array<{ name: string; value: number }>;
  scans: DynamicQRScan[];
  colors: string[];
}

const DetailedStatsSection = ({ barChartData, pieChartData, scans, colors }: DetailedStatsSectionProps) => {
  return (
    <div className="space-y-6">
      <ScansOverTimeChart scansData={barChartData} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CountryDistributionChart countryData={pieChartData} colors={colors} />
        <RecentScansCard scans={scans} />
      </div>
    </div>
  );
};

export default DetailedStatsSection;
