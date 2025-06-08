
import { useMemo } from 'react';
import { DynamicQRScan } from '@/lib/api';

interface UseQRStatsResult {
  barChartData: Array<{ date: string; scans: number }>;
  pieChartData: Array<{ name: string; value: number }>;
  firstScan: DynamicQRScan | null;
  uniqueCountries: number;
}

export interface QRStatData {
  totalScans: number;
  scansByDate: Record<string, number>;
  scansByCountry: Record<string, number>;
  rawScans: DynamicQRScan[];
}

const useDynamicQRStats = (scanStats: QRStatData | undefined): UseQRStatsResult => {
  const barChartData = useMemo(() => {
    if (!scanStats || !scanStats.scansByDate) {
      return [];
    }
    
    const chartData = Object.entries(scanStats.scansByDate)
      .map(([date, count]) => {
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: formattedDate,
          scans: count,
        };
      })
      .sort((a, b) => {
        // Sort by actual date, not formatted string
        const dateA = Object.entries(scanStats.scansByDate).find(([_, count]) => count === a.scans)?.[0];
        const dateB = Object.entries(scanStats.scansByDate).find(([_, count]) => count === b.scans)?.[0];
        return new Date(dateA || '').getTime() - new Date(dateB || '').getTime();
      })
      .slice(-14); // Last 14 days
    
    return chartData;
  }, [scanStats]);

  const pieChartData = useMemo(() => {
    if (!scanStats || !scanStats.scansByCountry) {
      return [];
    }
    
    const chartData = Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => ({
        name: country,
        value: count as number,
      }))
      .sort((a, b) => b.value - a.value);
    
    return chartData;
  }, [scanStats]);

  const firstScan = useMemo(() => {
    if (!scanStats?.rawScans || scanStats.rawScans.length === 0) {
      return null;
    }
    
    // Since scans are ordered by scanned_at descending, the first scan chronologically is the last in the array
    const chronologicallyFirstScan = scanStats.rawScans[scanStats.rawScans.length - 1];
    return chronologicallyFirstScan;
  }, [scanStats]);

  const uniqueCountries = useMemo(() => {
    if (!scanStats?.scansByCountry) {
      return 0;
    }
    
    const countries = Object.keys(scanStats.scansByCountry);
    return countries.length;
  }, [scanStats]);

  return {
    barChartData,
    pieChartData,
    firstScan,
    uniqueCountries,
  };
};

export default useDynamicQRStats;
