
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
    console.log('Processing bar chart data:', scanStats);
    
    if (!scanStats || !scanStats.scansByDate) {
      console.log('No scan stats or scansByDate available');
      return [];
    }
    
    const chartData = Object.entries(scanStats.scansByDate)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
    
    console.log('Processed bar chart data:', chartData);
    return chartData;
  }, [scanStats]);

  const pieChartData = useMemo(() => {
    console.log('Processing pie chart data:', scanStats);
    
    if (!scanStats || !scanStats.scansByCountry) {
      console.log('No scan stats or scansByCountry available');
      return [];
    }
    
    const chartData = Object.entries(scanStats.scansByCountry)
      .map(([country, count]) => ({
        name: country,
        value: count as number,
      }))
      .sort((a, b) => b.value - a.value);
    
    console.log('Processed pie chart data:', chartData);
    return chartData;
  }, [scanStats]);

  const firstScan = useMemo(() => {
    console.log('Processing first scan:', scanStats?.rawScans);
    
    if (!scanStats?.rawScans || scanStats.rawScans.length === 0) {
      console.log('No raw scans available');
      return null;
    }
    
    // Since scans are ordered by scanned_at descending, the first scan chronologically is the last in the array
    const chronologicallyFirstScan = scanStats.rawScans[scanStats.rawScans.length - 1];
    console.log('First scan found:', chronologicallyFirstScan);
    return chronologicallyFirstScan;
  }, [scanStats]);

  const uniqueCountries = useMemo(() => {
    console.log('Processing unique countries:', scanStats?.scansByCountry);
    
    if (!scanStats?.scansByCountry) {
      console.log('No scansByCountry available');
      return 0;
    }
    
    const count = Object.keys(scanStats.scansByCountry).length;
    console.log('Unique countries count:', count);
    return count;
  }, [scanStats]);

  return {
    barChartData,
    pieChartData,
    firstScan,
    uniqueCountries,
  };
};

export default useDynamicQRStats;
